<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SimplePDFController extends Controller
{
    /**
     * Generate simple PDF with images
     */
    public function generatePDF(Request $request)
    {
        try {
            $itinerary = $request->input('itinerary');
            $currentPackage = $request->input('currentPackage');
            $user = $request->input('user');
            
            if (!$itinerary) {
                return response()->json(['error' => 'Itinerary data is required'], 400);
            }
            
            // Simple HTML content with images
            $html = $this->generateHTML($itinerary, $currentPackage, $user);
            
            // Return HTML for now (you can convert to PDF later)
            return response($html)
                ->header('Content-Type', 'text/html');
                
        } catch (\Exception $e) {
            Log::error('PDF Generation Error: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to generate PDF: ' . $e->getMessage()], 500);
        }
    }
    
    /**
     * Generate HTML content
     */
    private function generateHTML($itinerary, $currentPackage, $user)
    {
        $coverImage = $this->getCorsEnabledImageUrl($itinerary['cover_image'] ?? '');
        $title = $itinerary['title'] ?? 'Itinerary';
        
        $html = '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>' . htmlspecialchars($title) . '</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .cover-image { width: 100%; max-height: 300px; object-fit: cover; }
        .event-image { width: 200px; height: 150px; object-fit: cover; margin: 10px; }
        .day { margin: 20px 0; padding: 15px; border: 1px solid #ddd; }
        .event { margin: 10px 0; padding: 10px; background: #f9f9f9; }
    </style>
</head>
<body>
    <h1>' . htmlspecialchars($title) . '</h1>';
    
        // Cover image
        if ($coverImage) {
            $html .= '<img src="' . htmlspecialchars($coverImage) . '" alt="Cover Image" class="cover-image" />';
        }
        
        // Days and events
        if (isset($itinerary['content']['days'])) {
            foreach ($itinerary['content']['days'] as $dayIndex => $day) {
                $html .= '<div class="day">';
                $html .= '<h2>Day ' . ($dayIndex + 1) . ': ' . htmlspecialchars($day['title'] ?? '') . '</h2>';
                
                if (isset($day['events'])) {
                    foreach ($day['events'] as $event) {
                        $html .= '<div class="event">';
                        $html .= '<h3>' . htmlspecialchars($event['title'] ?? '') . '</h3>';
                        
                        if (isset($event['images']) && is_array($event['images'])) {
                            foreach ($event['images'] as $image) {
                                $corsImage = $this->getCorsEnabledImageUrl($image);
                                $html .= '<img src="' . htmlspecialchars($corsImage) . '" alt="Event Image" class="event-image" />';
                            }
                        }
                        
                        $html .= '</div>';
                    }
                }
                
                $html .= '</div>';
            }
        }
        
        $html .= '</body></html>';
        
        return $html;
    }
    
    /**
     * Convert storage URL to CORS-enabled proxy URL
     */
    private function getCorsEnabledImageUrl($imageUrl)
    {
        if (empty($imageUrl)) {
            return '';
        }
        
        // If it's already a proxy URL, return as is
        if (strpos($imageUrl, '/api/image-proxy/') !== false) {
            return $imageUrl;
        }
        
        // Extract filename from storage URL
        $filename = basename($imageUrl);
        
        // Convert to proxy URL
        $baseUrl = config('app.url');
        return $baseUrl . '/api/image-proxy/' . $filename;
    }
}
