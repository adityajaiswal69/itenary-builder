<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

// Serve storage files with CORS headers - this must come before any other routes
Route::get('/storage/{path}', function ($path) {
    $filePath = storage_path('app/public/' . $path);
    
    if (!file_exists($filePath)) {
        abort(404);
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
})->where('path', '.*')->name('storage.cors');

// Handle OPTIONS requests for CORS preflight
Route::options('/storage/{path}', function () {
    return response('')
        ->header('Access-Control-Allow-Origin', '*')
        ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        ->header('Access-Control-Max-Age', '86400');
})->where('path', '.*');

// Test CORS image loading
Route::get('/test-cors', function () {
    return '
    <!DOCTYPE html>
    <html>
    <head>
        <title>CORS Test</title>
    </head>
    <body>
        <h1>CORS Image Test</h1>
        <p>Testing if images load with CORS headers...</p>
        <img src="/api/image-proxy/8bea967e-f0c3-4a8a-8a45-68e517de325a.jpeg" alt="Test Image" style="max-width: 300px;" />
        <p>If you can see the image above, CORS is working!</p>
    </body>
    </html>
    ';
});