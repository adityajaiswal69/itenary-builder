import React, { useState, useEffect, useRef } from 'react';
import type { Itinerary } from '../services/api';

interface PDFPreviewProps {
  itinerary: Itinerary;
  currentPackage?: any;
}

export const PDFPreview: React.FC<PDFPreviewProps> = ({ itinerary, currentPackage }) => {
  const [imageBase64Map, setImageBase64Map] = useState<Map<string, string>>(new Map());
  const [loadingImages, setLoadingImages] = useState(false);
  const [imageErrors, setImageErrors] = useState<string[]>([]);
  const [previewContent, setPreviewContent] = useState<string>('');
  const previewRef = useRef<HTMLDivElement>(null);

  // Helper function to convert image to base64 using multiple strategies
  const convertImageToBase64 = async (imageSrc: string): Promise<string> => {
    try {
      // If it's already a data URL, return as is
      if (imageSrc.startsWith('data:')) {
        return imageSrc;
      }
      
      console.log(`Converting image: ${imageSrc}`);
      
      // Strategy 1: Try direct fetch with no-cors mode (bypasses CORS)
      try {
        const response = await fetch(imageSrc, {
          mode: 'no-cors',
          cache: 'no-cache'
        });
        
        if (response.type === 'opaque') {
          // Opaque response means it loaded but we can't read it directly
          // This is actually good - it means the image loaded successfully
          console.log(`Image loaded via no-cors: ${imageSrc.substring(imageSrc.lastIndexOf('/') + 1)}`);
          
          // Create a new image element to load the image
          return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
              try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                if (!ctx) {
                  resolve(createImagePlaceholder());
                  return;
                }
                
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
                ctx.drawImage(img, 0, 0);
                
                const dataURL = canvas.toDataURL('image/jpeg', 0.9);
                console.log(`Successfully converted image via canvas: ${imageSrc.substring(imageSrc.lastIndexOf('/') + 1)}`);
                resolve(dataURL);
              } catch (canvasError) {
                console.warn('Canvas conversion failed:', canvasError);
                resolve(createImagePlaceholder());
              }
            };
            
            img.onerror = () => {
              console.warn('Image load failed in no-cors mode');
              resolve(createImagePlaceholder());
            };
            
            img.src = imageSrc;
          });
        }
      } catch (noCorsError) {
        console.warn('No-cors fetch failed:', noCorsError);
      }
      
      // Strategy 2: Try with CORS mode
      try {
        const response = await fetch(imageSrc, {
          mode: 'cors',
          credentials: 'omit',
          headers: {
            'Accept': 'image/*',
          },
        });
        
        if (response.ok) {
          const blob = await response.blob();
          
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              const dataURL = reader.result as string;
              console.log(`Successfully converted image via CORS fetch: ${imageSrc.substring(imageSrc.lastIndexOf('/') + 1)}`);
              resolve(dataURL);
            };
            reader.onerror = () => {
              console.warn('Failed to convert blob to base64:', imageSrc);
              resolve(createImagePlaceholder());
            };
            reader.readAsDataURL(blob);
          });
        }
      } catch (corsError) {
        console.warn('CORS fetch failed:', corsError);
      }
      
      // Strategy 3: Direct image loading with anonymous crossOrigin
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        const timeout = setTimeout(() => {
          console.warn(`Image load timeout for: ${imageSrc}`);
          resolve(createImagePlaceholder());
        }, 15000);
        
        img.onload = () => {
          clearTimeout(timeout);
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              resolve(createImagePlaceholder());
              return;
            }
            
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            ctx.drawImage(img, 0, 0);
            
            const dataURL = canvas.toDataURL('image/jpeg', 0.9);
            console.log(`Successfully converted image via direct loading: ${imageSrc.substring(imageSrc.lastIndexOf('/') + 1)}`);
            resolve(dataURL);
          } catch (canvasError) {
            console.warn('Canvas conversion failed in direct loading:', canvasError);
            resolve(createImagePlaceholder());
          }
        };
        
        img.onerror = () => {
          clearTimeout(timeout);
          console.warn(`Image load failed for: ${imageSrc}`);
          resolve(createImagePlaceholder());
        };
        
        img.src = imageSrc;
      });
      
    } catch (error) {
      console.warn('Image conversion failed:', imageSrc, error);
      return createImagePlaceholder();
    }
  };

  // Helper function to create a better image placeholder
  const createImagePlaceholder = () => {
    // Create a simple canvas-based placeholder that html2canvas can handle
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Draw a simple placeholder
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, 300, 200);
      
      ctx.strokeStyle = '#d1d5db';
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 10, 280, 180);
      
      ctx.fillStyle = '#6b7280';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('📷', 150, 80);
      
      ctx.font = '12px Arial';
      ctx.fillText('Image Unavailable', 150, 120);
    }
    
    return canvas.toDataURL('image/png');
  };

  // Generate PDF content with base64 images
  const generatePDFContent = (imageMap: Map<string, string> = new Map()) => {
    const days = itinerary.content?.days || [];
    const user = itinerary.user;
    const locations = currentPackage?.locations || [];
    
    // Helper function to create smart image grid with base64 images
    const createImageGrid = (images: string[], maxImages: number = 4) => {
      if (!images || images.length === 0) return '';
      
      const displayImages = images.slice(0, maxImages);
      const remainingCount = images.length - maxImages;
      
      if (displayImages.length === 1) {
        return `
          <div style="margin: 20px 0; text-align: center;">
            <img src="${imageMap.get(displayImages[0]) || displayImages[0]}" alt="Event image" style="max-width: 100%; max-height: 200px; object-fit: cover; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
          </div>
        `;
      }
      
      if (displayImages.length === 2) {
        return `
          <div style="display: flex; gap: 15px; margin: 20px 0;">
            ${displayImages.map(img => `
              <div style="flex: 1;">
                <img src="${imageMap.get(img) || img}" alt="Event image" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
              </div>
            `).join('')}
          </div>
        `;
      }
      
      if (displayImages.length === 3) {
        return `
          <div style="display: flex; gap: 10px; margin: 20px 0;">
            <div style="flex: 2;">
              <img src="${imageMap.get(displayImages[0]) || displayImages[0]}" alt="Event image" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; gap: 10px;">
              <img src="${imageMap.get(displayImages[1]) || displayImages[1]}" alt="Event image" style="width: 100%; height: 95px; object-fit: cover; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
              <img src="${imageMap.get(displayImages[2]) || displayImages[2]}" alt="Event image" style="width: 100%; height: 95px; object-fit: cover; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
            </div>
          </div>
        `;
      }
      
      // 4+ images - 2x2 grid
      return `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 20px 0;">
          ${displayImages.map(img => `
            <div>
              <img src="${imageMap.get(img) || img}" alt="Event image" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
            </div>
          `).join('')}
          ${remainingCount > 0 ? `
            <div style="display: flex; align-items: center; justify-content: center; background: #f8f9fa; border: 2px dashed #dee2e6; border-radius: 8px; height: 120px; color: #6c757d; font-size: 14px; font-weight: 500;">
              +${remainingCount} more
            </div>
          ` : ''}
        </div>
      `;
    };
    
    // Helper function to create simple footer
    const createFooter = (pageNumber: number) => `
      <div style="position: absolute; bottom: 20px; left: 40px; right: 40px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 15px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; gap: 30px;">
            ${user?.phone ? `<span><strong>Mobile:</strong> ${user.phone}</span>` : ''}
            ${user?.email ? `<span><strong>Email:</strong> ${user.email}</span>` : ''}
          </div>
          <div style="font-weight: 600;">Page ${pageNumber}</div>
        </div>
      </div>
    `;
    
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.4; color: #333; width: 210mm; padding: 0; margin: 0;">
        <!-- Page 1: Cover Page with Header Image -->
        <div style="position: relative; min-height: 297mm; padding-bottom: 60px;">
          <!-- Header Image Section -->
          <div style="position: relative; height: 200px; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%); margin: 0; overflow: hidden;">
            ${itinerary.cover_image ? `
              <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: url('${imageMap.get(itinerary.cover_image) || itinerary.cover_image}'); background-size: cover; background-position: center; opacity: 0.3;"></div>
            ` : ''}
            <div style="position: relative; z-index: 2; text-align: center; padding: 60px 40px; color: white;">
              <h1 style="font-size: 32px; font-weight: bold; margin: 0 0 10px 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">DETAILED ITINERARY</h1>
              <h2 style="font-size: 24px; font-weight: 600; margin: 0; text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">${itinerary.title}</h2>
            </div>
          </div>
          
          <!-- Company Logo Section -->
          <div style="text-align: center; padding: 30px 40px 20px;">
            <div style="display: inline-block; background: #f8f9fa; padding: 20px 30px; border-radius: 12px; border: 2px solid #e5e7eb;">
              <div style="font-size: 20px; font-weight: bold; color: #1f2937; margin-bottom: 5px;">HUTS IN HILLS</div>
              <div style="font-size: 12px; color: #6b7280;">Travel & Tourism</div>
            </div>
          </div>

          <!-- Package Details Section -->
          <div style="padding: 40px; background: white;">
            <!-- Package Title -->
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="font-size: 28px; font-weight: bold; margin: 0 0 10px 0; color: #1f2937;">${itinerary.title}</h2>
              <div style="background: #fef3c7; padding: 15px 25px; border-radius: 8px; display: inline-block; margin: 10px 0;">
                <p style="margin: 0; color: #92400e; font-weight: 600; font-size: 16px;">
                  ${currentPackage?.start_location || 'Delhi'}, ${locations.join(', ')} - ${currentPackage?.people || 1} Nights Stay
                </p>
              </div>
            </div>
            
            <!-- Package Info Grid -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
                <h4 style="font-size: 16px; font-weight: 600; margin: 0 0 15px 0; color: #374151;">Package Details</h4>
                <div style="font-size: 14px; color: #4b5563; line-height: 1.6;">
                  <div style="margin-bottom: 8px;"><strong>Date of Travel:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  <div style="margin-bottom: 8px;"><strong>Number of Pax:</strong> ${currentPackage?.people || 1} Adults</div>
                  <div style="margin-bottom: 8px;"><strong>Number of Rooms:</strong> ${Math.ceil((currentPackage?.people || 1) / 2)} Rooms</div>
                  <div><strong>Mode of Transport:</strong> Tempo Traveler</div>
                </div>
              </div>
              
              <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border: 1px solid #bbf7d0;">
                <h4 style="font-size: 16px; font-weight: 600; margin: 0 0 15px 0; color: #166534;">Total Cost</h4>
                <div style="text-align: center;">
                  <div style="font-size: 24px; font-weight: bold; color: #166534; margin-bottom: 5px;">
                    ₹ (INR) ${currentPackage?.price?.toLocaleString() || '0'}
                  </div>
                  <div style="font-size: 12px; color: #15803d;">
                    ${currentPackage?.price_type === 'per_person' ? 'Per Person' : 'Total Package'}
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Greeting Section -->
            <div style="margin-bottom: 30px;">
              <h3 style="font-size: 18px; font-weight: 600; margin: 0 0 15px 0; color: #1f2937;">Dear Sir,</h3>
              <p style="font-size: 14px; color: #4b5563; line-height: 1.6; margin: 0;">
                Thank you for choosing Huts In Hills for your travel needs. We are pleased to present you with this detailed itinerary for your upcoming journey. 
                The detailed cost breakdown will be provided at the end of this document.
              </p>
            </div>
            
            <!-- Our Values Section -->
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #f59e0b;">
              <h4 style="font-size: 16px; font-weight: 600; margin: 0 0 10px 0; color: #92400e;">Our Values</h4>
              <p style="font-size: 14px; color: #92400e; margin: 0; line-height: 1.6;">
                We are committed to creating memorable and seamless travel experiences for our clients. 
                Our team ensures that every detail of your journey is carefully planned and executed to perfection.
              </p>
            </div>

            <!-- Contact Information -->
            <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #3b82f6;">
              <h4 style="font-size: 16px; font-weight: 600; margin: 0 0 15px 0; color: #1e40af;">For more info:</h4>
              <div style="font-size: 14px; color: #1e40af; line-height: 1.6;">
                <div style="margin-bottom: 8px;"><strong>Website:</strong> www.hutsinhills.com</div>
                <div style="margin-bottom: 8px;"><strong>Email:</strong> ${user?.email || 'info@hutsinhills.com'}</div>
                <div style="margin-bottom: 8px;"><strong>Regards (For any enquiries, please feel free to call us):</strong></div>
                <div style="margin-bottom: 4px;"><strong>Manjeet Agarwal:</strong> ${user?.phone || '98006 38868'}</div>
                <div style="margin-bottom: 4px;"><strong>Mandeep (Office):</strong> 80011 60622</div>
                <div><strong>Address:</strong> India</div>
              </div>
            </div>

            <!-- Page 1 Footer -->
            ${createFooter(1)}
          </div>
        </div>
        
        <!-- Day Wise Details Pages -->
        ${days.map((day: any, dayIndex: number) => `
          <div style="page-break-before: always; font-family: Arial, sans-serif; line-height: 1.4; color: #333; width: 210mm; padding: 40px; margin: 0; min-height: 297mm; background: white; position: relative; padding-bottom: 80px; page-break-inside: avoid;">
            <!-- Day Header -->
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 10px 0; color: #1f2937;">Day ${dayIndex + 1}: ${day.title}</h1>
              <div style="background: #f3f4f6; padding: 8px 16px; border-radius: 20px; display: inline-block; font-size: 14px; color: #6b7280;">
                ${new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
            
            <!-- Day Description -->
            <div style="margin-bottom: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #3b82f6;">
              <p style="font-size: 14px; color: #4b5563; margin: 0; line-height: 1.6;">
                ${day.events?.length > 0 ? 
                  `Start your day with a hearty breakfast at the hotel 🥞 and get ready to explore the amazing destinations and activities planned for today!` :
                  `A relaxing day awaits you with plenty of time to explore and enjoy the beautiful surroundings.`
                }
              </p>
            </div>
            
            <!-- Events with Smart Image Grid -->
            ${day.events?.map((event: any) => `
              <div style="margin-bottom: 30px; page-break-inside: avoid;">
                <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                  <!-- Event Header -->
                  <div style="background: #f8f9fa; padding: 15px 20px; border-bottom: 1px solid #e5e7eb;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <span style="background: #3b82f6; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">
                        ${event.category || 'Activity'}
                      </span>
                      <h3 style="font-size: 16px; font-weight: 600; margin: 0; color: #1f2937;">${event.title}</h3>
                    </div>
                  </div>
                  
                  <!-- Event Content -->
                  <div style="padding: 20px;">
                    ${event.notes ? `
                      <div style="margin-bottom: 15px;">
                        <p style="font-size: 14px; color: #4b5563; margin: 0; line-height: 1.6;">
                          ${event.notes.replace(/<[^>]*>/g, '').substring(0, 300)}${event.notes.length > 300 ? '...' : ''}
                        </p>
                      </div>
                    ` : ''}
                    
                    ${event.images && event.images.length > 0 ? createImageGrid(event.images, 4) : ''}
                  </div>
                </div>
              </div>
            `).join('') || `
              <div style="text-align: center; padding: 40px; color: #6b7280;">
                <p style="font-size: 16px; margin: 0;">No specific activities planned for this day.</p>
                <p style="font-size: 14px; margin: 10px 0 0 0;">Enjoy your free time exploring the destination!</p>
              </div>
            `}
            
            <!-- Day Footer -->
            <div style="margin-top: 30px; padding: 15px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #22c55e;">
              <p style="font-size: 14px; color: #166534; margin: 0; font-style: italic;">
                Transfer to ${dayIndex < days.length - 1 ? 'next destination' : 'home'}, check in to the hotel in the evening to relax after a wonderful day 🏨
              </p>
            </div>
            
            <!-- Day Page Footer -->
            ${createFooter(dayIndex + 2)}
          </div>
        `).join('')}
      </div>
    `;
  };

  // Load and convert all images
  const loadImages = async () => {
    if (!itinerary) return;

    setLoadingImages(true);
    setImageErrors([]);

    // Collect all images from the itinerary
    const allImages: string[] = [];
    const days = itinerary.content?.days || [];
    
    // Collect images from cover image
    if (itinerary.cover_image) {
      allImages.push(itinerary.cover_image);
    }
    
    // Collect images from events
    days.forEach((day: any) => {
      if (day.events) {
        day.events.forEach((event: any) => {
          if (event.images && event.images.length > 0) {
            allImages.push(...event.images);
          }
        });
      }
    });

    console.log(`Found ${allImages.length} images to process`);

    // Convert all images to base64
    const newImageBase64Map = new Map<string, string>();
    const errors: string[] = [];

    if (allImages.length > 0) {
      console.log('Converting images to base64...');
      const imagePromises = allImages.map(async (imageSrc) => {
        try {
          const base64 = await convertImageToBase64(imageSrc);
          newImageBase64Map.set(imageSrc, base64);
          console.log(`Converted image: ${imageSrc.substring(imageSrc.lastIndexOf('/') + 1)}`);
        } catch (error) {
          console.warn(`Failed to convert image: ${imageSrc}`, error);
          errors.push(imageSrc);
          // Use placeholder
          newImageBase64Map.set(imageSrc, createImagePlaceholder());
        }
      });

      await Promise.all(imagePromises);
      console.log('All images processed');
    }

    setImageBase64Map(newImageBase64Map);
    setImageErrors(errors);
    setLoadingImages(false);
  };

  // Test PDF generation with current images
  const testPDFGeneration = async () => {
    if (!itinerary) return;

    console.log('Testing PDF generation with current image map...');
    console.log('Image map size:', imageBase64Map.size);
    console.log('Image map contents:', Array.from(imageBase64Map.entries()));

    // Generate PDF content with current images
    const pdfContent = generatePDFContent(imageBase64Map);

    // Create a temporary container for testing
    const testContainer = document.createElement('div');
    testContainer.style.position = 'absolute';
    testContainer.style.left = '-9999px';
    testContainer.style.top = '0';
    testContainer.style.width = '210mm';
    testContainer.style.backgroundColor = 'white';
    testContainer.style.margin = '0';
    testContainer.style.padding = '0';
    testContainer.style.fontFamily = 'Arial, sans-serif';
    
    testContainer.innerHTML = pdfContent;
    document.body.appendChild(testContainer);

    // Wait for images to load
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check if images are loaded
    const imageElements = testContainer.querySelectorAll('img');
    console.log(`Found ${imageElements.length} image elements in test container`);
    
    imageElements.forEach((img, index) => {
      console.log(`Image ${index + 1}:`, {
        src: img.src.substring(0, 100) + '...',
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        width: img.width,
        height: img.height
      });
    });

    // Clean up
    document.body.removeChild(testContainer);
  };

  // Generate preview content
  useEffect(() => {
    const content = generatePDFContent(imageBase64Map);
    setPreviewContent(content);
  }, [imageBase64Map, itinerary, currentPackage]);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Controls */}
      <div className="bg-gray-100 p-4 border-b">
        <div className="flex items-center gap-4">
          <button
            onClick={loadImages}
            disabled={loadingImages}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loadingImages ? 'Loading Images...' : 'Load Images'}
          </button>
          
          <button
            onClick={testPDFGeneration}
            disabled={imageBase64Map.size === 0}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Test PDF Generation
          </button>
          
          <div className="text-sm text-gray-600">
            Images: {imageBase64Map.size} loaded, {imageErrors.length} errors
          </div>
          
          {imageErrors.length > 0 && (
            <div className="text-sm text-red-600">
              {imageErrors.length} images failed to load
            </div>
          )}
        </div>
      </div>

      {/* Preview Container */}
      <div className="flex-1 overflow-auto bg-gray-200 p-4">
        <div className="mx-auto bg-white shadow-lg" style={{ width: '210mm', minHeight: '297mm' }}>
          <div
            ref={previewRef}
            dangerouslySetInnerHTML={{ __html: previewContent }}
            style={{
              fontFamily: 'Arial, sans-serif',
              lineHeight: '1.4',
              color: '#333',
              width: '210mm',
              padding: '0',
              margin: '0'
            }}
          />
        </div>
      </div>
    </div>
  );
};
