<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Commission extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'from_user_id',
        'investment_id',
        'level',
        'investment_amount',
        'percentage',
        'amount',
        'status',
        'paid_at',
        'notes',
    ];

    protected $casts = [
        'investment_amount' => 'decimal:2',
        'percentage' => 'decimal:2',
        'amount' => 'decimal:2',
        'paid_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Usuario que recibe la comisión
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Usuario que generó la inversión (downline)
     */
    public function fromUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'from_user_id');
    }

    /**
     * Inversión que generó esta comisión
     */
    public function investment(): BelongsTo
    {
        return $this->belongsTo(UserInvestment::class, 'investment_id');
    }

    /**
     * Scopes
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeThisMonth($query)
    {
        return $query->whereMonth('created_at', now()->month)
                    ->whereYear('created_at', now()->year);
    }

    /**
     * Marcar comisión como pagada
     */
    public function markAsPaid(): void
    {
        $this->update([
            'status' => 'paid',
            'paid_at' => now(),
        ]);
    }

    /**
     * Cancelar comisión
     */
    public function cancel(string $reason = null): void
    {
        $this->update([
            'status' => 'cancelled',
            'notes' => $reason,
        ]);
    }
}
