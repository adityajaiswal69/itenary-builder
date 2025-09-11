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
        'description',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
