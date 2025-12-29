<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ReferralController extends Controller
{
    /**
     * Generar token de invitación
     */
    public function generateInvitationToken(Request $request)
    {
        try {
            $user = $request->user();
            
            // Generar token único
            $token = Str::random(32) . '-' . $user->id . '-' . time();
            
            // Crear registro en la tabla invitation_tokens
            $invitation = DB::table('invitation_tokens')->insert([
                'token' => hash('sha256', $token),
                'sponsor_id' => $user->id,
                'used' => false,
                'expires_at' => now()->addDays(30), // Expira en 30 días
                'created_at' => now(),
                'updated_at' => now()
            ]);
            
            return response()->json([
                'success' => true,
                'token' => $token,
                'invitation_link' => url("/register-invitation?token={$token}"),
                'expires_at' => now()->addDays(30)->toDateString()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error al generar token de invitación: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Validar token de invitación
     */
    public function validateInvitationToken(Request $request)
    {
        $token = $request->input('token');
        
        if (!$token) {
            return response()->json([
                'valid' => false,
                'message' => 'Token no proporcionado'
            ], 400);
        }
        
        // Buscar token en la base de datos
        $invitation = DB::table('invitation_tokens')
            ->where('token', hash('sha256', $token))
            ->where('used', false)
            ->where('expires_at', '>', now())
            ->first();
        
        if (!$invitation) {
            return response()->json([
                'valid' => false,
                'message' => 'Token inválido o expirado'
            ]);
        }
        
        // Obtener información del sponsor
        $sponsor = User::find($invitation->sponsor_id);
        
        return response()->json([
            'valid' => true,
            'sponsor_id' => $sponsor->id,
            'sponsor_name' => $sponsor->name,
            'sponsor_email' => $sponsor->email
        ]);
    }
    
    /**
     * Registrar usuario por invitación
     */
    public function registerByInvitation(Request $request)
    {
        $request->validate([
            'username' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'password_confirmation' => 'required|string|same:password',
            'phone' => 'required|string',
            'country_code' => 'required|string|max:2',
            'invitation_token' => 'required|string',
        ]);
        
        DB::beginTransaction();
        
        try {
            // Validar token
            $hashedToken = hash('sha256', $request->invitation_token);
            $invitation = DB::table('invitation_tokens')
                ->where('token', $hashedToken)
                ->where('used', false)
                ->where('expires_at', '>', now())
                ->first();
            
            if (!$invitation) {
                return response()->json([
                    'error' => 'Token de invitación inválido o expirado'
                ], 400);
            }
            
            // Crear usuario
            $user = User::create([
                'name' => $request->username,
                'email' => $request->email,
                'password' => bcrypt($request->password),
                'phone' => $request->phone,
                'country' => $request->country_code,
                'referred_by' => $invitation->sponsor_id,
                'referral_code' => strtoupper(Str::random(8))
            ]);
            
            // Marcar token como usado
            DB::table('invitation_tokens')
                ->where('id', $invitation->id)
                ->update([
                    'used' => true,
                    'used_at' => now(),
                    'invited_user_id' => $user->id,
                    'updated_at' => now()
                ]);
            
            // Crear relación de referido directo (nivel 1)
            DB::table('referrals')->insert([
                'sponsor_id' => $invitation->sponsor_id,
                'referred_id' => $user->id,
                'level' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ]);
            
            // Construir árbol de referidos hasta 10 niveles
            $this->buildReferralTree($user->id, $invitation->sponsor_id, 2);
            
            DB::commit();
            
            // Generar token de autenticación
            $token = $user->createToken('api-token')->plainTextToken;
            
            return response()->json([
                'success' => true,
                'message' => 'Usuario registrado exitosamente',
                'user' => $user,
                'token' => $token
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'error' => 'Error al registrar usuario: ' . $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Construir árbol de referidos hasta 10 niveles
     */
    private function buildReferralTree($newUserId, $directSponsorId, $startLevel = 2)
    {
        if ($startLevel > 10) {
            return; // Máximo 10 niveles
        }
        
        // Obtener patrocinadores de nivel superior
        $upperSponsors = DB::table('referrals')
            ->where('referred_id', $directSponsorId)
            ->where('active', true)
            ->get();
        
        foreach ($upperSponsors as $upperSponsor) {
            // Crear relación con patrocinador de nivel superior
            DB::table('referrals')->insert([
                'sponsor_id' => $upperSponsor->sponsor_id,
                'referred_id' => $newUserId,
                'level' => $startLevel,
                'created_at' => now(),
                'updated_at' => now()
            ]);
            
            // Continuar construyendo el árbol recursivamente
            if ($startLevel < 10) {
                $this->buildReferralTree($newUserId, $upperSponsor->sponsor_id, $startLevel + 1);
            }
        }
    }
    
    /**
     * Obtener red de referidos de un usuario
     */
    public function getReferralNetwork(Request $request)
    {
        $user = $request->user();
        
        // Obtener todos los referidos por nivel
        $referrals = DB::table('referrals')
            ->join('users', 'referrals.referred_id', '=', 'users.id')
            ->where('referrals.sponsor_id', $user->id)
            ->where('referrals.active', true)
            ->select(
                'referrals.level',
                'users.id',
                'users.name',
                'users.email',
                'users.created_at',
                'referrals.commission_earned'
            )
            ->orderBy('referrals.level')
            ->orderBy('users.created_at', 'desc')
            ->get()
            ->groupBy('level');
        
        $stats = [];
        $totalReferrals = 0;
        $totalCommissions = 0;
        
        for ($i = 1; $i <= 10; $i++) {
            $levelReferrals = $referrals->get($i, collect());
            $count = $levelReferrals->count();
            $commissions = $levelReferrals->sum('commission_earned');
            
            $stats[] = [
                'level' => $i,
                'count' => $count,
                'commissions' => $commissions,
                'users' => $levelReferrals->values()
            ];
            
            $totalReferrals += $count;
            $totalCommissions += $commissions;
        }
        
        return response()->json([
            'success' => true,
            'total_referrals' => $totalReferrals,
            'total_commissions' => $totalCommissions,
            'levels' => $stats
        ]);
    }
}
