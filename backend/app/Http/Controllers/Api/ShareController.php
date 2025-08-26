<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Itinerary;
use Illuminate\Http\Request;

class ShareController extends Controller
{
    public function show($shareUuid)
    {
        $itinerary = Itinerary::where('share_uuid', $shareUuid)
            ->where('is_published', true)
            ->with('packages')
            ->firstOrFail();

        return response()->json($itinerary);
    }
}
