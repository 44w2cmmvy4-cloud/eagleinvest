<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlanLevel extends Model
{
    use HasFactory;

    protected $fillable = [
        'plan_name',
        'min_investment',
        'max_level',
        'monthly_cap',
        'minimum_days',
        'minimum_withdrawal',
        'level_commissions'
    ];

    protected $casts = [
        'min_investment' => 'decimal:2',
        'monthly_cap' => 'decimal:2',
        'minimum_withdrawal' => 'decimal:2',
        'level_commissions' => 'array'
    ];

    public static function getPlanByAmount($amount): ?self
    {
        if ($amount >= 5000) {
            return self::where('plan_name', 'Platino')->first();
        } elseif ($amount >= 1000) {
            return self::where('plan_name', 'Oro')->first();
        } elseif ($amount >= 100) {
            return self::where('plan_name', 'Plata')->first();
        } elseif ($amount >= 10) {
            return self::where('plan_name', 'Bronce')->first();
        }
        return null;
    }

    public function getCommissionForLevel(int $level): float
    {
        if (!$this->level_commissions || !isset($this->level_commissions[$level])) {
            return 0;
        }
        return (float) $this->level_commissions[$level];
    }

    public function canAccessLevel(int $level): bool
    {
        return $level <= $this->max_level;
    }
}
