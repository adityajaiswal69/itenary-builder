<?php

namespace App\Services;

use App\Models\Itinerary;
use App\Models\Package;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class PDFService
{
    /**
     * Generate PDF for an itinerary
     */
    public function generateItineraryPDF(Itinerary $itinerary, ?Package $package = null)
    {
        // Get the HTML content
        $html = $this->generateHTMLContent($itinerary, $package);

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
     * Generate HTML content for the PDF
     */
    private function generateHTMLContent(Itinerary $itinerary, ?Package $package = null)
    {
        $user = $itinerary->user;
        $companyDetails = $user->companyDetails ?? null;
        $days = $itinerary->content['days'] ?? [];
        
        // Process images to get base64 data
        $imageBase64Map = $this->processImages($itinerary, $package);

        $html = $this->getHTMLTemplate();
        
        // Replace placeholders with actual data
        $html = str_replace('{{ITINERARY_TITLE}}', htmlspecialchars($itinerary->title), $html);
        $html = str_replace('{{COMPANY_NAME}}', htmlspecialchars($companyDetails->company_name ?? 'Company Name'), $html);
        $html = str_replace('{{COMPANY_EMAIL}}', htmlspecialchars($companyDetails->email ?? $user->email ?? 'info@company.com'), $html);
        $html = str_replace('{{COMPANY_PHONE}}', htmlspecialchars($companyDetails->phone ?? $user->phone ?? 'Contact Number'), $html);
        $html = str_replace('{{COMPANY_ADDRESS}}', htmlspecialchars($companyDetails->address ?? ''), $html);
        $html = str_replace('{{COMPANY_WEBSITE}}', htmlspecialchars($companyDetails->website ?? ''), $html);
        
        // Package details
        if ($package) {
            $html = str_replace('{{PACKAGE_PRICE}}', $package->price ? '₹ ' . number_format($package->price) : '', $html);
            $html = str_replace('{{PACKAGE_PEOPLE}}', $package->people ?? 1, $html);
            $html = str_replace('{{PACKAGE_START_LOCATION}}', htmlspecialchars($package->start_location ?? 'Not specified'), $html);
            $html = str_replace('{{PACKAGE_VALID_TILL}}', $package->valid_till ? date('F j, Y', strtotime($package->valid_till)) : 'Not specified', $html);
            $html = str_replace('{{PACKAGE_DESCRIPTION}}', $this->renderRichText($package->description), $html);
            $html = str_replace('{{PACKAGE_INCLUSIONS}}', $this->renderList($package->inclusions ?? []), $html);
            $html = str_replace('{{PACKAGE_EXCLUSIONS}}', $this->renderList($package->exclusions ?? []), $html);
        } else {
            $html = str_replace('{{PACKAGE_PRICE}}', '', $html);
            $html = str_replace('{{PACKAGE_PEOPLE}}', 1, $html);
            $html = str_replace('{{PACKAGE_START_LOCATION}}', 'Not specified', $html);
            $html = str_replace('{{PACKAGE_VALID_TILL}}', 'Not specified', $html);
            $html = str_replace('{{PACKAGE_DESCRIPTION}}', '', $html);
            $html = str_replace('{{PACKAGE_INCLUSIONS}}', '', $html);
            $html = str_replace('{{PACKAGE_EXCLUSIONS}}', '', $html);
        }

        // Cover image
        $coverImageHtml = '';
        if ($itinerary->cover_image) {
            $coverImageBase64 = $imageBase64Map[$itinerary->cover_image] ?? $itinerary->cover_image;
            $coverImageHtml = '<div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: url(\'' . $coverImageBase64 . '\'); background-size: cover; background-position: center;"></div>';
        }
        $html = str_replace('{{COVER_IMAGE}}', $coverImageHtml, $html);

        // Company logo
        $logoHtml = '';
        if ($companyDetails && $companyDetails->logo) {
            $logoBase64 = $imageBase64Map[$companyDetails->logo] ?? $companyDetails->logo;
            $logoHtml = '<img src="' . $logoBase64 . '" alt="Company Logo" style="max-height: 50px; max-width: 150px; object-fit: contain;" />';
        }
        $html = str_replace('{{COMPANY_LOGO}}', $logoHtml, $html);

        // Days content
        $daysHtml = $this->generateDaysHTML($days, $imageBase64Map);
        $html = str_replace('{{DAYS_CONTENT}}', $daysHtml, $html);

        // Social media links
        $socialLinksHtml = $this->generateSocialLinksHTML($companyDetails);
        $html = str_replace('{{SOCIAL_LINKS}}', $socialLinksHtml, $html);

        return $html;
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
     * Generate HTML for days content
     */
    private function generateDaysHTML($days, $imageBase64Map)
    {
        $html = '';
        $pageNumber = 3; // Start from page 3 (after cover and summary)

        foreach ($days as $day) {
            $events = $day['events'] ?? [];
            
            // Regular events page
            $html .= '<div style="page-break-before: always; font-family: Arial, sans-serif; line-height: 1.4; color: #333; width: 210mm; padding: 20px; margin: 0; min-height: 297mm; background: white; position: relative; padding-bottom: 60px;">';
            $html .= '<div style="text-align: center; margin-bottom: 30px;">';
            $html .= '<h1 style="font-size: 24px; font-weight: bold; margin: 0 0 8px 0; color: #1f2937; text-transform: uppercase;">DETAILED ITINERARY</h1>';
            $html .= '<h2 style="font-size: 18px; font-weight: 600; margin: 0; color: #059669; font-style: italic;">' . htmlspecialchars($day['title']) . '</h2>';
            $html .= '<div style="font-size: 12px; color: #6b7280;">' . date('D, M j, Y') . '</div>';
            $html .= '</div>';

            $html .= '<div style="margin-bottom: 30px;">';
            
            foreach ($events as $event) {
                $html .= $this->generateEventHTML($event, $imageBase64Map);
            }
            
            $html .= '</div>';
            $html .= $this->createFooter($pageNumber);
            $html .= '</div>';
            
            $pageNumber++;
        }

        return $html;
    }

    /**
     * Generate HTML for a single event
     */
    private function generateEventHTML($event, $imageBase64Map)
    {
        $html = '<div style="margin-bottom: 20px; page-break-inside: avoid;">';
        
        // Event title
        $html .= '<h4 style="font-size: 16px; font-weight: bold; color: #1f2937; margin: 0 0 8px 0; text-transform: uppercase;">';
        $html .= htmlspecialchars($event['title']);
        $html .= '</h4>';
        
        // Event details
        $html .= '<div style="margin-bottom: 12px; font-size: 14px; color: #374151; line-height: 1.6;">';
        if (isset($event['category'])) {
            $html .= htmlspecialchars($event['category']);
        }
        if (isset($event['subCategory']) && $event['subCategory'] !== $event['category']) {
            $html .= ' | ' . htmlspecialchars($event['subCategory']);
        }
        if (isset($event['type'])) {
            $html .= ' | <strong>Type:</strong> ' . htmlspecialchars($event['type']);
        }
        if (isset($event['time'])) {
            $html .= ' | <strong>Time:</strong> ' . htmlspecialchars($event['time']);
        }
        $html .= '</div>';
        
        // Event description
        if (isset($event['notes']) && $event['notes']) {
            $html .= '<div style="margin-bottom: 12px;">';
            $html .= '<p style="font-size: 14px; color: #374151; margin: 0; line-height: 1.6; text-align: justify;">';
            $html .= strip_tags($event['notes']);
            $html .= '</p>';
            $html .= '</div>';
        }
        
        // Event images
        if (isset($event['images']) && is_array($event['images']) && count($event['images']) > 0) {
            $html .= $this->generateImageGrid($event['images'], $imageBase64Map);
        }
        
        // Price information
        if (isset($event['amount']) && $event['amount']) {
            $html .= '<div style="margin-top: 8px; font-size: 13px; color: #166534; font-weight: 600;">';
            $html .= '<strong>Cost:</strong> ' . ($event['currency'] ?? 'USD') . ' ' . number_format($event['amount']);
            if (isset($event['bookedThrough'])) {
                $html .= ' (Booked through: ' . htmlspecialchars($event['bookedThrough']) . ')';
            }
            $html .= '</div>';
        }
        
        $html .= '<div style="border-bottom: 1px solid #e5e7eb; margin: 15px 0;"></div>';
        $html .= '</div>';
        
        return $html;
    }

    /**
     * Generate image grid HTML
     */
    private function generateImageGrid($images, $imageBase64Map, $maxImages = 4)
    {
        if (empty($images)) return '';
        
        $displayImages = array_slice($images, 0, $maxImages);
        $remainingCount = count($images) - $maxImages;
        
        if (count($displayImages) === 1) {
            $imageBase64 = $imageBase64Map[$displayImages[0]] ?? $displayImages[0];
            return '<div style="margin: 15px 0; text-align: center;">
                <img src="' . $imageBase64 . '" alt="Event image" style="max-width: 100%; max-height: 250px; object-fit: cover; border-radius: 6px;" />
            </div>';
        }
        
        if (count($displayImages) === 2) {
            $html = '<div style="display: flex; gap: 12px; margin: 15px 0;">';
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
        $html = '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 15px 0;">';
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

    /**
     * Create footer HTML
     */
    private function createFooter($pageNumber)
    {
        return '<div style="position: absolute; bottom: 20px; left: 40px; right: 40px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 15px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; gap: 30px;">
                    <span><strong>Mobile:</strong> {{COMPANY_PHONE}}</span>
                    <span><strong>Email:</strong> {{COMPANY_EMAIL}}</span>
                </div>
                <div style="font-weight: 600;">Page ' . $pageNumber . '</div>
            </div>
        </div>';
    }

    /**
     * Get the main HTML template
     */
    private function getHTMLTemplate()
    {
        return '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{{ITINERARY_TITLE}}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.4;
            color: #333;
            margin: 0;
            padding: 0;
        }
        .page {
            width: 210mm;
            min-height: 297mm;
            margin: 0;
            padding: 0;
            background: white;
            position: relative;
        }
        .cover-page {
            position: relative;
            min-height: 297mm;
            page-break-after: always;
        }
        .header-section {
            position: relative;
            height: 180px;
            margin: 0;
            overflow: hidden;
        }
        .cover-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.3);
        }
        .header-content {
            position: relative;
            z-index: 2;
            text-align: center;
            padding: 50px 20px;
            color: white;
        }
        .company-info {
            text-align: center;
            padding: 20px;
            border-bottom: 2px solid #e5e7eb;
        }
        .package-details {
            padding: 25px;
        }
        .package-details-flex {
            display: flex;
            gap: 20px;
            margin-bottom: 25px;
            align-items: flex-start;
        }
        .package-details-column {
            flex: 1;
        }
        .cost-column {
            flex: 1;
            text-align: center;
        }
        .cost-box {
            background: #f0fdf4;
            padding: 20px;
            border: 1px solid #bbf7d0;
            border-radius: 8px;
        }
        .contact-info {
            background: #f8f9fa;
            padding: 15px;
            border-left: 4px solid #dc2626;
        }
        .footer {
            position: absolute;
            bottom: 20px;
            left: 40px;
            right: 40px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 15px;
        }
        .footer-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .footer-left {
            display: flex;
            gap: 30px;
        }
        .summary-page {
            page-break-before: always;
            font-family: Arial, sans-serif;
            line-height: 1.4;
            color: #333;
            width: 210mm;
            padding: 40px;
            margin: 0;
            min-height: 297mm;
            background: white;
            position: relative;
            padding-bottom: 80px;
            page-break-after: always;
        }
        .day-item {
            margin-bottom: 15px;
            padding: 12px;
            background: #f8f9fa;
            border-left: 4px solid #3b82f6;
            border-radius: 4px;
        }
        .day-title {
            font-weight: bold;
            color: #1f2937;
            font-size: 14px;
        }
        .day-date {
            font-size: 12px;
            font-weight: normal;
            color: #718096;
        }
        .inclusions-exclusions {
            page-break-before: always;
            font-family: Arial, sans-serif;
            line-height: 1.4;
            color: #333;
            width: 210mm;
            padding: 20px;
            margin: 0;
            min-height: 297mm;
            background: white;
            position: relative;
            padding-bottom: 60px;
        }
        .inclusions-exclusions-flex {
            display: flex;
            gap: 20px;
            margin-bottom: 20px;
        }
        .inclusions-section, .exclusions-section {
            flex: 1;
        }
        .inclusions-title {
            font-size: 14px;
            font-weight: bold;
            margin: 0 0 10px 0;
            color: #166534;
        }
        .exclusions-title {
            font-size: 14px;
            font-weight: bold;
            margin: 0 0 10px 0;
            color: #dc2626;
        }
        .list-item {
            margin-bottom: 5px;
        }
        .company-details-section {
            margin-top: 30px;
            padding: 15px;
            background: #f8f9fa;
            border-left: 3px solid #3b82f6;
        }
        .company-name {
            font-size: 14px;
            font-weight: bold;
            margin: 0 0 10px 0;
            color: #1f2937;
        }
        .company-info-details {
            font-size: 12px;
            color: #4b5563;
            line-height: 1.5;
        }
        .company-info-item {
            margin-bottom: 3px;
        }
        .social-links {
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid #cbd5e1;
        }
        .social-links-title {
            font-weight: bold;
            margin-bottom: 5px;
            color: #1f2937;
        }
        .social-links-list {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        .social-link {
            color: #1e40af;
            text-decoration: underline;
            font-size: 11px;
        }
    </style>
</head>
<body>
    <!-- Cover Page -->
    <div class="page cover-page">
        <!-- Header with Cover Image -->
        <div class="header-section">
            {{COVER_IMAGE}}
            <div class="cover-overlay"></div>
            <div class="header-content">
                <h1 style="font-size: 32px; font-weight: bold; margin: 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.7); text-transform: uppercase; letter-spacing: 1px;">{{ITINERARY_TITLE}}</h1>
            </div>
        </div>

        <!-- Company Information -->
        <div class="company-info">
            {{COMPANY_LOGO}}
            <div style="font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 5px;">{{COMPANY_NAME}}</div>
            <div style="font-size: 12px; color: #6b7280;">Travel & Tourism</div>
        </div>

        <!-- Package Details -->
        <div class="package-details">
            <div class="package-details-flex">
                <div class="package-details-column">
                    <h3 style="font-size: 16px; font-weight: bold; margin: 0 0 10px 0; color: #374151;">Package Details</h3>
                    <div style="font-size: 14px; color: #4b5563; line-height: 1.6;">
                        <div style="margin-bottom: 8px;"><strong>Date of Travel:</strong> ' . date('F j, Y') . '</div>
                        <div style="margin-bottom: 8px;"><strong>Number of Pax:</strong> {{PACKAGE_PEOPLE}} Adults</div>
                        <div style="margin-bottom: 8px;"><strong>Number of Room:</strong> ' . ceil(($package->people ?? 1) / 2) . ' Room</div>
                        <div style="margin-bottom: 8px;"><strong>Valid Till:</strong> {{PACKAGE_VALID_TILL}}</div>
                        <div style="margin-bottom: 8px;"><strong>Start Location:</strong> {{PACKAGE_START_LOCATION}}</div>
                        <div><strong>Mode of Transport:</strong> Tempo Traveler</div>
                    </div>
                </div>
                
                <div class="cost-column">
                    <div class="cost-box">
                        <h3 style="font-size: 16px; font-weight: bold; margin: 0 0 10px 0; color: #166534;">Total Cost</h3>
                        <div style="font-size: 24px; font-weight: bold; color: #166534; margin-bottom: 5px;">{{PACKAGE_PRICE}}</div>
                        <div style="font-size: 12px; color: #15803d;">Per Person</div>
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom: 25px; padding: 15px; background: #f8f9fa; border-left: 4px solid #3b82f6; border-radius: 4px;">
                <h3 style="font-size: 16px; font-weight: bold; margin: 0 0 10px 0; color: #1f2937;">Package Description</h3>
                <div style="font-size: 14px; color: #374151; line-height: 1.6;">{{PACKAGE_DESCRIPTION}}</div>
            </div>
            
            <!-- Contact Information -->
            <div class="contact-info">
                <h4 style="font-size: 14px; font-weight: bold; margin: 0 0 10px 0; color: #dc2626;">For more info:</h4>
                <div style="font-size: 12px; color: #1e40af; line-height: 1.5;">
                    <div style="margin-bottom: 3px;"><strong>Website:</strong> {{COMPANY_WEBSITE}}</div>
                    <div style="margin-bottom: 3px;"><strong>Email:</strong> {{COMPANY_EMAIL}}</div>
                    <div style="margin-bottom: 3px;"><strong>Phone:</strong> {{COMPANY_PHONE}}</div>
                    <div style="margin-bottom: 3px;"><strong>Address:</strong> {{COMPANY_ADDRESS}}</div>
                </div>
                
                <!-- Regards Section -->
                <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #cbd5e1;">
                    <div style="font-size: 12px; color: #374151; line-height: 1.5;">
                        <div style="font-weight: bold; margin-bottom: 5px;">Regards (For any enquiries, please feel free to call us):</div>
                        <div style="margin-bottom: 3px;"><strong>{{COMPANY_NAME}}</strong> - {{COMPANY_PHONE}}</div>
                        <div><strong>Office</strong> - {{COMPANY_PHONE}}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Page 1 Footer -->
        <div class="footer">
            <div class="footer-content">
                <div class="footer-left">
                    <span><strong>Mobile:</strong> {{COMPANY_PHONE}}</span>
                    <span><strong>Email:</strong> {{COMPANY_EMAIL}}</span>
                </div>
                <div style="font-weight: 600;">Page 1</div>
            </div>
        </div>
    </div>
    
    <!-- Page 2: Package Summary -->
    <div class="page summary-page">
        <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 10px 0; color: #1f2937;">Brief Itinerary</h1>
        </div>
        
        <div style="margin-bottom: 30px;">
            {{DAYS_CONTENT}}
        </div>
        
        <!-- Page 2 Footer -->
        <div class="footer">
            <div class="footer-content">
                <div class="footer-left">
                    <span><strong>Mobile:</strong> {{COMPANY_PHONE}}</span>
                    <span><strong>Email:</strong> {{COMPANY_EMAIL}}</span>
                </div>
                <div style="font-weight: 600;">Page 2</div>
            </div>
        </div>
    </div>

    <!-- Inclusions & Exclusions Page -->
    <div class="page inclusions-exclusions">
        <!-- Page Header -->
        <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 15px;">
            <h1 style="font-size: 18px; font-weight: bold; margin: 0; color: #1f2937;">Inclusions & Exclusions</h1>
        </div>

        <!-- Inclusions & Exclusions in Flex Layout -->
        <div class="inclusions-exclusions-flex">
            <!-- Inclusions Section -->
            <div class="inclusions-section">
                <h3 class="inclusions-title">✓ Inclusions</h3>
                <div style="font-size: 12px; color: #374151; line-height: 1.5;">{{PACKAGE_INCLUSIONS}}</div>
            </div>

            <!-- Exclusions Section -->
            <div class="exclusions-section">
                <h3 class="exclusions-title">✗ Exclusions</h3>
                <div style="font-size: 12px; color: #374151; line-height: 1.5;">{{PACKAGE_EXCLUSIONS}}</div>
            </div>
        </div>

        <!-- Contact Information -->
        <div class="company-details-section">
            <h3 class="company-name">{{COMPANY_NAME}}</h3>
            <div class="company-info-details">
                <div class="company-info-item"><strong>Website:</strong> {{COMPANY_WEBSITE}}</div>
                <div class="company-info-item"><strong>Email:</strong> {{COMPANY_EMAIL}}</div>
                <div class="company-info-item"><strong>Phone:</strong> {{COMPANY_PHONE}}</div>
                <div class="company-info-item"><strong>Address:</strong> {{COMPANY_ADDRESS}}</div>
                
                <!-- Social Media Links -->
                <div class="social-links">
                    <div class="social-links-title">Follow Us:</div>
                    <div class="social-links-list">{{SOCIAL_LINKS}}</div>
                </div>
            </div>
        </div>

        <!-- Page Footer -->
        <div class="footer">
            <div class="footer-content">
                <div class="footer-left">
                    <span><strong>Mobile:</strong> {{COMPANY_PHONE}}</span>
                    <span><strong>Email:</strong> {{COMPANY_EMAIL}}</span>
                </div>
                <div style="font-weight: 600;">Page 3</div>
            </div>
        </div>
    </div>
</body>
</html>';
    }
}
