<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupportTicket extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'subject',
        'description',
        'old_wallet',
        'new_wallet',
        'status',
        'identity_verified',
        'admin_notes',
        'rejection_reason',
        'assigned_to',
        'resolved_by',
        'resolved_at'
    ];

    protected $casts = [
        'identity_verified' => 'boolean',
        'resolved_at' => 'datetime'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function resolvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }

    public function scopeOpen($query)
    {
        return $query->whereIn('status', ['open', 'in_review', 'pending_verification']);
    }

    public function scopeWalletChange($query)
    {
        return $query->where('type', 'wallet_change');
    }

    public function canBeApproved(): bool
    {
        return $this->status === 'pending_verification' && $this->identity_verified;
    }
}
