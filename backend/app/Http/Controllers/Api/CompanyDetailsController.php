<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CompanyDetails;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class CompanyDetailsController extends Controller
{
    /**
     * Get the authenticated user's company details.
     *
     * @return \Illuminate\Http\Response
     */
    public function show()
    {
        $user = Auth::user();
        $companyDetails = $user->companyDetails;
        
        return response()->json([
            'success' => true,
            'data' => $companyDetails
        ]);
    }

    /**
     * Store or update the authenticated user's company details.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'company_name' => 'required|string|max:255',
            'logo' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:1000',
            'website' => 'nullable|url|max:255',
            'description' => 'nullable|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::user();
        
        $companyDetails = $user->companyDetails()->updateOrCreate(
            ['user_id' => $user->id],
            $request->only([
                'company_name',
                'logo',
                'email',
                'phone',
                'address',
                'website',
                'description'
            ])
        );

        return response()->json([
            'success' => true,
            'message' => 'Company details saved successfully',
            'data' => $companyDetails
        ]);
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
        return $this->store($request);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $user = Auth::user();
        $companyDetails = $user->companyDetails;
        
        if ($companyDetails) {
            $companyDetails->delete();
            return response()->json([
                'success' => true,
                'message' => 'Company details deleted successfully'
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Company details not found'
        ], 404);
    }
}
