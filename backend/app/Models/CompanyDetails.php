<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class CompanyDetails extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'company_name',
        'logo',
        'email',
        'phone',
        'address',
        'website',
        'facebook_url',
        'whatsapp_url',
        'instagram_url',
        'youtube_url',
        'description',
    ];

    /**
     * Convert storage URLs to API image URLs for logo
     */
    public function getLogoAttribute($value)
    {
        if (!$value) {
            return $value;
        }
        
        // If it's already an API URL or external URL, return as is
        if (str_contains($value, '/api/images/') || str_starts_with($value, 'http')) {
            return $value;
        }
        
        // Convert storage URL to API URL
        if (str_contains($value, '/storage/images/')) {
            $filename = basename($value);
            return url('/api/images/' . $filename);
        }
        
        return $value;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
