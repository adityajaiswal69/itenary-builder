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
});

// Public shareable routes
Route::get('/share/{shareUuid}', [\App\Http\Controllers\Api\ShareController::class, 'show']);
