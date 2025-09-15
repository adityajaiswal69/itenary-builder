<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AddCorsHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        // Handle preflight OPTIONS requests
        if ($request->getMethod() === 'OPTIONS') {
            $response = response('', 200);
        } else {
            $response = $next($request);
        }
        
        // Add CORS headers for storage files and API requests
        $path = $request->path();
        $origin = $request->header('Origin');
        
        // Define allowed origins
        $allowedOrigins = [
            env('FRONTEND_URL', 'http://localhost:5173'),
            env('FRONTEND_URL_ALT', 'http://127.0.0.1:5173'),
            'http://localhost:5173',
            'http://127.0.0.1:5173'
        ];
        
        // Check if this is a storage or API request
        if (str_starts_with($path, 'storage/') || str_starts_with($path, 'api/')) {
            // Set the appropriate origin
            if (in_array($origin, $allowedOrigins)) {
                $response->headers->set('Access-Control-Allow-Origin', $origin);
            } else {
                $response->headers->set('Access-Control-Allow-Origin', 'http://localhost:5173');
            }
            
            $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
            $response->headers->set('Access-Control-Expose-Headers', 'Content-Type, Content-Length');
            $response->headers->set('Access-Control-Allow-Credentials', 'true');
            $response->headers->set('Access-Control-Max-Age', '86400');
        }
        
        return $response;
    }
}
