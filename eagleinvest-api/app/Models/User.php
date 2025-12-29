<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'phone_number',
        'firebase_uid',
        'phone_verified',
        'country',
        'language',
        'wallet',
        'wallet_editable',
        'referral_code',
        'sponsor_id',
        'value_cortyycado',
        'requires_invitation',
        'total_invested',
        'total_earnings',
        'earnings_balance',
        'referral_balance',
        'blocked_balance',
        'total_withdrawn',
        'active_investments',
        'total_referrals',
        'notifications_enabled',
        'two_factor_enabled'
    ];

    /**
     * Get the user's investments.
     */
    public function userInvestments()
    {
        return $this->hasMany(UserInvestment::class);
    }

    /**
     * Get the user's transactions.
     */
    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * Get the user's withdrawals.
     */
    public function withdrawals()
    {
        return $this->hasMany(Withdrawal::class);
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_enabled' => 'boolean',
            'phone_verified' => 'boolean',
            'wallet_editable' => 'boolean',
            'value_cortyycado' => 'boolean',
            'requires_invitation' => 'boolean',
            'is_admin' => 'boolean',
            'notifications_enabled' => 'boolean'
        ];
    }
}
