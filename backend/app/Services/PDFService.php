<?php

namespace App\Services;

use App\Models\Itinerary;
use App\Models\Package;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\View;

class PDFService
{
    /**
     * Generate PDF for an itinerary
     */
    public function generateItineraryPDF(Itinerary $itinerary, ?Package $package = null)
    {
        // Prepare data for the view
        $data = $this->prepareViewData($itinerary, $package);

        // Generate HTML from Blade view
        $html = View::make('pdf.itinerary', $data)->render();

        // Configure PDF options
        $pdf = Pdf::loadHTML($html);
        $pdf->setPaper('A4', 'portrait');
        $pdf->setOptions([
            'isHtml5ParserEnabled' => true,
            'isRemoteEnabled' => true,
            'isPhpEnabled' => true,
            'defaultFont' => 'Arial',
            'dpi' => 150,
            'isFontSubsettingEnabled' => true,
        ]);

        return $pdf;
    }

    /**
     * Prepare data for the Blade view
     */
    private function prepareViewData(Itinerary $itinerary, ?Package $package = null)
    {
        $user = $itinerary->user;
        $companyDetails = $user->companyDetails ?? null;
        $days = $itinerary->content['days'] ?? [];
        
        // Process images to get base64 data
        $imageBase64Map = $this->processImages($itinerary, $package);

        // Prepare cover image
        $coverImageBase64 = null;
        if ($itinerary->cover_image) {
            $coverImageBase64 = $imageBase64Map[$itinerary->cover_image] ?? $itinerary->cover_image;
        }

        // Prepare company logo
        $logoBase64 = null;
        if ($companyDetails && $companyDetails->logo) {
            $logoBase64 = $imageBase64Map[$companyDetails->logo] ?? $companyDetails->logo;
        }

        // Prepare package data
        $packageDescription = '';
        $packageInclusions = '';
        $packageExclusions = '';
        
        if ($package) {
            $packageDescription = $this->renderRichText($package->description);
            $packageInclusions = $this->renderList($package->inclusions ?? []);
            $packageExclusions = $this->renderList($package->exclusions ?? []);
        }

        // Generate social links HTML
        $socialLinksHtml = $this->generateSocialLinksHTML($companyDetails);

        return [
            'itinerary' => $itinerary,
            'package' => $package,
            'user' => $user,
            'companyDetails' => $companyDetails,
            'days' => $days,
            'imageBase64Map' => $imageBase64Map,
            'coverImageBase64' => $coverImageBase64,
            'logoBase64' => $logoBase64,
            'packageDescription' => $packageDescription,
            'packageInclusions' => $packageInclusions,
            'packageExclusions' => $packageExclusions,
            'socialLinksHtml' => $socialLinksHtml,
        ];
    }

    /**
     * Process images and convert them to base64
     */
    private function processImages(Itinerary $itinerary, ?Package $package = null)
    {
        $imageBase64Map = [];
        $images = [];

        // Collect all images
        if ($itinerary->cover_image) {
            $images[] = $itinerary->cover_image;
        }

        if ($itinerary->user && $itinerary->user->companyDetails && $itinerary->user->companyDetails->logo) {
            $images[] = $itinerary->user->companyDetails->logo;
        }

        // Collect images from events
        $days = $itinerary->content['days'] ?? [];
        foreach ($days as $day) {
            if (isset($day['events'])) {
                foreach ($day['events'] as $event) {
                    if (isset($event['images']) && is_array($event['images'])) {
                        $images = array_merge($images, $event['images']);
                    }
                }
            }
        }

        // Convert images to base64
        foreach ($images as $imagePath) {
            if ($imagePath) {
                $imageBase64Map[$imagePath] = $this->convertImageToBase64($imagePath);
            }
        }

        return $imageBase64Map;
    }

    /**
     * Convert image file to base64
     */
    private function convertImageToBase64($imagePath)
    {
        try {
            // Handle different path formats
            $fullPath = $this->getImageFullPath($imagePath);
            
            if (file_exists($fullPath)) {
                $imageData = file_get_contents($fullPath);
                $mimeType = mime_content_type($fullPath);
                return 'data:' . $mimeType . ';base64,' . base64_encode($imageData);
            }
        } catch (\Exception $e) {
            // Return placeholder if image can't be loaded
        }

        return $this->createImagePlaceholder();
    }

    /**
     * Get full path for image
     */
    private function getImageFullPath($imagePath)
    {
        // Handle different path formats
        if (strpos($imagePath, '/storage/images/') !== false) {
            $filename = basename($imagePath);
            return storage_path('app/public/images/' . $filename);
        } elseif (strpos($imagePath, '/images/') !== false) {
            $filename = basename($imagePath);
            return storage_path('app/public/images/' . $filename);
        } else {
            // Assume it's just a filename
            return storage_path('app/public/images/' . $imagePath);
        }
    }

    /**
     * Create a placeholder image
     */
    private function createImagePlaceholder()
    {
        // Create a simple SVG placeholder
        $svg = '<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
            <rect width="300" height="200" fill="#f3f4f6" stroke="#d1d5db" stroke-width="2"/>
            <text x="150" y="100" text-anchor="middle" font-family="Arial" font-size="14" fill="#6b7280">📷</text>
            <text x="150" y="120" text-anchor="middle" font-family="Arial" font-size="12" fill="#6b7280">Image Unavailable</text>
        </svg>';
        
        return 'data:image/svg+xml;base64,' . base64_encode($svg);
    }

    /**
     * Generate image grid HTML (for use in Blade views)
     * This method is kept for backward compatibility but should be replaced with Blade partials
     */
    public function generateImageGrid($images, $imageBase64Map, $maxImages = 4)
    {
        if (empty($images)) return '';
        
        $displayImages = array_slice($images, 0, $maxImages);
        $remainingCount = count($images) - $maxImages;
        
        if (count($displayImages) === 1) {
            $imageBase64 = $imageBase64Map[$displayImages[0]] ?? $displayImages[0];
            return '<div style="margin: 10px 0; text-align: center;">
                <img src="' . $imageBase64 . '" alt="Event image" style="max-width: 100%; max-height: 250px; object-fit: cover; border-radius: 6px;" />
            </div>';
        }
        
        if (count($displayImages) === 2) {
            $html = '<div style="display: flex; gap: 12px; margin: 10px 0;">';
            foreach ($displayImages as $img) {
                $imageBase64 = $imageBase64Map[$img] ?? $img;
                $html .= '<div style="flex: 1;">
                    <img src="' . $imageBase64 . '" alt="Event image" style="width: 100%; height: 180px; object-fit: cover; border-radius: 6px;" />
                </div>';
            }
            $html .= '</div>';
            return $html;
        }
        
        // 3+ images - 2x2 grid
        $html = '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 10px 0;">';
        foreach ($displayImages as $img) {
            $imageBase64 = $imageBase64Map[$img] ?? $img;
            $html .= '<div>
                <img src="' . $imageBase64 . '" alt="Event image" style="width: 100%; height: 140px; object-fit: cover; border-radius: 6px;" />
            </div>';
        }
        if ($remainingCount > 0) {
            $html .= '<div style="display: flex; align-items: center; justify-content: center; background: #f8f9fa; border: 2px dashed #dee2e6; border-radius: 6px; height: 140px; color: #6c757d; font-size: 12px; font-weight: 500;">
                +' . $remainingCount . ' more
            </div>';
        }
        $html .= '</div>';
        
        return $html;
    }


    /**
     * Generate social media links HTML
     */
    private function generateSocialLinksHTML($companyDetails)
    {
        if (!$companyDetails) return '';
        
        $links = [];
        if ($companyDetails->facebook_url) {
            $links[] = '<a href="' . htmlspecialchars($companyDetails->facebook_url) . '" target="_blank" style="color: #1877f2; text-decoration: underline; font-size: 11px;">📘 Facebook</a>';
        }
        if ($companyDetails->whatsapp_url) {
            $links[] = '<a href="' . htmlspecialchars($companyDetails->whatsapp_url) . '" target="_blank" style="color: #25d366; text-decoration: underline; font-size: 11px;">📱 WhatsApp</a>';
        }
        if ($companyDetails->instagram_url) {
            $links[] = '<a href="' . htmlspecialchars($companyDetails->instagram_url) . '" target="_blank" style="color: #e4405f; text-decoration: underline; font-size: 11px;">📷 Instagram</a>';
        }
        if ($companyDetails->youtube_url) {
            $links[] = '<a href="' . htmlspecialchars($companyDetails->youtube_url) . '" target="_blank" style="color: #ff0000; text-decoration: underline; font-size: 11px;">📺 YouTube</a>';
        }
        
        if (empty($links)) return '';
        
        return '<div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #cbd5e1;">
            <div style="font-weight: bold; margin-bottom: 5px; color: #1f2937;">Follow Us:</div>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">' . implode('', $links) . '</div>
        </div>';
    }

    /**
     * Render rich text content
     */
    private function renderRichText($content)
    {
        if (!$content) return '';
        
        if (is_array($content) && isset($content[0]['content'])) {
            return strip_tags($content[0]['content']);
        }
        
        return strip_tags($content);
    }

    /**
     * Render list items
     */
    private function renderList($items)
    {
        if (!is_array($items) || empty($items)) return '';
        
        $html = '';
        foreach ($items as $item) {
            $html .= '<div style="margin-bottom: 5px;">• ' . htmlspecialchars($item) . '</div>';
        }
        return $html;
    }

}
