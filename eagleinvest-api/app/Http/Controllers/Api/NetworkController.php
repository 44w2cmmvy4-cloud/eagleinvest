<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ReferralNetwork;
use App\Models\User;
use App\Models\Commission;
use Illuminate\Http\Request;

class NetworkController extends Controller
{
    /**
     * Obtener nivel actual del usuario
     */
    public function getUserLevel(Request $request, $userId)
    {
        $network = ReferralNetwork::where('user_id', $userId)->first();

        if (!$network) {
            // Crear registro de red si no existe
            $network = ReferralNetwork::create([
                'user_id' => $userId,
                'sponsor_id' => User::find($userId)->sponsor_id,
                'level' => 1,
                'rank' => 'bronce',
            ]);
        }

        $levelRules = $this->getLevelRules();
        $currentLevel = $levelRules[$network->rank];
        
        // Determinar siguiente nivel
        $nextLevelKey = match($network->rank) {
            'bronce' => 'plata',
            'plata' => 'oro',
            'oro' => 'platino',
            'platino' => null,
            default => null
        };

        $nextLevel = $nextLevelKey ? $levelRules[$nextLevelKey] : null;

        // Calcular progreso al siguiente nivel
        $progressToNext = 0;
        if ($nextLevel) {
            $directProgress = min(100, ($network->direct_referrals_count / $nextLevel['minDirectReferrals']) * 100);
            $networkProgress = min(100, ($network->total_network_count / $nextLevel['minTotalNetwork']) * 100);
            $progressToNext = min($directProgress, $networkProgress);
        }

        return response()->json([
            'currentLevel' => array_merge($currentLevel, ['key' => $network->rank]),
            'nextLevel' => $nextLevel ? array_merge($nextLevel, ['key' => $nextLevelKey]) : null,
            'progressToNext' => $progressToNext,
            'stats' => [
                'directReferrals' => $network->direct_referrals_count,
                'totalNetwork' => $network->total_network_count,
                'totalInvested' => $network->total_invested,
                'isActive' => $network->is_active,
            ]
        ]);
    }

    /**
     * Obtener red completa del usuario
     */
    public function getUserNetwork(Request $request, $userId)
    {
        $user = User::with(['referrals.userInvestments', 'network'])->findOrFail($userId);
        
        // Construir árbol de red recursivamente
        $networkTree = $this->buildNetworkTree($user, 1, 5);

        return response()->json($networkTree);
    }

    /**
     * Obtener referidos directos
     */
    public function getDirectReferrals(Request $request, $userId)
    {
        $referrals = User::where('sponsor_id', $userId)
            ->with(['network', 'userInvestments'])
            ->get()
            ->map(function ($referral) {
                return [
                    'id' => $referral->id,
                    'name' => $referral->name,
                    'email' => $referral->email,
                    'joined_at' => $referral->created_at,
                    'is_active' => $referral->network ? $referral->network->is_active : false,
                    'total_invested' => $referral->network ? $referral->network->total_invested : 0,
                    'rank' => $referral->network ? $referral->network->rank : 'bronce',
                    'investments_count' => $referral->userInvestments->count(),
                ];
            });

        return response()->json($referrals);
    }

    /**
     * Obtener estadísticas de red
     */
    public function getNetworkStats(Request $request, $userId)
    {
        $network = ReferralNetwork::where('user_id', $userId)->first();

        if (!$network) {
            return response()->json([
                'directReferrals' => 0,
                'activeReferrals' => 0,
                'totalNetwork' => 0,
                'totalInvested' => 0,
                'rank' => 'bronce',
                'levelBreakdown' => []
            ]);
        }

        // Contar referidos activos
        $activeCount = ReferralNetwork::where('path', 'like', "%/{$userId}/%")
            ->where('is_active', true)
            ->count();

        // Breakdown por nivel
        $levelBreakdown = [];
        for ($i = 1; $i <= 5; $i++) {
            $count = ReferralNetwork::where('path', 'like', "%/{$userId}/%")
                ->where('level', $i)
                ->count();
            $levelBreakdown["level_$i"] = $count;
        }

        return response()->json([
            'directReferrals' => $network->direct_referrals_count,
            'activeReferrals' => $activeCount,
            'totalNetwork' => $network->total_network_count,
            'totalInvested' => $network->total_invested,
            'rank' => $network->rank,
            'levelBreakdown' => $levelBreakdown
        ]);
    }

    /**
     * Construir árbol de red recursivamente
     */
    private function buildNetworkTree(User $user, int $currentLevel, int $maxLevel): array
    {
        if ($currentLevel > $maxLevel) {
            return [];
        }

        $network = $user->network;

        $node = [
            'userId' => $user->id,
            'username' => $user->name,
            'email' => $user->email,
            'level' => $currentLevel,
            'rank' => $network ? $network->rank : 'bronce',
            'isActive' => $network ? $network->is_active : false,
            'totalInvested' => $network ? $network->total_invested : 0,
            'directReferrals' => $network ? $network->direct_referrals_count : 0,
            'children' => []
        ];

        // Obtener hijos (referidos directos)
        $referrals = User::where('sponsor_id', $user->id)
            ->with('network')
            ->get();

        foreach ($referrals as $referral) {
            $node['children'][] = $this->buildNetworkTree($referral, $currentLevel + 1, $maxLevel);
        }

        return $node;
    }

    /**
     * Obtener reglas de niveles
     */
    private function getLevelRules(): array
    {
        return [
            'bronce' => [
                'name' => 'Bronce',
                'minDirectReferrals' => 3,
                'minTotalNetwork' => 0,
                'commissionPercentages' => [10, 5, 3, 2, 1],
                'color' => '#CD7F32',
            ],
            'plata' => [
                'name' => 'Plata',
                'minDirectReferrals' => 10,
                'minTotalNetwork' => 10,
                'commissionPercentages' => [10, 5, 3, 2, 1],
                'color' => '#C0C0C0',
            ],
            'oro' => [
                'name' => 'Oro',
                'minDirectReferrals' => 25,
                'minTotalNetwork' => 50,
                'commissionPercentages' => [10, 5, 3, 2, 1],
                'color' => '#FFD700',
            ],
            'platino' => [
                'name' => 'Platino',
                'minDirectReferrals' => 50,
                'minTotalNetwork' => 200,
                'commissionPercentages' => [10, 5, 3, 2, 1],
                'color' => '#E5E4E2',
            ],
        ];
    }
}
