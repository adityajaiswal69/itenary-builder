<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Itinerary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class ItineraryController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $itineraries = Auth::user()->itineraries()->with('packages')->get();
        return response()->json($itineraries);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required'
        ]);

        // Validate content data
        $content = $request->input('content');
        if (!is_array($content) && !is_object($content)) {
            return response()->json(['error' => 'Content must be a valid data structure'], 400);
        }

        // Test JSON serialization
        try {
            $jsonContent = json_encode($content);
            if ($jsonContent === false) {
                return response()->json(['error' => 'Content contains invalid data that cannot be serialized'], 400);
            }
            
            // Check content size
            if (strlen($jsonContent) > 1000000) { // 1MB limit for content
                return response()->json(['error' => 'Content data is too large'], 400);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => 'Content contains invalid data that cannot be serialized'], 400);
        }

        $itineraryData = [
            'title' => $request->title,
            'content' => $request->content,
            'share_uuid' => Str::uuid()
        ];

        // Add cover image if provided
        if ($request->has('cover_image') && $request->input('cover_image')) {
            $coverImage = $request->input('cover_image');
            
            // Validate cover image
            if (!is_string($coverImage)) {
                return response()->json(['error' => 'Cover image must be a valid string'], 400);
            }
            
            if (strlen($coverImage) > 65000) {
                return response()->json(['error' => 'Cover image data is too large. Please use a smaller image or compress it.'], 400);
            }
            
            if (!filter_var($coverImage, FILTER_VALIDATE_URL) && !preg_match('/^data:image\//', $coverImage)) {
                return response()->json(['error' => 'Cover image must be a valid URL or data URL'], 400);
            }
            
            $itineraryData['cover_image'] = $coverImage;
        }

        $itinerary = Auth::user()->itineraries()->create($itineraryData);

        return response()->json($itinerary, 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $itinerary = Auth::user()->itineraries()->with('packages')->findOrFail($id);
        return response()->json($itinerary);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'title' => 'sometimes|string|max:255',
            'content' => 'sometimes',
            'cover_image' => 'sometimes|string|max:65000', // Conservative limit for TEXT field
            'is_published' => 'sometimes|boolean'
        ]);

        $itinerary = Auth::user()->itineraries()->findOrFail($id);
        
        // Log the request data for debugging
        \Log::info('Itinerary update request data:', [
            'id' => $id,
            'request_data' => $request->all(),
            'cover_image_length' => $request->has('cover_image') ? strlen($request->input('cover_image')) : 'not set',
            'content_size' => $request->has('content') ? strlen(json_encode($request->input('content'))) : 'not set',
            'content_type' => $request->has('content') ? gettype($request->input('content')) : 'not set'
        ]);
        
        // Sanitize cover image data
        $coverImage = null;
        if ($request->has('cover_image') && $request->input('cover_image')) {
            $coverImage = $request->input('cover_image');
            
            // Ensure it's a valid string
            if (!is_string($coverImage)) {
                return response()->json(['error' => 'Cover image must be a valid string'], 400);
            }
            
            // Check if it's a valid data URL or regular URL
            // TEXT field can hold up to 65,535 characters
            if (strlen($coverImage) > 65000) { // Leave some buffer
                return response()->json(['error' => 'Cover image data is too large. Please use a smaller image or compress it.'], 400);
            }
            
            // Validate that it's a proper data URL or URL
            if (!filter_var($coverImage, FILTER_VALIDATE_URL) && !preg_match('/^data:image\//', $coverImage)) {
                return response()->json(['error' => 'Cover image must be a valid URL or data URL'], 400);
            }
        }
        
        // Validate content data
        if ($request->has('content')) {
            $content = $request->input('content');
            
            // Ensure content is an array or object that can be serialized
            if (!is_array($content) && !is_object($content)) {
                return response()->json(['error' => 'Content must be a valid data structure'], 400);
            }
            
            // Test JSON serialization
            try {
                $jsonContent = json_encode($content);
                if ($jsonContent === false) {
                    return response()->json(['error' => 'Content contains invalid data that cannot be serialized'], 400);
                }
                
                // Check content size
                if (strlen($jsonContent) > 1000000) { // 1MB limit for content
                    return response()->json(['error' => 'Content data is too large'], 400);
                }
            } catch (\Exception $e) {
                return response()->json(['error' => 'Content contains invalid data that cannot be serialized'], 400);
            }
        }
        
        try {
            // Prepare update data
            $updateData = [];
            
            if ($request->has('title')) {
                $updateData['title'] = $request->title;
            }
            if ($request->has('content')) {
                $updateData['content'] = $request->input('content');
            }
            if ($coverImage !== null) {
                $updateData['cover_image'] = $coverImage;
            }
            if ($request->has('is_published')) {
                $updateData['is_published'] = $request->boolean('is_published');
            }
            
            // If publishing and no share_uuid exists, generate one
            if ($request->has('is_published') && $request->boolean('is_published') && !$itinerary->share_uuid) {
                $updateData['is_published'] = true;
                $updateData['share_uuid'] = Str::uuid();
            }
            
            $itinerary->update($updateData);
                } catch (\Exception $e) {
            \Log::error('Failed to update itinerary:', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);
            
            // Provide more specific error messages
            if (strpos($e->getMessage(), 'Data too long') !== false) {
                return response()->json(['error' => 'Data is too long for the database field. Please reduce the size of your content or cover image.'], 400);
            }
            
            if (strpos($e->getMessage(), 'syntax error') !== false) {
                return response()->json(['error' => 'Invalid data format. Please check your input.'], 400);
            }
            
            throw $e;
            
        }

        return response()->json($itinerary);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $itinerary = Auth::user()->itineraries()->findOrFail($id);
        $itinerary->delete();

        return response()->json(['message' => 'Itinerary deleted successfully']);
    }
}
