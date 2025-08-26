<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Package;
use App\Models\Itinerary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PackageController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $packages = Package::whereHas('itinerary', function($query) {
            $query->where('user_id', Auth::id());
        })->with('itinerary')->get();
        
        return response()->json($packages);
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
            'itinerary_id' => 'required|uuid|exists:itineraries,id',
            'title' => 'required|string|max:255',
            'start_location' => 'required|string|max:255',
            'valid_till' => 'required|date|after:today',
            'description' => 'required|array',
            'price' => 'required|integer|min:0',
            'price_type' => 'required|in:per_person,total',
            'locations' => 'required|array',
            'inclusions' => 'required|array',
            'exclusions' => 'required|array',
            'cover_image' => 'sometimes|string'
        ]);

        // Verify user owns the itinerary
        $itinerary = Auth::user()->itineraries()->findOrFail($request->itinerary_id);

        $package = $itinerary->packages()->create($request->all());

        return response()->json($package, 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $package = Package::whereHas('itinerary', function($query) {
            $query->where('user_id', Auth::id());
        })->with('itinerary')->findOrFail($id);
        
        return response()->json($package);
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
            'start_location' => 'sometimes|string|max:255',
            'valid_till' => 'sometimes|date|after:today',
            'description' => 'sometimes|array',
            'price' => 'sometimes|integer|min:0',
            'price_type' => 'sometimes|in:per_person,total',
            'locations' => 'sometimes|array',
            'inclusions' => 'sometimes|array',
            'exclusions' => 'sometimes|array',
            'cover_image' => 'sometimes|string',
            'is_published' => 'sometimes|boolean'
        ]);

        $package = Package::whereHas('itinerary', function($query) {
            $query->where('user_id', Auth::id());
        })->findOrFail($id);

        $package->update($request->all());

        return response()->json($package);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $package = Package::whereHas('itinerary', function($query) {
            $query->where('user_id', Auth::id());
        })->findOrFail($id);

        $package->delete();

        return response()->json(['message' => 'Package deleted successfully']);
    }
}
