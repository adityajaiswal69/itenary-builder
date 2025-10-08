<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ImageProxyController extends Controller
{
    /**
     * Serve image with CORS headers
     */
    public function serveImage(Request $request, $filename)
    {
        try {
            $filePath = storage_path('app/public/images/' . $filename);
            
            if (!file_exists($filePath)) {
                return response()->json(['error' => 'Image not found'], 404);
            }
            
            $file = file_get_contents($filePath);
            $mimeType = mime_content_type($filePath);
            
            return response($file)
                ->header('Content-Type', $mimeType)
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
                ->header('Access-Control-Expose-Headers', 'Content-Type')
                ->header('Cache-Control', 'public, max-age=3600');
                
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to serve image'], 500);
        }
    }
}
