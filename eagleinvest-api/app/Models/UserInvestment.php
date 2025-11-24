<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserInvestment extends Model
{
    protected $fillable = [
        'user_id',
        'investment_plan_id',
        'amount',
        'daily_return',
        'total_earned',
        'start_date',
        'end_date',
        'status',
        'last_earning_date',
        'days_completed',
        'metadata'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'last_earning_date' => 'datetime',
        'metadata' => 'array'
    ];

    /**
     * Get the user that owns the investment.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the investment plan.
     */
    public function investmentPlan()
    {
        return $this->belongsTo(InvestmentPlan::class);
    }
}
