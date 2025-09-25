<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Itinerary extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'title',
        'content',
        'cover_image',
        'is_published',
        'share_uuid'
    ];

    protected $casts = [
        'content' => 'array',
        'is_published' => 'boolean'
    ];

    /**
     * Convert storage URLs to API image URLs in content
     */
    public function getContentAttribute($value)
    {
        $content = json_decode($value, true);
        
        if (!$content) {
            return $content;
        }
        
        // Recursively convert image URLs in content
        $content = $this->convertImageUrlsInContent($content);
        
        return $content;
    }

    /**
     * Recursively convert image URLs in content array
     */
    private function convertImageUrlsInContent($data)
    {
        if (is_array($data)) {
            foreach ($data as $key => $value) {
                if (is_array($value)) {
                    $data[$key] = $this->convertImageUrlsInContent($value);
                } elseif (is_string($value) && str_contains($value, '/storage/images/')) {
                    $filename = basename($value);
                    $data[$key] = url('/api/images/' . $filename);
                }
            }
        }
        
        return $data;
    }

    /**
     * Convert storage URLs to API image URLs
     */
    public function getCoverImageAttribute($value)
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

    public function packages()
    {
        return $this->hasMany(Package::class);
    }
}
