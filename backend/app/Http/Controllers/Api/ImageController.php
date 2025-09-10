<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageController extends Controller
{
    /**
     * Upload a single image
     */
    public function upload(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp,bmp,svg|max:10240', // 10MB max
        ]);

        try {
            $file = $request->file('image');
            $originalName = $file->getClientOriginalName();
            $extension = $file->getClientOriginalExtension();
            
            // Generate unique filename
            $filename = Str::uuid() . '.' . $extension;
            
            // Store the original file
            $path = $file->storeAs('public/images', $filename);
            
            return response()->json([
                'success' => true,
                'filename' => $filename,
                'path' => url(Storage::url($path)),
                'original_name' => $originalName,
                'size' => $file->getSize(),
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to upload image: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload multiple images
     */
    public function uploadMultiple(Request $request)
    {
        $request->validate([
            'images' => 'required|array|max:6', // Max 6 images
            'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp,bmp,svg|max:10240', // 10MB max each
        ]);

        try {
            $uploadedImages = [];
            
            foreach ($request->file('images') as $file) {
                $originalName = $file->getClientOriginalName();
                $extension = $file->getClientOriginalExtension();
                
                // Generate unique filename
                $filename = Str::uuid() . '.' . $extension;
                
                // Store the original file
                $path = $file->storeAs('public/images', $filename);
                
                $uploadedImages[] = [
                    'filename' => $filename,
                    'path' => url(Storage::url($path)),
                    'original_name' => $originalName,
                    'size' => $file->getSize(),
                ];
            }
            
            return response()->json([
                'success' => true,
                'images' => $uploadedImages,
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to upload images: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete an image
     */
    public function delete(Request $request)
    {
        $request->validate([
            'filename' => 'required|string',
        ]);

        try {
            $filename = $request->filename;
            
            // Validate filename to prevent directory traversal
            if (strpos($filename, '..') !== false || strpos($filename, '/') !== false) {
                return response()->json([
                    'success' => false,
                    'error' => 'Invalid filename'
                ], 400);
            }
            
            // Check if file exists before trying to delete
            $filePath = 'public/images/' . $filename;
            if (!Storage::exists($filePath)) {
                return response()->json([
                    'success' => false,
                    'error' => 'Image not found'
                ], 404);
            }
            
            // Delete the image file
            $deleted = Storage::delete($filePath);
            
            if ($deleted) {
                return response()->json([
                    'success' => true,
                    'message' => 'Image deleted successfully'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'error' => 'Failed to delete image file'
                ], 500);
            }
            
        } catch (\Exception $e) {
            \Log::error('Image deletion failed:', [
                'filename' => $request->filename,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'error' => 'Failed to delete image: ' . $e->getMessage()
            ], 500);
        }
    }
}
