<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InvestmentPlan extends Model
{
    protected $fillable = [
        'name',
        'description',
        'min_amount',
        'max_amount',
        'daily_return_rate',
        'duration_days',
        'total_return_rate',
        'is_active',
        'risk_level',
        'features'
    ];

    protected $casts = [
        'features' => 'array',
        'is_active' => 'boolean'
    ];

    /**
     * Get the user investments for this plan.
     */
    public function userInvestments()
    {
        return $this->hasMany(UserInvestment::class);
    }
}
