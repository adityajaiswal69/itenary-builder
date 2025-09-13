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
        $response = $next($request);
        
        // Add CORS headers for storage files and API requests
        if (str_starts_with($request->path(), 'storage/') || str_starts_with($request->path(), 'api/')) {
            $response->headers->set('Access-Control-Allow-Origin', env('FRONTEND_URL', 'http://localhost:5173'));
            $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
            $response->headers->set('Access-Control-Expose-Headers', 'Content-Type');
            $response->headers->set('Access-Control-Allow-Credentials', 'true');
        }
        
        return $response;
    }
}
