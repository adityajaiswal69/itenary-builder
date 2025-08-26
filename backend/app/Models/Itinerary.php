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
        'is_published',
        'share_uuid'
    ];

    protected $casts = [
        'content' => 'array',
        'is_published' => 'boolean'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function packages()
    {
        return $this->hasMany(Package::class);
    }
}
