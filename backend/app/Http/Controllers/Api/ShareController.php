<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Itinerary;
use Illuminate\Http\Request;

class ShareController extends Controller
{
    public function show($shareUuid)
    {
        \Log::info('Share request received for UUID: ' . $shareUuid);
        
        try {
            $itinerary = Itinerary::where('share_uuid', $shareUuid)
                ->where('is_published', true)
                ->with(['packages', 'user:id,name,email,phone'])
                ->first();
            
            if (!$itinerary) {
                \Log::warning('Itinerary not found or not published for UUID: ' . $shareUuid);
                
                // Check if itinerary exists but is not published
                $unpublishedItinerary = Itinerary::where('share_uuid', $shareUuid)->first();
                if ($unpublishedItinerary) {
                    \Log::info('Itinerary found but not published. Published status: ' . ($unpublishedItinerary->is_published ? 'true' : 'false'));
                } else {
                    \Log::info('No itinerary found with this share_uuid');
                }
                
                return response()->json(['error' => 'Itinerary not found or not published'], 404);
            }
            
            \Log::info('Itinerary found and returned successfully');
            return response()->json($itinerary);
        } catch (\Exception $e) {
            \Log::error('Error in ShareController: ' . $e->getMessage());
            return response()->json(['error' => 'Internal server error'], 500);
        }
    }
}
