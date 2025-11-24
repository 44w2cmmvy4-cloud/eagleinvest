<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\UserInvestment;

class ProfileController extends Controller
{
    public function __invoke(Request $request)
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
            ],
            'investment_overview' => [
                'active_investments' => $activeInvestments,
                'total_portfolio_value' => $totalPortfolioValue,
                'average_return' => round($averageReturn, 2),
            ]
        ]);
    }
}
