<?php

use Illuminate\Http\Request;
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


// Serve storage files with CORS headers
Route::get('/storage/{path}', function (Request $request, $path) {
    $filePath = storage_path('app/public/' . $path);
    
    if (!file_exists($filePath)) {
        return response('Image not found', 404);
    }
    
    $mimeType = mime_content_type($filePath);
    if (!$mimeType) {
        $mimeType = 'application/octet-stream';
    }
    
    $fileContent = file_get_contents($filePath);
    $origin = $request->header('Origin');
    
    $response = response($fileContent, 200)
        ->header('Content-Type', $mimeType)
        ->header('Cache-Control', 'public, max-age=3600')
        ->header('Content-Length', strlen($fileContent));
    
    // Add CORS headers directly
    if ($origin === 'http://localhost:5173' || $origin === 'http://127.0.0.1:5173') {
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
})->where('path', '.*');

Route::options('/storage/{path}', function (Request $request, $path) {
    $origin = $request->header('Origin');
    
    $response = response('', 200);
    
    if ($origin === 'http://localhost:5173' || $origin === 'http://127.0.0.1:5173') {
        $response->header('Access-Control-Allow-Origin', $origin);
    } else {
        $response->header('Access-Control-Allow-Origin', 'http://localhost:5173');
    }
    
    $response->header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    $response->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    $response->header('Access-Control-Allow-Credentials', 'true');
    $response->header('Access-Control-Max-Age', '86400');
    
    return $response;
})->where('path', '.*');
