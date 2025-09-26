<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Authentication routes
Route::post('/register', [\App\Http\Controllers\Api\AuthController::class, 'register']);
Route::post('/login', [\App\Http\Controllers\Api\AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [\App\Http\Controllers\Api\AuthController::class, 'user']);
    Route::post('/logout', [\App\Http\Controllers\Api\AuthController::class, 'logout']);
    Route::apiResource('itineraries', \App\Http\Controllers\Api\ItineraryController::class);
    Route::apiResource('packages', \App\Http\Controllers\Api\PackageController::class);
    
    // Company details routes
    Route::get('/company-details', [\App\Http\Controllers\Api\CompanyDetailsController::class, 'show']);
    Route::post('/company-details', [\App\Http\Controllers\Api\CompanyDetailsController::class, 'store']);
    Route::put('/company-details/{id}', [\App\Http\Controllers\Api\CompanyDetailsController::class, 'update']);
    Route::delete('/company-details/{id}', [\App\Http\Controllers\Api\CompanyDetailsController::class, 'destroy']);
    
    // Image upload routes
    Route::post('/images/upload', [\App\Http\Controllers\Api\ImageController::class, 'upload']);
    Route::post('/images/upload-multiple', [\App\Http\Controllers\Api\ImageController::class, 'uploadMultiple']);
    Route::delete('/images/delete', [\App\Http\Controllers\Api\ImageController::class, 'delete']);
    
    // PDF generation routes
    Route::get('/itineraries/{itineraryId}/pdf', [\App\Http\Controllers\Api\PDFController::class, 'generateItineraryPDF']);
    Route::get('/packages/{packageId}/pdf', [\App\Http\Controllers\Api\PDFController::class, 'generatePackagePDF']);
});

// Public shareable routes
Route::get('/share/{shareUuid}', [\App\Http\Controllers\Api\ShareController::class, 'show']);

// Public image serving route with CORS headers
Route::get('/images/{filename}', function ($filename) {
    $path = storage_path('app/public/images/' . $filename);

    if (!file_exists($path)) {
        abort(404);
    }

    return response()->file($path, [
        'Access-Control-Allow-Origin' => 'https://itenary.myaiplanet.com',
        'Access-Control-Allow-Credentials' => 'true',
    ]);
});

// Handle preflight OPTIONS requests for images
Route::options('/images/{filename}', function () {
    return response('', 200)
        ->header('Access-Control-Allow-Origin', 'https://itenary.myaiplanet.com')
        ->header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        ->header('Access-Control-Allow-Credentials', 'true')
        ->header('Access-Control-Max-Age', '86400');
});