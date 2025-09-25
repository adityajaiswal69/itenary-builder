import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { Itinerary } from '../services/api';
import { getCorsEnabledImageUrl } from '../lib/imageUtils';

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
      
      // Convert to CORS-enabled URL
      const corsEnabledUrl = getCorsEnabledImageUrl(imageSrc);
      console.log(`Converting image: ${imageSrc} -> ${corsEnabledUrl}`);
      
      // Strategy 1: Try direct fetch with CORS mode first
      try {
        const response = await fetch(corsEnabledUrl, {
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
      
      // Strategy 2: Try with no-cors mode as fallback
      try {
        const response = await fetch(corsEnabledUrl, {
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
            
            img.src = corsEnabledUrl;
          });
        }
      } catch (noCorsError) {
        console.warn('No-cors fetch failed:', noCorsError);
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
        
        img.src = corsEnabledUrl;
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

  // Helper function to detect if content contains HTML tables
  const containsTable = (content: string): boolean => {
    if (!content) return false;
    // Check for various table-related HTML tags
    const tablePatterns = [
      /<table[^>]*>/i,
      /<Table[^>]*>/i,
      /<TABLE[^>]*>/i,
      /<tbody[^>]*>/i,
      /<thead[^>]*>/i,
      /<tfoot[^>]*>/i,
      /<tr[^>]*>/i,
      /<th[^>]*>/i,
      /<td[^>]*>/i
    ];
    
    return tablePatterns.some(pattern => pattern.test(content));
  };

  // Helper function to render rich text content
  const renderRichText = (content: any): string => {
    if (!content) return '';
    
    // If content is a string, return as is
    if (typeof content === 'string') {
      return content;
    }
    
    // If content is an array of rich text objects (like from TipTap)
    if (Array.isArray(content)) {
      return content.map((item: any) => {
        if (typeof item === 'string') return item;
        if (item.type === 'paragraph' && item.content) {
          return `<p>${item.content.map((c: any) => c.text || '').join('')}</p>`;
        }
        if (item.type === 'text' && item.text) {
          return item.text;
        }
        return '';
      }).join('');
    }
    
    // If content is an object with HTML
    if (content.html) {
      return content.html;
    }
    
    // Fallback: convert to string
    return String(content);
  };

  const generatePDFContent = (imageBase64Map: Map<string, string> = new Map()) => {
    const days = itinerary.content?.days || [];
    const user = itinerary.user;
    const companyDetails = user?.company_details;
    
    // Helper function to create smart image grid with base64 images
    const createImageGrid = (images: string[], maxImages: number = 4) => {
      if (!images || images.length === 0) return '';
      
      const displayImages = images.slice(0, maxImages);
      const remainingCount = images.length - maxImages;
      
      if (displayImages.length === 1) {
        return `
          <div style="margin: 15px 0; text-align: center;">
            <img src="${imageBase64Map.get(displayImages[0]) || displayImages[0]}" alt="Event image" style="max-width: 100%; max-height: 250px; object-fit: cover; border-radius: 6px;" />
          </div>
        `;
      }
      
      if (displayImages.length === 2) {
        return `
          <div style="display: flex; gap: 12px; margin: 15px 0;">
            ${displayImages.map(img => `
              <div style="flex: 1;">
                <img src="${imageBase64Map.get(img) || img}" alt="Event image" style="width: 100%; height: 180px; object-fit: cover; border-radius: 6px;" />
              </div>
            `).join('')}
          </div>
        `;
      }
      
      if (displayImages.length === 3) {
        return `
          <div style="display: flex; gap: 8px; margin: 15px 0;">
            <div style="flex: 2;">
              <img src="${imageBase64Map.get(displayImages[0]) || displayImages[0]}" alt="Event image" style="width: 100%; height: 200px; object-fit: cover; border-radius: 6px;" />
            </div>
            <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
              <img src="${imageBase64Map.get(displayImages[1]) || displayImages[1]}" alt="Event image" style="width: 100%; height: 96px; object-fit: cover; border-radius: 6px;" />
              <img src="${imageBase64Map.get(displayImages[2]) || displayImages[2]}" alt="Event image" style="width: 100%; height: 96px; object-fit: cover; border-radius: 6px;" />
            </div>
          </div>
        `;
      }
      
      // 4+ images - 2x2 grid (like in reference images)
      return `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 15px 0;">
          ${displayImages.map(img => `
            <div>
              <img src="${imageBase64Map.get(img) || img}" alt="Event image" style="width: 100%; height: 140px; object-fit: cover; border-radius: 6px;" />
            </div>
          `).join('')}
          ${remainingCount > 0 ? `
            <div style="display: flex; align-items: center; justify-content: center; background: #f8f9fa; border: 2px dashed #dee2e6; border-radius: 6px; height: 140px; color: #6c757d; font-size: 12px; font-weight: 500;">
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
          ${companyDetails?.phone || user?.phone ? `<span><strong>Mobile:</strong> ${companyDetails?.phone || user?.phone}</span>` : ''}
          ${companyDetails?.email || user?.email ? `<span><strong>Email:</strong> ${companyDetails?.email || user?.email}</span>` : ''}
        </div>
          <div style="font-weight: 600;">Page ${pageNumber}</div>
        </div>
      </div>
    `;

  // Helper function to create a dedicated table page
  const createTablePage = (event: any, dayTitle: string, pageNumber: number) => {
    const tableContent = event.notes;
    
    return `
      <div style="page-break-before: always; font-family: Arial, sans-serif; line-height: 1.4; color: #333; width: 210mm; padding: 20px; margin: 0; min-height: 297mm; background: white; position: relative; padding-bottom: 60px;">
        <!-- Page Header -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 20px; font-weight: bold; margin: 0 0 8px 0; color: #1f2937; text-transform: uppercase;">${event.title}</h1>
          
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 10px;">
            ${dayTitle} | ${new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>
        
        <!-- Table Content with Enhanced Styling -->
        <div style="margin: 20px 0; padding: 20px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px;">
          <div style="font-size: 14px; color: #374151; line-height: 1.6;">
            <style>
              table {
                border-collapse: collapse;
                width: 100%;
                margin: 0;
                font-family: Arial, sans-serif;
                font-size: 12px;
                background: white;
              }
              table th, table td {
                border: 1px solid #d1d5db;
                padding: 8px 12px;
                text-align: left;
                vertical-align: top;
              }
              table th {
                background-color: #f9fafb;
                font-weight: 600;
                color: #1f2937;
                border-bottom: 2px solid #d1d5db;
              }
              table tr:nth-child(even) {
                background-color: #f9fafb;
              }
              table tr:hover {
                background-color: #f3f4f6;
              }
              table caption {
                font-size: 14px;
                font-weight: 600;
                color: #1f2937;
                margin-bottom: 10px;
                text-align: left;
              }
              /* Ensure tables fit within page width */
              table {
                max-width: 100%;
                table-layout: auto;
              }
              table td, table th {
                word-wrap: break-word;
                overflow-wrap: break-word;
              }
            </style>
            ${tableContent}
          </div>
        </div>
        
        <!-- Page Footer -->
        ${createFooter(pageNumber)}
      </div>
    `;
  };
    
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.4; color: #333; width: 210mm; padding: 0; margin: 0;">
        <!-- Page 1: Cover Page -->
        <div style="position: relative; min-height: 297mm; page-break-after: always;">
          <!-- Header with Cover Image -->
          <div style="position: relative; height: 180px; margin: 0; overflow: hidden;">
            ${itinerary.cover_image ? `
              <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: url('${imageBase64Map.get(itinerary.cover_image) || itinerary.cover_image}'); background-size: cover; background-position: center;"></div>
              <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.3);"></div>
            ` : `
              <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);"></div>
            `}
            <div style="position: relative; z-index: 2; text-align: center; padding: 50px 20px; color: white;">
              <h1 style="font-size: 32px; font-weight: bold; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.7); text-transform: uppercase; letter-spacing: 1px;">${itinerary.title}</h1>
            </div>
          </div>

          <!-- Company Information -->
          <div style="text-align: center; padding: 20px; border-bottom: 2px solid #e5e7eb;">
            ${companyDetails?.logo ? `
              <div style="margin-bottom: 10px; display: flex; justify-content: center; align-items: center;">
                <img src="${imageBase64Map.get(companyDetails.logo) || companyDetails.logo}" alt="Company Logo" style="max-height: 50px; max-width: 150px; object-fit: contain;" />
              </div>
            ` : ''}
            <div style="font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 5px;">${companyDetails?.company_name || 'Company Name'}</div>
            <div style="font-size: 12px; color: #6b7280;">Travel & Tourism</div>
          </div>

          <!-- Package Details -->
          <div style="padding: 25px;">
              <!-- Package Details and Cost in Flex Layout -->
            <div style="display: flex; gap: 20px; margin-bottom: 25px; align-items: flex-start;">
              <!-- Package Details Column -->
              <div style="flex: 1;">
                <h3 style="font-size: 16px; font-weight: bold; margin: 0 0 10px 0; color: #374151;">Package Details</h3>
                <div style="font-size: 14px; color: #4b5563; line-height: 1.6;">
                  <div style="margin-bottom: 8px;"><strong>Date of Travel:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  <div style="margin-bottom: 8px;"><strong>Number of Pax:</strong> ${currentPackage?.people || 1} Adults</div>
                  <div style="margin-bottom: 8px;"><strong>Number of Room:</strong> ${Math.ceil((currentPackage?.people || 1) / 2)} Room</div>
                  <div style="margin-bottom: 8px;"><strong>Valid Till:</strong> ${currentPackage?.valid_till ? new Date(currentPackage.valid_till).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not specified'}</div>
                  <div style="margin-bottom: 8px;"><strong>Start Location:</strong> ${currentPackage?.start_location || 'Not specified'}</div>
                  <div><strong>Mode of Transport:</strong> Tempo Traveler</div>
                </div>
              </div>
              
              <!-- Total Cost Column -->
              ${currentPackage?.price ? `
                <div style="flex: 1; text-align: center;">
                  <div style="background: #f0fdf4; padding: 20px; border: 1px solid #bbf7d0; border-radius: 8px;">
                    <h3 style="font-size: 16px; font-weight: bold; margin: 0 0 10px 0; color: #166534;">Total Cost</h3>
                    <div style="font-size: 24px; font-weight: bold; color: #166534; margin-bottom: 5px;">
                      ₹ (INR) ${currentPackage.price.toLocaleString()}
                    </div>
                    <div style="font-size: 12px; color: #15803d;">
                      ${currentPackage.price_type === 'per_person' ? 'Per Person' : 'Total Package'}
                      ${currentPackage.people ? ` (${currentPackage.people} people)` : ''}
                    </div>
                  </div>
                </div>
              ` : ''}
            </div>
            ${currentPackage?.description && Array.isArray(currentPackage.description) && currentPackage.description[0]?.content ? `
              <div style="margin-bottom: 25px; padding: 15px; background: #f8f9fa; border-left: 4px solid #3b82f6; border-radius: 4px;">
                <h3 style="font-size: 16px; font-weight: bold; margin: 0 0 10px 0; color: #1f2937;">Package Description</h3>
                <div style="font-size: 14px; color: #374151; line-height: 1.6;">
                  ${renderRichText(currentPackage.description[0].content)}
                </div>
              </div>
            ` : ''}
            
           
            
            <!-- Contact Information -->
            <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #dc2626;">
              <h4 style="font-size: 14px; font-weight: bold; margin: 0 0 10px 0; color: #dc2626;">For more info:</h4>
              <div style="font-size: 12px; color: #1e40af; line-height: 1.5;">
                ${companyDetails?.website ? `<div style="margin-bottom: 3px;"><strong>Website:</strong> <a href="${companyDetails.website}" target="_blank" style="color: #1e40af; text-decoration: underline;">${companyDetails.website}</a></div>` : ''}
                <div style="margin-bottom: 3px;"><strong>Email:</strong> <a href="mailto:${companyDetails?.email || user?.email || 'info@company.com'}" style="color: #1e40af; text-decoration: underline;">${companyDetails?.email || user?.email || 'info@company.com'}</a></div>
                <div style="margin-bottom: 3px;"><strong>Phone:</strong> <a href="tel:${companyDetails?.phone || user?.phone || 'Contact Number'}" style="color: #1e40af; text-decoration: underline;">${companyDetails?.phone || user?.phone || 'Contact Number'}</a></div>
                ${companyDetails?.address ? `<div style="margin-bottom: 3px;"><strong>Address:</strong> ${companyDetails.address}</div>` : ''}
              </div>
              
              <!-- Regards Section -->
              <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #cbd5e1;">
                <div style="font-size: 12px; color: #374151; line-height: 1.5;">
                  <div style="font-weight: bold; margin-bottom: 5px;">Regards (For any enquiries, please feel free to call us):</div>
                  <div style="margin-bottom: 3px;"><strong>${companyDetails?.company_name || 'Company Name'}</strong> - <a href="tel:${companyDetails?.phone || user?.phone || 'Contact Number'}" style="color: #1e40af; text-decoration: underline;">${companyDetails?.phone || user?.phone || 'Contact Number'}</a></div>
                  <div><strong>Office</strong> - <a href="tel:${companyDetails?.phone || user?.phone || 'Contact Number'}" style="color: #1e40af; text-decoration: underline;">${companyDetails?.phone || user?.phone || 'Contact Number'}</a></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Page 1 Footer -->
          ${createFooter(1)}
        </div>
        
        <!-- Page 2: Package Summary -->
        <div style="page-break-before: always; font-family: Arial, sans-serif; line-height: 1.4; color: #333; width: 210mm; padding: 40px; margin: 0; min-height: 297mm; background: white; position: relative; padding-bottom: 80px; page-break-after: always;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 10px 0; color: #1f2937;">Brief Itinerary</h1>
          </div>
          
          

          <div style="margin-bottom: 30px;">
            ${days.map((day: any) => `
              <div style="margin-bottom: 15px; padding: 12px; background: #f8f9fa; border-left: 4px solid #3b82f6; border-radius: 4px;">
                <div style="font-weight: bold; color: #1f2937; font-size: 14px;">
                  ${day.title.toUpperCase()}
                </div>
                    <span style="font-size: 12px; font-weight: normal; color: #718096;">
                      (${new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })})
                    </span>
              </div>
            `).join('')}
          </div>
          
          <!-- Page 2 Footer -->
          ${createFooter(2)}
        </div>

        <!-- Day Wise Details Pages -->
        ${(() => {
          let currentPageNumber = 3; // Start from page 3 (after cover and summary)
          let allPages = '';
          
          days.forEach((day: any) => {
            // Separate table events from regular events
            const tableEvents = day.events?.filter((event: any) => containsTable(event.notes)) || [];
            const regularEvents = day.events?.filter((event: any) => !containsTable(event.notes)) || [];
            
            // Regular Events Page
            allPages += `
              <div style="page-break-before: always; font-family: Arial, sans-serif; line-height: 1.4; color: #333; width: 210mm; padding: 20px; margin: 0; min-height: 297mm; background: white; position: relative; padding-bottom: 60px;">
                <!-- Day Header -->
                <div style="text-align: center; margin-bottom: 30px;">
                  <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 8px 0; color: #1f2937; text-transform: uppercase;">DETAILED ITINERARY</h1>
                  <h2 style="font-size: 18px; font-weight: 600; margin: 0; color: #059669; font-style: italic;"> ${day.title}</h2>
                  <div style="font-size: 12px; color: #6b7280;">
                    ${new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                  
                <!-- Day Content -->
                <div style="margin-bottom: 30px;">
                  ${regularEvents.map((event: any) => `
                    <div style="margin-bottom: 20px; page-break-inside: avoid;">
                      <!-- Event Title -->
                      <h4 style="font-size: 16px; font-weight: bold; color: #1f2937; margin: 0 0 8px 0; text-transform: uppercase;">
                        ${event.title}
                      </h4>
                      
                      <!-- Event Details -->
                      <div style="margin-bottom: 12px; font-size: 14px; color: #374151; line-height: 1.6;">
                        ${event.category ? ` ${event.category}` : ''}
                        ${event.subCategory && event.subCategory !== event.category ? ` |  ${event.subCategory}` : ''}
                        ${event.type ? ` | <strong>Type:</strong> ${event.type}` : ''}
                        ${event.time ? ` | <strong>Time:</strong> ${event.time}` : ''}
                      </div>
                      
                      <!-- Category-specific Details -->
                      ${event.category === 'Hotel' && (event.roomBedType || event.hotelType || event.confirmationNumber) ? `
                        <div style="margin-bottom: 8px; font-size: 13px; color: #4b5563;">
                          ${event.roomBedType ? `<strong>Room Type:</strong> ${event.roomBedType}` : ''}
                          ${event.hotelType ? ` | <strong>Hotel Type:</strong> ${event.hotelType}` : ''}
                          ${event.confirmationNumber ? ` | <strong>Confirmation:</strong> ${event.confirmationNumber}` : ''}
                        </div>
                      ` : ''}
                      
                      ${event.category === 'Flights' && (event.from || event.to || event.airlines || event.flightNumber || event.terminal || event.gate) ? `
                        <div style="margin-bottom: 8px; font-size: 13px; color: #4b5563;">
                          ${event.from && event.to ? `<strong>Route:</strong> ${event.from} → ${event.to}` : ''}
                          ${event.airlines ? ` | <strong>Airlines:</strong> ${event.airlines}` : ''}
                          ${event.flightNumber ? ` | <strong>Flight:</strong> ${event.flightNumber}` : ''}
                          ${event.terminal ? ` | <strong>Terminal:</strong> ${event.terminal}` : ''}
                          ${event.gate ? ` | <strong>Gate:</strong> ${event.gate}` : ''}
                        </div>
                      ` : ''}
                      
                      ${event.category === 'Transport' && (event.carrier || event.transportNumber) ? `
                        <div style="margin-bottom: 8px; font-size: 13px; color: #4b5563;">
                          ${event.carrier ? `<strong>Carrier:</strong> ${event.carrier}` : ''}
                          ${event.transportNumber ? ` | <strong>Transport Number:</strong> ${event.transportNumber}` : ''}
                        </div>
                      ` : ''}
                      
                      ${event.category === 'Activity' && (event.provider || event.duration) ? `
                        <div style="margin-bottom: 8px; font-size: 13px; color: #4b5563;">
                          ${event.provider ? `<strong>Provider:</strong> ${event.provider}` : ''}
                          ${event.duration ? ` | <strong>Duration:</strong> ${event.duration}` : ''}
                        </div>
                      ` : ''}
                      
                      ${event.category === 'Cruise' && (event.cabinType || event.cabinNumber) ? `
                        <div style="margin-bottom: 8px; font-size: 13px; color: #4b5563;">
                          ${event.cabinType ? `<strong>Cabin Type:</strong> ${event.cabinType}` : ''}
                          ${event.cabinNumber ? ` | <strong>Cabin Number:</strong> ${event.cabinNumber}` : ''}
                        </div>
                      ` : ''}
                      
                      <!-- Event Description (only if not a table) -->
                      ${event.notes && !containsTable(event.notes) ? `
                        <div style="margin-bottom: 12px;">
                          <p style="font-size: 14px; color: #374151; margin: 0; line-height: 1.6; text-align: justify;">
                            ${event.notes.replace(/<[^>]*>/g, '')}
                          </p>
                        </div>
                      ` : ''}
                      
                      <!-- Event Images -->
                      ${event.images && event.images.length > 0 ? createImageGrid(event.images, 4) : ''}
                      
                      <!-- Price Information -->
                      ${event.amount ? `
                        <div style="margin-top: 8px; font-size: 13px; color: #166534; font-weight: 600;">
                          <strong>Cost:</strong> ${event.currency || 'USD'} ${event.amount.toLocaleString()}
                          ${event.bookedThrough ? ` (Booked through: ${event.bookedThrough})` : ''}
                        </div>
                      ` : ''}
                      
                      <!-- Separator line -->
                      <div style="border-bottom: 1px solid #e5e7eb; margin: 15px 0;"></div>
                    </div>
                  `).join('') || `
                    <div style="text-align: center; padding: 40px; color: #6b7280;">
                      <p style="font-size: 14px; margin: 0;">No specific activities planned for this day.</p>
                    </div>
                  `}
                </div>
                
                <!-- Day Page Footer -->
                ${createFooter(currentPageNumber)}
              </div>
            `;
            
            currentPageNumber++;
            
            // Table Events Pages (separate page for each table)
            tableEvents.forEach((event: any) => {
              allPages += createTablePage(event, day.title, currentPageNumber);
              currentPageNumber++;
            });
          });
          
          return allPages;
        })()}

        <!-- Inclusions & Exclusions Page -->
        <div style="page-break-before: always; font-family: Arial, sans-serif; line-height: 1.4; color: #333; width: 210mm; padding: 20px; margin: 0; min-height: 297mm; background: white; position: relative; padding-bottom: 60px;">
          <!-- Page Header -->
          <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 15px;">
            <h1 style="font-size: 18px; font-weight: bold; margin: 0; color: #1f2937;">Inclusions & Exclusions</h1>
          </div>

          <!-- Inclusions & Exclusions in Flex Layout -->
          <div style="display: flex; gap: 20px; margin-bottom: 20px;">
            <!-- Inclusions Section -->
            ${currentPackage?.inclusions?.length ? `
              <div style="flex: 1;">
                <h3 style="font-size: 14px; font-weight: bold; margin: 0 0 10px 0; color: #166534;">✓ Inclusions</h3>
                <div style="font-size: 12px; color: #374151; line-height: 1.5;">
                  ${currentPackage.inclusions.map((inclusion: string) => `
                    <div style="margin-bottom: 5px;">• ${inclusion}</div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Exclusions Section -->
            ${currentPackage?.exclusions?.length ? `
              <div style="flex: 1;">
                <h3 style="font-size: 14px; font-weight: bold; margin: 0 0 10px 0; color: #dc2626;">✗ Exclusions</h3>
                <div style="font-size: 12px; color: #374151; line-height: 1.5;">
                  ${currentPackage.exclusions.map((exclusion: string) => `
                    <div style="margin-bottom: 5px;">• ${exclusion}</div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>

          <!-- Contact Information -->
          <div style="margin-top: 30px; padding: 15px; background: #f8f9fa; border-left: 3px solid #3b82f6;">
            <h3 style="font-size: 14px; font-weight: bold; margin: 0 0 10px 0; color: #1f2937;">${companyDetails?.company_name || 'Company Name'}</h3>
            <div style="font-size: 12px; color: #4b5563; line-height: 1.5;">
              ${companyDetails?.website ? `<div style="margin-bottom: 3px;"><strong>Website:</strong> <a href="${companyDetails.website}" target="_blank" style="color: #1e40af; text-decoration: underline;">${companyDetails.website}</a></div>` : ''}
              <div style="margin-bottom: 3px;"><strong>Email:</strong> <a href="mailto:${companyDetails?.email || user?.email || 'info@company.com'}" style="color: #1e40af; text-decoration: underline;">${companyDetails?.email || user?.email || 'info@company.com'}</a></div>
              <div style="margin-bottom: 3px;"><strong>Phone:</strong> <a href="tel:${companyDetails?.phone || user?.phone || 'Contact Number'}" style="color: #1e40af; text-decoration: underline;">${companyDetails?.phone || user?.phone || 'Contact Number'}</a></div>
              ${companyDetails?.address ? `<div style="margin-bottom: 3px;"><strong>Address:</strong> ${companyDetails.address}</div>` : ''}
              
              <!-- Social Media Links -->
              ${(companyDetails?.facebook_url || companyDetails?.whatsapp_url || companyDetails?.instagram_url || companyDetails?.youtube_url) ? `
                <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #cbd5e1;">
                  <div style="font-weight: bold; margin-bottom: 5px; color: #1f2937;">Follow Us:</div>
                  <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    ${companyDetails?.facebook_url ? `<a href="${companyDetails.facebook_url}" target="_blank" style="color: #1877f2; text-decoration: underline; font-size: 11px;">📘 Facebook</a>` : ''}
                    ${companyDetails?.whatsapp_url ? `<a href="${companyDetails.whatsapp_url}" target="_blank" style="color: #25d366; text-decoration: underline; font-size: 11px;">📱 WhatsApp</a>` : ''}
                    ${companyDetails?.instagram_url ? `<a href="${companyDetails.instagram_url}" target="_blank" style="color: #e4405f; text-decoration: underline; font-size: 11px;">📷 Instagram</a>` : ''}
                    ${companyDetails?.youtube_url ? `<a href="${companyDetails.youtube_url}" target="_blank" style="color: #ff0000; text-decoration: underline; font-size: 11px;">📺 YouTube</a>` : ''}
                  </div>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Page Footer -->
          ${createFooter((() => {
            let totalPages = 2; // Cover + Summary pages
            days.forEach((day: any) => {
              totalPages++; // Regular day page
              const tableEvents = day.events?.filter((event: any) => containsTable(event.notes)) || [];
              totalPages += tableEvents.length; // Table pages
            });
            totalPages++; // Inclusions & Exclusions page
            return totalPages;
          })())}
        </div>
      </div>
    `;
  };

  // Helper function to detect and add clickable links to PDF
  const addClickableLinksToPDF = async (pdf: jsPDF, pdfContainer: HTMLElement, canvas: HTMLCanvasElement, totalPages: number) => {
    try {
      // Find all <a> elements in the PDF container
      const linkElements = pdfContainer.querySelectorAll('a[href]');
      console.log(`🔍 Found ${linkElements.length} clickable links to process`);
      
      if (linkElements.length === 0) {
        console.log('❌ No links found in PDF container');
        return;
      }

      // Debug: Log all links in order of detection
      console.log('🔍 All detected links in order:');
      linkElements.forEach((linkElement, index) => {
        const href = linkElement.getAttribute('href');
        const text = (linkElement as HTMLElement).textContent || '';
        const rect = linkElement.getBoundingClientRect();
        console.log(`  ${index + 1}. "${text}" -> ${href} at (${rect.left.toFixed(1)}, ${rect.top.toFixed(1)})`);
      });

      // Wait a bit to ensure everything is rendered
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get container dimensions
      const containerWidth = pdfContainer.offsetWidth;
      const containerHeight = pdfContainer.offsetHeight;
      console.log('📏 Container dimensions:', { width: containerWidth, height: containerHeight });
      console.log('📏 Canvas dimensions:', { width: canvas.width, height: canvas.height });
      
      // PDF dimensions in mm
      const pdfWidth = 210; // A4 width
      const pageHeight = 297; // A4 height
      
      // Calculate the total content height in PDF units
      const totalContentHeight = (canvas.height * pdfWidth) / canvas.width;
      console.log('📏 Total content height in PDF:', totalContentHeight);
      
      // Calculate scale factors
      const scaleX = canvas.width / containerWidth;
      const scaleY = canvas.height / containerHeight;
      console.log('📐 Scale factors:', { scaleX, scaleY });

      // First, add a simple test link to verify jsPDF functionality
      try {
        pdf.setPage(1);
        pdf.link(10, 10, 50, 10, { url: 'https://www.google.com' });
        console.log('🧪 Test link added to page 1 at (10, 10)');
        
        // Add another test link at a different position
        pdf.link(10, 30, 50, 10, { url: 'https://www.github.com' });
        console.log('🧪 Test link 2 added to page 1 at (10, 30)');
      } catch (testError) {
        console.error('❌ Test link failed:', testError);
      }

      // Store link positions to check for overlaps
      const linkPositions: Array<{x: number, y: number, width: number, height: number, href: string, text: string}> = [];
      
      // Process each link with better debugging
      for (let index = 0; index < linkElements.length; index++) {
        const linkElement = linkElements[index];
        try {
          const href = linkElement.getAttribute('href');
          const linkText = (linkElement as HTMLElement).textContent || '';
          
          if (!href) {
            console.warn(`⚠️ Link ${index + 1} has no href attribute`);
            continue;
          }
          
          console.log(`🔗 Processing Link ${index + 1}:`, {
            href: href,
            text: linkText,
            element: linkElement
          });
          
          // Add a temporary visual indicator to help debug
          (linkElement as HTMLElement).style.border = '2px solid red';
          (linkElement as HTMLElement).style.backgroundColor = 'yellow';
          (linkElement as HTMLElement).setAttribute('data-link-index', (index + 1).toString());

          // Get the link's position using offset measurements
          let element = linkElement as HTMLElement;
          let relativeX = 0;
          let relativeY = 0;
          
          // Calculate position relative to the container
          while (element && element !== pdfContainer) {
            relativeX += element.offsetLeft;
            relativeY += element.offsetTop;
            element = element.offsetParent as HTMLElement;
          }
          
          const relativeWidth = (linkElement as HTMLElement).offsetWidth;
          const relativeHeight = (linkElement as HTMLElement).offsetHeight;
          
          console.log(`🔗 Link ${index + 1} (${href}):`, {
            relativeX: relativeX.toFixed(2),
            relativeY: relativeY.toFixed(2),
            relativeWidth: relativeWidth.toFixed(2),
            relativeHeight: relativeHeight.toFixed(2)
          });
          
          // Convert to canvas coordinates
          const canvasX = relativeX * scaleX;
          const canvasY = relativeY * scaleY;
          const canvasWidth = relativeWidth * scaleX;
          const canvasHeight = relativeHeight * scaleY;
          
          console.log(`🎨 Canvas coords:`, {
            x: canvasX.toFixed(2),
            y: canvasY.toFixed(2),
            width: canvasWidth.toFixed(2),
            height: canvasHeight.toFixed(2)
          });
          
          // Convert to PDF coordinates (in mm)
          const pdfX = (canvasX / canvas.width) * pdfWidth;
          const pdfY = (canvasY / canvas.height) * totalContentHeight;
          const pdfWidth_mm = (canvasWidth / canvas.width) * pdfWidth;
          const pdfHeight_mm = (canvasHeight / canvas.height) * totalContentHeight;
          
          // Debug: Check for potential coordinate issues
          if (pdfX < 0 || pdfY < 0 || pdfX > pdfWidth || pdfY > totalContentHeight) {
            console.warn(`⚠️ Link ${index + 1} has suspicious coordinates:`, {
              pdfX: pdfX.toFixed(2),
              pdfY: pdfY.toFixed(2),
              pdfWidth: pdfWidth,
              totalContentHeight: totalContentHeight
            });
          }
          
          console.log(`📄 PDF coords:`, {
            x: pdfX.toFixed(2),
            y: pdfY.toFixed(2),
            width: pdfWidth_mm.toFixed(2),
            height: pdfHeight_mm.toFixed(2)
          });
          
          // Determine which page this link belongs to
          const pageNumber = Math.floor(pdfY / pageHeight);
          console.log(`📖 Link belongs to page: ${pageNumber + 1} (total pages: ${totalPages})`);
          
          if (pageNumber >= 0 && pageNumber < totalPages) {
            // Calculate position within the page
            const pageY = pdfY - (pageNumber * pageHeight);
            
            // Add the link to the specific page
            // Note: jsPDF link coordinates are from bottom-left, so we need to adjust
            const adjustedY = pageHeight - pageY - pdfHeight_mm;
            
            console.log(`🎯 Final position:`, {
              page: pageNumber + 1,
              x: pdfX.toFixed(2),
              y: adjustedY.toFixed(2),
              width: pdfWidth_mm.toFixed(2),
              height: pdfHeight_mm.toFixed(2)
            });
            
            // Set the page context and add the link
            pdf.setPage(pageNumber + 1);
            
            // Ensure minimum size for clickability
            const minWidth = Math.max(pdfWidth_mm, 10);
            const minHeight = Math.max(pdfHeight_mm, 5);
            
            // Check for overlapping links
            const currentPosition = { x: pdfX, y: adjustedY, width: minWidth, height: minHeight, href, text: linkText };
            const overlappingLinks = linkPositions.filter(pos => {
              const overlap = !(currentPosition.x + currentPosition.width < pos.x || 
                              pos.x + pos.width < currentPosition.x || 
                              currentPosition.y + currentPosition.height < pos.y || 
                              pos.y + pos.height < currentPosition.y);
              return overlap;
            });
            
            if (overlappingLinks.length > 0) {
              console.warn(`⚠️ Link ${index + 1} overlaps with existing links:`, overlappingLinks);
            }
            
            // Store this link position
            linkPositions.push(currentPosition);
            
            // Try to add the link using different methods
            let linkAdded = false;
            
            console.log(`🎯 Adding link ${index + 1} at position:`, {
              page: pageNumber + 1,
              x: pdfX.toFixed(2),
              y: adjustedY.toFixed(2),
              width: minWidth.toFixed(2),
              height: minHeight.toFixed(2),
              href: href,
              text: linkText,
              originalPosition: {
                relativeX: relativeX.toFixed(2),
                relativeY: relativeY.toFixed(2),
                relativeWidth: relativeWidth.toFixed(2),
                relativeHeight: relativeHeight.toFixed(2)
              },
              overlaps: overlappingLinks.length
            });
            
            // Method 1: Try standard link method
            try {
              pdf.link(pdfX, adjustedY, minWidth, minHeight, { url: href });
              console.log(`✅ Method 1: Added link ${index + 1} (${linkText}) -> ${href} on page ${pageNumber + 1}`);
              linkAdded = true;
            } catch (linkError) {
              console.warn(`⚠️ Method 1 failed for link ${index + 1}:`, linkError);
            }
            
            // Method 2: Try textWithLink method
            if (!linkAdded) {
              try {
                pdf.textWithLink(linkText, pdfX, adjustedY, { url: href });
                console.log(`✅ Method 2: Added link ${index + 1} (${linkText}) -> ${href} on page ${pageNumber + 1}`);
                linkAdded = true;
              } catch (textLinkError) {
                console.warn(`⚠️ Method 2 failed for link ${index + 1}:`, textLinkError);
              }
            }
            
            // Method 3: Try with different coordinate system
            if (!linkAdded) {
              try {
                // Try with top-left coordinate system
                pdf.link(pdfX, pageY, minWidth, minHeight, { url: href });
                console.log(`✅ Method 3: Added link ${index + 1} (${linkText}) -> ${href} on page ${pageNumber + 1}`);
                linkAdded = true;
              } catch (coordError) {
                console.warn(`⚠️ Method 3 failed for link ${index + 1}:`, coordError);
              }
            }
            
            if (!linkAdded) {
              console.error(`❌ All methods failed for link ${index + 1}: ${href}`);
            }
          } else {
            console.warn(`❌ Link ${index + 1} (${href}) is outside page bounds: page ${pageNumber + 1}`);
          }
          
        } catch (linkError) {
          console.error(`❌ Failed to process link ${index + 1}:`, linkError);
        }
      }
      
      console.log(`🎉 Successfully processed ${linkElements.length} clickable links`);
      
      // Summary of all processed links
      console.log('📋 Link Processing Summary:');
      linkElements.forEach((linkElement, index) => {
        const href = linkElement.getAttribute('href');
        const text = (linkElement as HTMLElement).textContent || '';
        console.log(`  ${index + 1}. "${text}" -> ${href}`);
      });
      
      // Summary of all link positions
      console.log('📍 Link Positions Summary:');
      linkPositions.forEach((pos, index) => {
        console.log(`  ${index + 1}. "${pos.text}" -> ${pos.href} at (${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}) size (${pos.width.toFixed(2)}, ${pos.height.toFixed(2)})`);
      });
      
      // Clean up visual indicators
      linkElements.forEach((linkElement) => {
        (linkElement as HTMLElement).style.border = '';
        (linkElement as HTMLElement).style.backgroundColor = '';
        (linkElement as HTMLElement).removeAttribute('data-link-index');
      });
      
    } catch (error) {
      console.error('❌ Error adding clickable links to PDF:', error);
    }
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
      
      // Collect company logo
      if (itinerary.user?.company_details?.logo) {
        allImages.push(itinerary.user.company_details.logo);
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

      // Wait for images to load properly and ensure container is fully rendered
      console.log('Waiting for images to load...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Force a reflow to ensure all elements are properly positioned
      pdfContainer.offsetHeight;

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
      
      // Calculate number of pages needed
      const totalPages = Math.ceil(imgHeight / pageHeight);
      console.log(`Total content height: ${imgHeight}mm, Page height: ${pageHeight}mm, Total pages: ${totalPages}`);
      
      // Add clickable links to the PDF BEFORE adding images
      await addClickableLinksToPDF(pdf, pdfContainer, canvas, totalPages);
      
      // Add pages with proper positioning
      for (let i = 0; i < totalPages; i++) {
        if (i > 0) {
          pdf.addPage();
        }
        
        // Calculate the y position for this page
        const yPosition = -(i * pageHeight);
        console.log(`Page ${i + 1}: yPosition = ${yPosition}mm`);
        
        // Add the image for this page
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.9), 'JPEG', 0, yPosition, imgWidth, imgHeight);
      }
      
      // Debug: Check if links were actually added to the PDF
      console.log('🔍 PDF internal structure check:');
      try {
        const pdfOutput = pdf.output('datauristring');
        const linkCount = (pdfOutput.match(/\/Annots/g) || []).length;
        console.log(`📊 PDF contains ${linkCount} annotations (links)`);
      } catch (debugError) {
        console.warn('⚠️ Could not check PDF internal structure:', debugError);
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
