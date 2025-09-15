<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;

class ImageServeController extends Controller
{
    /**
     * Serve images with proper CORS headers
     */
    public function serve(Request $request, $path)
    {
        // Construct the full file path
        $filePath = storage_path('app/public/' . $path);
        
        // Check if file exists
        if (!file_exists($filePath)) {
            return response('Image not found', 404);
        }
        
        // Get MIME type
        $mimeType = mime_content_type($filePath);
        if (!$mimeType) {
            $mimeType = 'application/octet-stream';
        }
        
        // Read file content
        $fileContent = file_get_contents($filePath);
        
        // Get origin from request
        $origin = $request->header('Origin');
        $allowedOrigins = [
            env('FRONTEND_URL', 'http://localhost:5173'),
            env('FRONTEND_URL_ALT', 'http://127.0.0.1:5173'),
            'http://localhost:5173',
            'http://127.0.0.1:5173'
        ];
        
        // Create response with proper headers
        $response = response($fileContent, 200)
            ->header('Content-Type', $mimeType)
            ->header('Cache-Control', 'public, max-age=3600')
            ->header('Content-Length', strlen($fileContent));
        
        // Add CORS headers
        if (in_array($origin, $allowedOrigins)) {
            $response->header('Access-Control-Allow-Origin', $origin);
        } else {
            $response->header('Access-Control-Allow-Origin', 'http://localhost:5173');
        }
        
        $response->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        $response->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
        $response->header('Access-Control-Expose-Headers', 'Content-Type, Content-Length');
        $response->header('Access-Control-Allow-Credentials', 'true');
        $response->header('Access-Control-Max-Age', '86400');
        
        return $response;
    }
    
    /**
     * Handle OPTIONS requests for CORS preflight
     */
    public function options(Request $request, $path)
    {
        $origin = $request->header('Origin');
        $allowedOrigins = [
            env('FRONTEND_URL', 'http://localhost:5173'),
            env('FRONTEND_URL_ALT', 'http://127.0.0.1:5173'),
            'http://localhost:5173',
            'http://127.0.0.1:5173'
        ];
        
        $response = response('', 200);
        
        if (in_array($origin, $allowedOrigins)) {
            $response->header('Access-Control-Allow-Origin', $origin);
        } else {
            $response->header('Access-Control-Allow-Origin', 'http://localhost:5173');
        }
        
        $response->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        $response->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
        $response->header('Access-Control-Allow-Credentials', 'true');
        $response->header('Access-Control-Max-Age', '86400');
        
        return $response;
    }
}
