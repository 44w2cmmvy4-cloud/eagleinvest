<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MonthlyCommissionCap extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'year',
        'month',
        'plan_name',
        'earned_amount',
        'cap_limit',
        'cap_reached'
    ];

    protected $casts = [
        'earned_amount' => 'decimal:2',
        'cap_limit' => 'decimal:2',
        'cap_reached' => 'boolean'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function canEarnMore(): bool
    {
        return !$this->cap_reached && $this->earned_amount < $this->cap_limit;
    }

    public function getRemainingAmount(): float
    {
        return max(0, $this->cap_limit - $this->earned_amount);
    }

    public function addEarnings(float $amount): bool
    {
        if (!$this->canEarnMore()) {
            return false;
        }

        $remaining = $this->getRemainingAmount();
        $toAdd = min($amount, $remaining);

        $this->earned_amount += $toAdd;
        
        if ($this->earned_amount >= $this->cap_limit) {
            $this->cap_reached = true;
        }

        $this->save();

        return true;
    }

    public static function getOrCreateForUser(int $userId, string $planName): self
    {
        $year = now()->year;
        $month = now()->month;

        $plan = PlanLevel::where('plan_name', $planName)->first();
        $capLimit = $plan ? $plan->monthly_cap : 0;

        return self::firstOrCreate(
            [
                'user_id' => $userId,
                'year' => $year,
                'month' => $month,
                'plan_name' => $planName
            ],
            [
                'earned_amount' => 0,
                'cap_limit' => $capLimit,
                'cap_reached' => false
            ]
        );
    }
}
