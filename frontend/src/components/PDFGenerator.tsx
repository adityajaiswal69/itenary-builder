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
  
  // Helper function to ensure image compatibility
  const processImageSrc = (imageSrc: string) => {
    // If it's already a data URL, return as is
    if (imageSrc.startsWith('data:')) {
      return imageSrc;
    }
    
    // If it's a regular URL, add crossorigin attribute handling
    return imageSrc;
  };

  const generatePDFContent = () => {
    const days = itinerary.content?.days || [];
    const user = itinerary.user;
    const locations = currentPackage?.locations || [];
    
    // Helper function to create consistent footer
    const createFooter = (pageNumber: number) => `
      <div style="position: absolute; bottom: 20px; left: 40px; right: 40px; background: white; border-top: 1px solid #e5e7eb; padding: 15px 0; display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #6b7280;">
        <div style="display: flex; gap: 30px;">
          ${user?.phone ? `<span><strong>Mobile:</strong> ${user.phone}</span>` : ''}
          ${user?.email ? `<span><strong>Email:</strong> ${user.email}</span>` : ''}
        </div>
        <div style="font-weight: 600;">
          Page ${pageNumber}
        </div>
      </div>
    `;
    
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.4; color: #333; width: 210mm; padding: 0; margin: 0;">
        <!-- Page 1: Cover Page -->
        <div style="position: relative; min-height: 297mm; padding-bottom: 60px;">
          <!-- Header Section -->
          <div style="background: linear-gradient(135deg, #e53e3e 0%, #d53f8c 100%); color: white; padding: 30px 40px; margin: 0;">
          <div style="text-align: center;">
            <h1 style="font-size: 36px; font-weight: bold; margin: 0 0 10px 0;">Trip to</h1>
            <h2 style="font-size: 48px; font-weight: bold; margin: 0 0 15px 0; color: #fff;">${locations[0] || 'Destination'}...</h2>
            <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin: 15px 0;">
              <span style="background: rgba(0,0,0,0.3); padding: 8px 16px; border-radius: 20px; font-size: 14px;">
                ${currentPackage?.people || 1}N/${currentPackage?.people + 1 || 2}D
              </span>
              <div style="width: 40px; height: 40px; background: black; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <span style="color: white; font-size: 20px;">✈</span>
              </div>
              <span style="font-size: 18px; font-weight: 500;">${itinerary.title}</span>
            </div>
            <div style="font-style: italic; font-size: 16px; opacity: 0.9; margin-top: 10px;">
              "${currentPackage?.description?.[0]?.content?.replace(/<[^>]*>/g, '').substring(0, 100) || 'A wonderful journey awaits you'}"
            </div>
          </div>
        </div>

        <!-- Content Section -->
        <div style="padding: 40px; background: white;">
          <!-- Contents Navigation -->
          <div style="background: #f8f9fa; padding: 30px; border-radius: 12px; margin-bottom: 40px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div style="flex: 1;">
                <h3 style="font-size: 24px; font-weight: bold; margin: 0 0 20px 0; color: #2d3748;">Contents</h3>
                <div style="space-y: 8px;">
                  <div style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="font-weight: 600; color: #4a5568;">1</span>
                    <span style="margin-left: 12px; color: #2d3748;">Package Summary</span>
                  </div>
                  <div style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="font-weight: 600; color: #4a5568;">2</span>
                    <span style="margin-left: 12px; color: #2d3748;">Day Wise Details</span>
                  </div>
                  <div style="padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                    <span style="font-weight: 600; color: #4a5568;">3</span>
                    <span style="margin-left: 12px; color: #2d3748;">Inclusions & Exclusions</span>
                  </div>
                  <div style="padding: 8px 0;">
                    <span style="font-weight: 600; color: #4a5568;">4</span>
                    <span style="margin-left: 12px; color: #2d3748;">Trip Information & Conditions</span>
                  </div>
                </div>
              </div>
              
              <!-- Curated By Section -->
              <div style="background: #fed7cc; padding: 25px; border-radius: 12px; margin-left: 30px; min-width: 280px;">
                <p style="font-size: 14px; color: #9a3412; margin: 0 0 8px 0; font-weight: 500;">Curated by</p>
                <h4 style="font-size: 20px; font-weight: bold; margin: 0 0 4px 0; color: #7c2d12;">${user?.name || 'Travel Expert'}</h4>
                <p style="font-size: 14px; color: #9a3412; margin: 0 0 15px 0;">${user?.name?.toLowerCase() || 'expert'}</p>
                <div style="font-size: 12px; color: #7c2d12; line-height: 1.5;">
                  ${user?.phone ? `<div style="margin-bottom: 4px;">Call : ${user.phone}</div>` : ''}
                  ${user?.email ? `<div style="margin-bottom: 4px;">Email : ${user.email}</div>` : ''}
                  <div>Address : India</div>
                </div>
                <div style="margin-top: 15px; font-size: 11px; color: #7c2d12;">
                  <p style="margin: 0;">Quotation Created on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })} ${new Date().toLocaleTimeString('en-US', { hour12: true })}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Tour Includes -->
          <div style="margin-bottom: 40px;">
            <h3 style="font-size: 24px; font-weight: bold; margin: 0 0 20px 0; color: #2d3748;">Tour Includes</h3>
            <div style="margin-bottom: 30px;">
              <h4 style="font-size: 18px; font-weight: 600; margin: 0 0 15px 0; color: #2d3748;">${locations.length} Locations Covered</h4>
              <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                ${locations.map((location: string) => `
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="width: 8px; height: 8px; background: #e53e3e; border-radius: 50%; display: inline-block;"></span>
                    <span style="color: #4a5568; font-weight: 500;">${location}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Total Cost -->
          <div style="background: #fed7cc; padding: 30px; border-radius: 12px; margin-bottom: 40px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h3 style="font-size: 24px; font-weight: bold; margin: 0 0 10px 0; color: #7c2d12;">Total Cost</h3>
                <p style="font-size: 12px; color: #9a3412; margin: 0; font-style: italic;">
                  Note: All above prices are subject to change without prior notice as<br/>
                  per availability, the final date of travel and any changes in taxes.
                </p>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 32px; font-weight: bold; color: #7c2d12;">
                  ₹ (INR) ${currentPackage?.price?.toLocaleString() || '0'}
                </div>
                <div style="font-size: 14px; color: #9a3412; margin-top: 5px;">
                  ${currentPackage?.price_type === 'per_person' ? 'Per Person' : 'Total'}
                </div>
              </div>
            </div>
            
            <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #f4a261;">
              <div style="display: flex; align-items: center; gap: 10px; color: #7c2d12;">
                <span style="width: 20px; height: 20px; border: 2px solid #e53e3e; border-radius: 50%; display: flex; align-items: center; justify-content: center;">!</span>
                <span style="font-size: 14px; font-weight: 500;">Review and Pay by ${new Date(currentPackage?.valid_till || Date.now()).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          <!-- Page 1 Footer -->
          ${createFooter(1)}
        </div>
        
        <!-- Page 2: Package Summary -->
        <div style="page-break-before: always; font-family: Arial, sans-serif; line-height: 1.4; color: #333; width: 210mm; padding: 40px; margin: 0; min-height: 297mm; background: white; position: relative; padding-bottom: 80px;">
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
          <div style="page-break-before: always; font-family: Arial, sans-serif; line-height: 1.4; color: #333; width: 210mm; padding: 40px; margin: 0; min-height: 297mm; background: white; position: relative; padding-bottom: 80px;">
            <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 30px; border-radius: 12px; margin-bottom: 40px; border: 2px solid #cbd5e1; text-align: center;">
              <h1 style="font-size: 28px; font-weight: 700; margin: 0; color: #1f2937;">Day Wise Details</h1>
              <p style="font-size: 14px; color: #6b7280; margin: 10px 0 0 0;">Daily itinerary and activities</p>
            </div>

            <div style="margin-bottom: 40px; padding: 25px; background: #fafbfc; border-radius: 12px; border: 2px solid #e5e7eb; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 2px solid #e5e7eb;">
                <div style="display: flex; align-items: center; gap: 18px;">
                  <div style="background: linear-gradient(135deg, #e53e3e 0%, #dc2626 100%); color: white; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: bold; box-shadow: 0 4px 8px rgba(229, 62, 62, 0.3);">
                    ${dayIndex + 1}
                  </div>
                  <h3 style="font-size: 26px; font-weight: 700; margin: 0; color: #1f2937;">Day ${dayIndex + 1}</h3>
                </div>
                <span style="color: #6b7280; font-size: 14px; font-weight: 600; background: #f3f4f6; padding: 8px 16px; border-radius: 8px; border: 1px solid #d1d5db;">
                  ${new Date().toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              
              <div style="margin-bottom: 25px;">
                <h4 style="font-size: 18px; color: #374151; margin: 0; font-weight: 600;">${day.title}</h4>
              </div>
              
              <div style="background: white; padding: 25px; border-radius: 10px; border: 1px solid #e5e7eb; page-break-inside: avoid;">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid #f3f4f6;">
                  <div style="background: #e53e3e; color: white; border-radius: 8px; padding: 6px 12px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                    Info
                  </div>
                  <h4 style="font-size: 18px; font-weight: 600; margin: 0; color: #1f2937;">${day.title} Details</h4>
                </div>
                
                ${day.events?.map((event: any) => `
                  <div style="margin-bottom: 20px; padding: 20px; background: white; border: 2px solid #f3f4f6; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); page-break-inside: avoid;">
                    <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 15px;">
                      <div style="flex: 1;">
                        <h5 style="font-size: 16px; font-weight: 700; margin: 0 0 8px 0; color: #1f2937; line-height: 1.3;">${event.title}</h5>
                        ${event.category ? `<div style="margin-top: 8px;"><span style="background: #dbeafe; color: #1e40af; padding: 5px 12px; border-radius: 15px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">${event.category}</span></div>` : ''}
                      </div>
                    </div>
                    ${event.notes ? `<div style="margin-bottom: 15px; padding: 12px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #e53e3e;"><p style="font-size: 13px; color: #4b5563; margin: 0; line-height: 1.6;">${event.notes.replace(/<[^>]*>/g, '').substring(0, 200)}${event.notes.length > 200 ? '...' : ''}</p></div>` : ''}
                    
                    ${event.images && event.images.length > 0 ? `
                      <div style="margin: 15px 0; page-break-inside: avoid;">
                        <div style="display: flex; flex-wrap: wrap; gap: 10px; max-width: 100%;">
                          ${event.images.slice(0, 3).map((image: string, imgIndex: number) => `
                            <div style="flex: ${event.images.length === 1 ? '1 1 100%' : event.images.length === 2 ? '1 1 calc(50% - 5px)' : '1 1 calc(33.333% - 7px)'}; min-width: 100px; max-width: ${event.images.length === 1 ? '300px' : '150px'};">
                              <div style="position: relative; overflow: hidden; border-radius: 8px; background: #ffffff; border: 2px solid #e5e7eb; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                <img 
                                  src="${processImageSrc(image)}" 
                                  alt="Event image ${imgIndex + 1}"
                                  style="width: 100%; height: 120px; object-fit: cover; display: block; object-position: center;"
                                  crossorigin="anonymous"
                                  loading="eager"
                                />
                              </div>
                            </div>
                          `).join('')}
                          ${event.images.length > 3 ? `
                            <div style="flex: 1 1 calc(33.333% - 7px); min-width: 100px; max-width: 150px;">
                              <div style="display: flex; align-items: center; justify-content: center; background: #f9fafb; border: 2px dashed #d1d5db; border-radius: 8px; height: 120px;">
                                <span style="font-size: 12px; color: #6b7280; font-weight: 600; text-align: center;">+${event.images.length - 3}<br/>more images</span>
                              </div>
                            </div>
                          ` : ''}
                        </div>
                      </div>
                    ` : ''}
                  </div>
                `).join('') || '<p style="font-size: 12px; color: #718096; margin: 0;">No specific events planned for this day.</p>'}
              </div>
            </div>
            
            <!-- Day Page Footer -->
            ${createFooter(dayIndex + 3)}
          </div>
        `).join('')}

        <!-- Inclusions & Exclusions Page -->
        <div style="page-break-before: always; font-family: Arial, sans-serif; line-height: 1.4; color: #333; width: 210mm; padding: 40px; margin: 0; min-height: 297mm; background: white; position: relative; padding-bottom: 80px;">
          <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 30px; border-radius: 12px; margin-bottom: 40px; border: 2px solid #cbd5e1; text-align: center;">
            <h1 style="font-size: 28px; font-weight: 700; margin: 0; color: #1f2937;">Inclusions & Exclusions</h1>
            <p style="font-size: 14px; color: #6b7280; margin: 10px 0 0 0;">What's included and excluded in your package</p>
          </div>

          ${currentPackage?.inclusions?.length ? `
            <div style="margin-bottom: 40px; page-break-inside: avoid;">
              <div style="background: #f0fdf4; padding: 25px; border-radius: 12px; border-left: 6px solid #22c55e; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <div style="display: flex; align-items: center; margin-bottom: 20px;">
                  <div style="background: #22c55e; color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-size: 16px; font-weight: bold; box-shadow: 0 2px 4px rgba(34, 197, 94, 0.3);">
                    ✓
                  </div>
                  <h4 style="font-size: 20px; font-weight: 700; margin: 0; color: #059669;">Inclusions</h4>
                </div>
                <div style="padding-left: 10px;">
                  ${currentPackage.inclusions.map((inclusion: string) => `
                    <div style="display: flex; align-items: flex-start; margin-bottom: 12px; page-break-inside: avoid;">
                      <span style="color: #22c55e; font-weight: bold; font-size: 16px; margin-right: 12px; margin-top: 2px; line-height: 1;">✓</span>
                      <span style="color: #374151; font-size: 14px; line-height: 1.6; flex: 1;">${inclusion}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          ` : ''}

          ${currentPackage?.exclusions?.length ? `
            <div style="margin-bottom: 40px; page-break-inside: avoid;">
              <div style="background: #fef2f2; padding: 25px; border-radius: 12px; border-left: 6px solid #ef4444; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <div style="display: flex; align-items: center; margin-bottom: 20px;">
                  <div style="background: #ef4444; color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-size: 16px; font-weight: bold; box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);">
                    ✗
                  </div>
                  <h4 style="font-size: 20px; font-weight: 700; margin: 0; color: #dc2626;">Exclusions</h4>
                </div>
                <div style="padding-left: 10px;">
                  ${currentPackage.exclusions.map((exclusion: string) => `
                    <div style="display: flex; align-items: flex-start; margin-bottom: 12px; page-break-inside: avoid;">
                      <span style="color: #ef4444; font-weight: bold; font-size: 16px; margin-right: 12px; margin-top: 2px; line-height: 1;">✗</span>
                      <span style="color: #374151; font-size: 14px; line-height: 1.6; flex: 1;">${exclusion}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          ` : ''}

          <!-- Inclusions & Exclusions Page Footer -->
          ${createFooter(days.length + 3)}
        </div>

        <!-- Trip Information & Important Details Page -->
        <div style="page-break-before: always; font-family: Arial, sans-serif; line-height: 1.4; color: #333; width: 210mm; padding: 40px; margin: 0; min-height: 297mm; background: white; position: relative; padding-bottom: 80px;">
          <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 30px; border-radius: 12px; margin-bottom: 40px; border: 2px solid #cbd5e1; text-align: center;">
            <h1 style="font-size: 28px; font-weight: 700; margin: 0; color: #1f2937;">Trip Information & Conditions</h1>
            <p style="font-size: 14px; color: #6b7280; margin: 10px 0 0 0;">Important information about your travel package</p>
          </div>

          <!-- Important Information -->
          <div style="background: #fed7cc; padding: 25px; border-radius: 12px; margin-bottom: 30px; page-break-inside: avoid;">
            <div style="background: #e53e3e; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; font-size: 12px; font-weight: 600; margin-bottom: 15px;">
              IMPORTANT INFORMATION
            </div>
            <h4 style="font-size: 18px; font-weight: 600; margin: 0 0 15px 0; color: #7c2d12;">Flexi Package</h4>
            <div style="color: #7c2d12; font-size: 14px; line-height: 1.6;">
              <div style="margin-bottom: 8px;">✓ Customizable option just for you</div>
              <div style="margin-bottom: 8px;">✓ No packed itineraries</div>
              <div>✓ No fixed groups</div>
            </div>
          </div>

          <!-- Additional Terms & Conditions -->
          <div style="background: #f8fafc; padding: 25px; border-radius: 12px; margin-bottom: 30px; page-break-inside: avoid;">
            <h4 style="font-size: 18px; font-weight: 600; margin: 0 0 20px 0; color: #1f2937;">Terms & Conditions</h4>
            <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 13px; line-height: 1.6;">
              <li style="margin-bottom: 8px;">All prices are subject to availability and may change without notice</li>
              <li style="margin-bottom: 8px;">Cancellation charges apply as per company policy</li>
              <li style="margin-bottom: 8px;">Travel insurance is recommended but not included</li>
              <li style="margin-bottom: 8px;">Valid ID proof required for all travelers</li>
              <li style="margin-bottom: 8px;">Check visa requirements for international destinations</li>
            </ul>
          </div>

          <!-- Contact Information -->
          <div style="background: #dbeafe; padding: 25px; border-radius: 12px; margin-bottom: 30px; page-break-inside: avoid;">
            <h4 style="font-size: 18px; font-weight: 600; margin: 0 0 20px 0; color: #1e40af;">Contact Information</h4>
            <div style="color: #1e40af; font-size: 14px; line-height: 1.8;">
              ${user?.email ? `<div style="margin-bottom: 8px;"><strong>Email:</strong> ${user.email}</div>` : ''}
              ${user?.phone ? `<div style="margin-bottom: 8px;"><strong>Phone:</strong> ${user.phone}</div>` : ''}
              <div style="margin-bottom: 8px;"><strong>Customer Support:</strong> Available 24/7</div>
            </div>
          </div>

          <!-- Environmental Notice -->
          <div style="text-align: center; padding: 20px; border-top: 1px solid #e2e8f0; color: #718096; font-size: 12px; font-style: italic; margin-top: auto; margin-bottom: 60px;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
              <span style="color: #10b981;">🌱</span>
              <span>Please think twice before printing this mail. <strong>Save paper</strong>, it's good for the environment.</span>
            </div>
          </div>
          
          <!-- Trip Information Page Footer -->
          ${createFooter(days.length + 4)}
        </div>
      </div>
    `;
  };

  const downloadPDF = async () => {
    if (!itinerary) return;

    try {
      onGenerating?.(true);

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
      
      const pdfContent = generatePDFContent();
      pdfContainer.innerHTML = pdfContent;
      
      document.body.appendChild(pdfContainer);

      // Wait for images to load
      const images = pdfContainer.querySelectorAll('img');
      if (images.length > 0) {
        console.log(`Loading ${images.length} images for PDF...`);
        const imagePromises = Array.from(images).map((img, index) => {
          return new Promise((resolve) => {
            if (img.complete) {
              resolve(img);
            } else {
              img.onload = () => {
                console.log(`Image ${index + 1}/${images.length} loaded`);
                resolve(img);
              };
              img.onerror = () => {
                console.warn(`Image ${index + 1}/${images.length} failed to load`);
                resolve(img); // Continue even if image fails to load
              };
              // Set a timeout to avoid hanging
              setTimeout(() => {
                console.warn(`Image ${index + 1}/${images.length} timed out`);
                resolve(img);
              }, 8000);
            }
          });
        });

        // Wait for all images to load (with timeout)
        await Promise.all(imagePromises);
        console.log('All images processed, generating PDF...');
      }

      // Convert to canvas with higher quality
      const canvas = await html2canvas(pdfContainer, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: pdfContainer.scrollWidth,
        height: pdfContainer.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: pdfContainer.scrollWidth,
        windowHeight: pdfContainer.scrollHeight,
        logging: false,
        imageTimeout: 15000,
        removeContainer: false
      });

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if content is longer than one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download PDF
      const fileName = `${itinerary.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_itinerary.pdf`;
      pdf.save(fileName);

      // Clean up
      document.body.removeChild(pdfContainer);
      
      onGenerating?.(false);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
      onGenerating?.(false);
    }
  };

  return { downloadPDF };
};
