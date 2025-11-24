<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = [
        'user_id',
        'investment_id',
        'type',
        'amount',
        'description',
        'status',
        'reference_id',
        'metadata',
        'processed_at'
    ];

    protected $casts = [
        'metadata' => 'array',
        'processed_at' => 'datetime'
    ];

    /**
     * Get the user that owns the transaction.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the investment associated with the transaction.
     */
    public function investment()
    {
        return $this->belongsTo(Investment::class);
    }
}
