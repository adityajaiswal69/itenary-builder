<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Itinerary;
use App\Models\Package;
use App\Services\PDFService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PDFController extends Controller
{
    protected $pdfService;

    public function __construct(PDFService $pdfService)
    {
        $this->pdfService = $pdfService;
    }

    /**
     * Generate PDF for an itinerary
     */
    public function generateItineraryPDF(Request $request, $itineraryId)
    {
        try {
            // Find the itinerary with its related data
            $itinerary = Itinerary::with(['user.companyDetails', 'packages'])
                ->findOrFail($itineraryId);

            // Get the associated package (first one if multiple)
            $package = $itinerary->packages->first();

            // Generate PDF using the service
            $pdf = $this->pdfService->generateItineraryPDF($itinerary, $package);

            // Generate filename
            $filename = $this->generateFilename($itinerary->title);

            // Return PDF as download
            return response($pdf->output(), 200)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', 'attachment; filename="' . $filename . '"')
                ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
                ->header('Pragma', 'no-cache')
                ->header('Expires', '0');

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to generate PDF: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate PDF for a package
     */
    public function generatePackagePDF(Request $request, $packageId)
    {
        try {
            // Find the package with its related data
            $package = Package::with(['itinerary.user.companyDetails'])
                ->findOrFail($packageId);

            if (!$package->itinerary) {
                return response()->json([
                    'success' => false,
                    'error' => 'No itinerary found for this package'
                ], 404);
            }

            // Generate PDF using the service
            $pdf = $this->pdfService->generateItineraryPDF($package->itinerary, $package);

            // Generate filename
            $filename = $this->generateFilename($package->title);

            // Return PDF as download
            return response($pdf->output(), 200)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', 'attachment; filename="' . $filename . '"')
                ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
                ->header('Pragma', 'no-cache')
                ->header('Expires', '0');

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to generate PDF: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate a safe filename for the PDF
     */
    private function generateFilename($title)
    {
        $cleanTitle = preg_replace('/[^a-zA-Z0-9\s\-_]/', '', $title);
        $cleanTitle = preg_replace('/\s+/', '_', trim($cleanTitle));
        $cleanTitle = strtolower($cleanTitle);
        
        return $cleanTitle . '_itinerary.pdf';
    }
}
