<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ReferralNetwork extends Model
{
    use HasFactory;

    protected $table = 'referral_network';

    protected $fillable = [
        'user_id',
        'sponsor_id',
        'level',
        'path',
        'is_active',
        'total_invested',
        'direct_referrals_count',
        'total_network_count',
        'rank',
        'last_investment_at',
    ];

    protected $casts = [
        'total_invested' => 'decimal:2',
        'is_active' => 'boolean',
        'direct_referrals_count' => 'integer',
        'total_network_count' => 'integer',
        'last_investment_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Usuario en la red
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Patrocinador directo
     */
    public function sponsor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sponsor_id');
    }

    /**
     * Referidos directos de este usuario
     */
    public function directReferrals(): HasMany
    {
        return $this->hasMany(self::class, 'sponsor_id', 'user_id');
    }

    /**
     * Scopes
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByRank($query, $rank)
    {
        return $query->where('rank', $rank);
    }

    public function scopeDirectReferralsOf($query, $userId)
    {
        return $query->where('sponsor_id', $userId)->where('level', 1);
    }

    /**
     * Obtener upline completo (todos los patrocinadores hacia arriba)
     */
    public function getUplineAttribute(): array
    {
        if (empty($this->path)) {
            return [];
        }

        $userIds = explode('/', trim($this->path, '/'));
        return User::whereIn('id', $userIds)->get()->toArray();
    }

    /**
     * Obtener downline completo (toda la red debajo)
     */
    public function getDownlineAttribute()
    {
        return self::where('path', 'like', "%/{$this->user_id}/%")
                   ->orWhere('sponsor_id', $this->user_id)
                   ->get();
    }

    /**
     * Actualizar rank basado en reglas
     */
    public function updateRank(): void
    {
        $directCount = $this->direct_referrals_count;
        $totalNetwork = $this->total_network_count;

        $newRank = 'bronce'; // Default

        if ($directCount >= 50 && $totalNetwork >= 200) {
            $newRank = 'platino';
        } elseif ($directCount >= 25 && $totalNetwork >= 50) {
            $newRank = 'oro';
        } elseif ($directCount >= 10 && $totalNetwork >= 10) {
            $newRank = 'plata';
        } elseif ($directCount >= 3) {
            $newRank = 'bronce';
        }

        if ($this->rank !== $newRank) {
            $this->update(['rank' => $newRank]);
        }
    }

    /**
     * Activar usuario en la red
     */
    public function activate(): void
    {
        $this->update([
            'is_active' => true,
            'last_investment_at' => now(),
        ]);
    }

    /**
     * Desactivar usuario en la red
     */
    public function deactivate(): void
    {
        $this->update(['is_active' => false]);
    }

    /**
     * Incrementar total invertido
     */
    public function addInvestment(float $amount): void
    {
        $this->increment('total_invested', $amount);
        $this->update(['last_investment_at' => now()]);
        $this->activate();
    }

    /**
     * Recalcular contadores de red
     */
    public function recalculateNetworkCounts(): void
    {
        // Contar referidos directos
        $directCount = self::where('sponsor_id', $this->user_id)->count();
        
        // Contar total en red (hasta 5 niveles)
        $totalCount = self::where('path', 'like', "%/{$this->user_id}/%")
                          ->orWhere('sponsor_id', $this->user_id)
                          ->count();

        $this->update([
            'direct_referrals_count' => $directCount,
            'total_network_count' => $totalCount,
        ]);

        // Actualizar rank
        $this->updateRank();
    }
}
