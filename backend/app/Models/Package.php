<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Package extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'itinerary_id',
        'title',
        'start_location',
        'valid_till',
        'description',
        'price',
        'price_type',
        'locations',
        'inclusions',
        'exclusions',
        'cover_image',
        'is_published'
    ];

    protected $casts = [
        'description' => 'array',
        'locations' => 'array',
        'inclusions' => 'array',
        'exclusions' => 'array',
        'valid_till' => 'date',
        'is_published' => 'boolean'
    ];

    public function itinerary()
    {
        return $this->belongsTo(Itinerary::class);
    }
}
