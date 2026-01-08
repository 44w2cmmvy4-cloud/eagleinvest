<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WithdrawalWallet extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'wallet_type',
        'wallet_address',
        'wallet_label',
        'is_verified',
        'is_primary',
        'verified_at',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
        'is_primary' => 'boolean',
        'verified_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Usuario propietario de la wallet
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scopes
     */
    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    public function scopePrimary($query)
    {
        return $query->where('is_primary', true);
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('wallet_type', $type);
    }

    /**
     * Verificar wallet
     */
    public function verify(): void
    {
        $this->update([
            'is_verified' => true,
            'verified_at' => now(),
        ]);
    }

    /**
     * Establecer como wallet principal
     */
    public function setPrimary(): void
    {
        // Remover primary de otras wallets del usuario
        self::where('user_id', $this->user_id)
            ->where('id', '!=', $this->id)
            ->update(['is_primary' => false]);

        // Establecer esta como primary
        $this->update(['is_primary' => true]);
    }

    /**
     * Validar dirección según tipo
     */
    public static function validateAddress(string $type, string $address): bool
    {
        switch ($type) {
            case 'usdt_trc20':
                // TRC20 address starts with 'T' and is 34 characters
                return preg_match('/^T[A-Za-z0-9]{33}$/', $address);
            
            case 'bitcoin':
                // Bitcoin address validation (simplified)
                return preg_match('/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/', $address);
            
            case 'ethereum':
            case 'usdt_erc20':
                // Ethereum address starts with '0x' and is 42 characters
                return preg_match('/^0x[a-fA-F0-9]{40}$/', $address);
            
            default:
                return false;
        }
    }

    /**
     * Obtener label de tipo de wallet
     */
    public function getWalletTypeLabel(): string
    {
        $labels = [
            'usdt_trc20' => 'USDT (TRC20)',
            'usdt_erc20' => 'USDT (ERC20)',
            'bitcoin' => 'Bitcoin',
            'ethereum' => 'Ethereum',
            'bank' => 'Cuenta Bancaria',
        ];

        return $labels[$this->wallet_type] ?? $this->wallet_type;
    }
}
