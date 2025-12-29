<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\UserInvestment;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        $user = Auth::user();

        $user->load('investments.plan');

        $activeInvestments = $user->investments->count();
        $totalPortfolioValue = $user->investments->sum('amount');

        $totalReturn = $user->investments->reduce(function ($carry, $investment) {
            return $carry + ($investment->amount * ($investment->plan->return_rate / 100));
        }, 0);

        $averageReturn = ($totalPortfolioValue > 0) ? ($totalReturn / $totalPortfolioValue) * 100 : 0;


        return response()->json([
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
                'phone_number' => $user->phone_number,
                'address' => $user->address,
                'member_since' => $user->created_at->toFormattedDateString(),
                'two_factor_enabled' => (boolean)$user->two_factor_enabled,
            ],
            'investment_overview' => [
                'active_investments' => $activeInvestments,
                'total_portfolio_value' => $totalPortfolioValue,
                'average_return' => round($averageReturn, 2),
            ]
        ]);
    }

    public function update(Request $request)
    {
        \Illuminate\Support\Facades\Log::info('Profile update request received', [
            'user_id' => Auth::id(),
            'data' => $request->all()
        ]);

        $user = Auth::user();
        
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'phone_number' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'two_factor_enabled' => 'sometimes|boolean',
        ]);

        \Illuminate\Support\Facades\Log::info('Profile update validation passed', ['validated' => $validated]);

        $user->update($validated);

        return response()->json([
            'message' => 'Perfil actualizado exitosamente',
            'user' => $user
        ]);
    }
}
