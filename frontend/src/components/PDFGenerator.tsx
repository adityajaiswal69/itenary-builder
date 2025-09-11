import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Itinerary } from '../services/api';

interface PDFGeneratorProps {
  itinerary: Itinerary;
  currentPackage?: any;
  onGenerating?: (isGenerating: boolean) => void;
}

export const usePDFGenerator = ({ 
  itinerary, 
  currentPackage, 
  onGenerating 
}: PDFGeneratorProps) => {
  
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

  const generatePDFContent = (imageBase64Map: Map<string, string> = new Map()) => {
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
            <img src="${imageBase64Map.get(displayImages[0]) || displayImages[0]}" alt="Event image" style="max-width: 100%; max-height: 200px; object-fit: cover; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
          </div>
        `;
      }
      
      if (displayImages.length === 2) {
        return `
          <div style="display: flex; gap: 15px; margin: 20px 0;">
            ${displayImages.map(img => `
              <div style="flex: 1;">
                <img src="${imageBase64Map.get(img) || img}" alt="Event image" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
              </div>
            `).join('')}
          </div>
        `;
      }
      
      if (displayImages.length === 3) {
        return `
          <div style="display: flex; gap: 10px; margin: 20px 0;">
            <div style="flex: 2;">
              <img src="${imageBase64Map.get(displayImages[0]) || displayImages[0]}" alt="Event image" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; gap: 10px;">
              <img src="${imageBase64Map.get(displayImages[1]) || displayImages[1]}" alt="Event image" style="width: 100%; height: 95px; object-fit: cover; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
              <img src="${imageBase64Map.get(displayImages[2]) || displayImages[2]}" alt="Event image" style="width: 100%; height: 95px; object-fit: cover; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
            </div>
          </div>
        `;
      }
      
      // 4+ images - 2x2 grid
      return `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 20px 0;">
          ${displayImages.map(img => `
            <div>
              <img src="${imageBase64Map.get(img) || img}" alt="Event image" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
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
      <div style="font-family: Arial, sans-serif; line-height: 1.4; color: #333; width: 210mm; padding: 0; margin: 0; page-break-inside: avoid;">
        <!-- Page 1: Cover Page with Header Image -->
        <div style="position: relative; min-height: 297mm; padding-bottom: 60px; page-break-after: always;">
           <!-- Header Image Section -->
           <div style="position: relative; height: 200px; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%); margin: 0; overflow: hidden;">
             ${itinerary.cover_image ? `
               <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: url('${imageBase64Map.get(itinerary.cover_image) || itinerary.cover_image}'); background-size: cover; background-position: center; opacity: 0.3;"></div>
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
        
        <!-- Page 2: Package Summary -->
        <div style="page-break-before: always; font-family: Arial, sans-serif; line-height: 1.4; color: #333; width: 210mm; padding: 40px; margin: 0; min-height: 297mm; background: white; position: relative; padding-bottom: 80px; page-break-after: always;">
          <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 30px; border-radius: 12px; margin-bottom: 40px; border: 2px solid #cbd5e1; text-align: center;">
            <h1 style="font-size: 28px; font-weight: 700; margin: 0; color: #1f2937;">Package Summary</h1>
            <p style="font-size: 14px; color: #6b7280; margin: 10px 0 0 0;">Detailed overview of your travel package</p>
          </div>
          
          <h2 style="font-size: 28px; font-weight: bold; margin: 0 0 20px 0; color: #2d3748;">${itinerary.title}</h2>
          
          <div style="background: #fed7cc; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <p style="margin: 0; color: #7c2d12; font-weight: 500;">${currentPackage?.start_location || 'Delhi'}, ${locations.join(', ')} - ${currentPackage?.people || 1} Nights Stay</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; page-break-inside: avoid;">
            <tbody>
              ${days.map((day: any, index: number) => `
                <tr style="border-bottom: 1px solid #e2e8f0; page-break-inside: avoid;">
                  <td style="padding: 15px; background: #f8fafc; border-right: 1px solid #e2e8f0; font-weight: 600; color: #4a5568; width: 150px; vertical-align: top;">
                    Day ${index + 1}<br/>
                    <span style="font-size: 12px; font-weight: normal; color: #718096;">
                      (${new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })})
                    </span>
                  </td>
                  <td style="padding: 15px; color: #4a5568; vertical-align: top;">
                    ${day.title} Details
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <!-- Page 2 Footer -->
          ${createFooter(2)}
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

        <!-- Inclusions & Exclusions Page -->
        <div style="page-break-before: always; font-family: Arial, sans-serif; line-height: 1.4; color: #333; width: 210mm; padding: 40px; margin: 0; min-height: 297mm; background: white; position: relative; padding-bottom: 80px; page-break-inside: avoid;">
          <!-- Page Header -->
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 10px 0; color: #1f2937;">Inclusions & Exclusions</h1>
            <p style="font-size: 14px; color: #6b7280; margin: 0;">What's included and excluded in your package</p>
          </div>

          <!-- Inclusions Section -->
          ${currentPackage?.inclusions?.length ? `
            <div style="margin-bottom: 30px; page-break-inside: avoid;">
              <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; border-left: 4px solid #22c55e;">
                <h3 style="font-size: 18px; font-weight: 600; margin: 0 0 15px 0; color: #166534;">✓ Inclusions</h3>
                <div style="font-size: 14px; color: #374151; line-height: 1.6;">
                  ${currentPackage.inclusions.map((inclusion: string) => `
                    <div style="margin-bottom: 8px; display: flex; align-items: flex-start;">
                      <span style="color: #22c55e; font-weight: bold; margin-right: 8px; margin-top: 2px;">•</span>
                      <span>${inclusion}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          ` : ''}

          <!-- Exclusions Section -->
          ${currentPackage?.exclusions?.length ? `
            <div style="margin-bottom: 30px; page-break-inside: avoid;">
              <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444;">
                <h3 style="font-size: 18px; font-weight: 600; margin: 0 0 15px 0; color: #dc2626;">✗ Exclusions</h3>
                <div style="font-size: 14px; color: #374151; line-height: 1.6;">
                  ${currentPackage.exclusions.map((exclusion: string) => `
                    <div style="margin-bottom: 8px; display: flex; align-items: flex-start;">
                      <span style="color: #ef4444; font-weight: bold; margin-right: 8px; margin-top: 2px;">•</span>
                      <span>${exclusion}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          ` : ''}

          <!-- Important Information -->
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 30px; border-left: 4px solid #f59e0b;">
            <h3 style="font-size: 18px; font-weight: 600; margin: 0 0 15px 0; color: #92400e;">Important Information</h3>
            <div style="font-size: 14px; color: #92400e; line-height: 1.6;">
              <div style="margin-bottom: 8px;">• All prices are subject to availability and may change without notice</div>
              <div style="margin-bottom: 8px;">• Cancellation charges apply as per company policy</div>
              <div style="margin-bottom: 8px;">• Travel insurance is recommended but not included</div>
              <div style="margin-bottom: 8px;">• Valid ID proof required for all travelers</div>
              <div>• Check visa requirements for international destinations</div>
            </div>
          </div>

          <!-- Inclusions & Exclusions Page Footer -->
          ${createFooter(days.length + 2)}
        </div>

        <!-- Final Page with Contact Information -->
        <div style="page-break-before: always; font-family: Arial, sans-serif; line-height: 1.4; color: #333; width: 210mm; padding: 40px; margin: 0; min-height: 297mm; background: white; position: relative; padding-bottom: 80px; page-break-inside: avoid;">
          <!-- Page Header -->
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 10px 0; color: #1f2937;">Contact Information</h1>
            <p style="font-size: 14px; color: #6b7280; margin: 0;">Get in touch with us for any queries</p>
          </div>

          <!-- Contact Details -->
          <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 30px; text-align: center;">
            <h3 style="font-size: 20px; font-weight: 600; margin: 0 0 20px 0; color: #1f2937;">HUTS IN HILLS</h3>
            <div style="font-size: 14px; color: #4b5563; line-height: 1.8;">
              <div style="margin-bottom: 10px;"><strong>Website:</strong> www.hutsinhills.com</div>
              <div style="margin-bottom: 10px;"><strong>Email:</strong> ${user?.email || 'info@hutsinhills.com'}</div>
              <div style="margin-bottom: 10px;"><strong>Phone:</strong> ${user?.phone || '98006 38868'}</div>
              <div><strong>Address:</strong> India</div>
            </div>
          </div>

          <!-- Environmental Notice -->
          <div style="text-align: center; padding: 20px; border-top: 1px solid #e2e8f0; color: #718096; font-size: 12px; font-style: italic; margin-top: auto;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
              <span style="color: #10b981;">🌱</span>
              <span>Please think twice before printing this document. <strong>Save paper</strong>, it's good for the environment.</span>
            </div>
          </div>
          
          <!-- Final Page Footer -->
          ${createFooter(days.length + 3)}
        </div>
      </div>
    `;
  };

  const downloadPDF = async () => {
    if (!itinerary) return;

    try {
      onGenerating?.(true);

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
      const imageBase64Map = new Map<string, string>();
      if (allImages.length > 0) {
        console.log('Converting images to base64...');
        const imagePromises = allImages.map(async (imageSrc) => {
          try {
            const base64 = await convertImageToBase64(imageSrc);
            imageBase64Map.set(imageSrc, base64);
            console.log(`Converted image: ${imageSrc.substring(imageSrc.lastIndexOf('/') + 1)}`);
          } catch (error) {
            console.warn(`Failed to convert image: ${imageSrc}`, error);
            // Use placeholder
            imageBase64Map.set(imageSrc, createImagePlaceholder());
          }
        });

        await Promise.all(imagePromises);
        console.log('All images converted to base64');
      }

      // Generate PDF content with base64 images
      const pdfContent = generatePDFContent(imageBase64Map);

      // Create a temporary container for PDF content
      const pdfContainer = document.createElement('div');
      pdfContainer.style.position = 'absolute';
      pdfContainer.style.left = '-9999px';
      pdfContainer.style.top = '0';
      pdfContainer.style.width = '210mm'; // A4 width
      pdfContainer.style.backgroundColor = 'white';
      pdfContainer.style.margin = '0';
      pdfContainer.style.padding = '0';
      pdfContainer.style.fontFamily = 'Arial, sans-serif';
      
      pdfContainer.innerHTML = pdfContent;
      document.body.appendChild(pdfContainer);

      // Wait for images to load properly
      console.log('Waiting for images to load...');
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Preload all images to ensure they're ready
      const imageElements = pdfContainer.querySelectorAll('img');
      console.log(`Found ${imageElements.length} image elements to check`);
      
      const imageLoadPromises = Array.from(imageElements).map((img, index) => {
        return new Promise((resolve) => {
          console.log(`Checking image ${index + 1}: ${img.src.substring(0, 50)}...`);
          
          if (img.complete && img.naturalWidth > 0) {
            console.log(`Image ${index + 1} already loaded`);
            resolve(true);
          } else {
            const timeout = setTimeout(() => {
              console.warn(`Image ${index + 1} load timeout`);
              resolve(false);
            }, 10000);
            
            img.onload = () => {
              clearTimeout(timeout);
              console.log(`Image ${index + 1} loaded successfully`);
              resolve(true);
            };
            
            img.onerror = () => {
              clearTimeout(timeout);
              console.warn(`Image ${index + 1} failed to load`);
              resolve(false);
            };
          }
        });
      });

      const results = await Promise.all(imageLoadPromises);
      const loadedCount = results.filter(r => r).length;
      console.log(`Loaded ${loadedCount}/${imageElements.length} images successfully`);

      // Convert to canvas with higher quality
      const canvas = await html2canvas(pdfContainer, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: pdfContainer.scrollWidth,
        height: pdfContainer.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: pdfContainer.scrollWidth,
        windowHeight: pdfContainer.scrollHeight,
        logging: false, // Disable logging for cleaner output
        imageTimeout: 30000,
        removeContainer: false,
        onclone: (clonedDoc) => {
          // Ensure images are properly loaded in the cloned document
          const clonedImages = clonedDoc.querySelectorAll('img');
          clonedImages.forEach((img: any) => {
            if (img.src && img.src.startsWith('data:')) {
              // Image is already base64, ensure it loads
              img.onload = () => console.log('Image loaded in clone');
              img.onerror = () => console.warn('Image failed to load in clone');
            }
          });
        }
      });

      // Create PDF with improved pagination
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Calculate number of pages needed with better precision
      const totalPages = Math.ceil(imgHeight / pageHeight);
      console.log(`Total content height: ${imgHeight}mm, Page height: ${pageHeight}mm, Total pages: ${totalPages}`);
      
      // Add pages with improved positioning
      for (let i = 0; i < totalPages; i++) {
        if (i > 0) {
          pdf.addPage();
        }
        
        // Calculate the y position for this page with better precision
        const yPosition = -(i * pageHeight);
        console.log(`Page ${i + 1}: yPosition = ${yPosition}mm`);
        
        // Add the image for this page with better quality
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, yPosition, imgWidth, imgHeight);
      }

      // Download PDF
      const fileName = `${itinerary.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_itinerary.pdf`;
      pdf.save(fileName);

      // Clean up
      document.body.removeChild(pdfContainer);
      
      onGenerating?.(false);
      console.log('PDF generated successfully!');

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
      onGenerating?.(false);
    }
  };

  return { downloadPDF };
};
