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
            'content' => 'required|array'
        ]);

        $itinerary = Auth::user()->itineraries()->create([
            'title' => $request->title,
            'content' => $request->content,
            'share_uuid' => Str::uuid()
        ]);

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
            'content' => 'sometimes|array',
            'cover_image' => 'sometimes|string',
            'is_published' => 'sometimes|boolean'
        ]);

        $itinerary = Auth::user()->itineraries()->findOrFail($id);
        
        // If publishing and no share_uuid exists, generate one
        if ($request->has('is_published') && $request->is_published && !$itinerary->share_uuid) {
            $itinerary->update([
                'title' => $request->title ?? $itinerary->title,
                'content' => $request->content ?? $itinerary->content,
                'cover_image' => $request->cover_image ?? $itinerary->cover_image,
                'is_published' => true,
                'share_uuid' => Str::uuid()
            ]);
        } else {
            $itinerary->update($request->only(['title', 'content', 'cover_image', 'is_published']));
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
