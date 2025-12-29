<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\FirebaseService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Kreait\Firebase\Exception\Auth\FailedToVerifyToken;

class ReferralController extends Controller
{
    protected FirebaseService $firebase;

    public function __construct(FirebaseService $firebase)
    {
        $this->firebase = $firebase;
    }

    /**
     * Verificar si hay enlace de invitación válido
     * Diagrama: "Usuario llega a la Web"
     */
    public function checkInvitation(Request $request)
    {
        $referralCode = $request->query('ref');

        if (!$referralCode) {
            // NO tiene enlace de invitación
            return response()->json([
                'has_invitation' => false,
                'message' => 'Sin enlace de invitación. Solo puedes ver información.',
                'can_register' => false
            ]);
        }

        // SÍ tiene enlace - Detectar ID del Patrocinador
        $sponsor = User::where('referral_code', $referralCode)->first();

        if (!$sponsor) {
            return response()->json([
                'has_invitation' => false,
                'message' => 'Código de invitación inválido',
                'can_register' => false
            ], 404);
        }

        return response()->json([
            'has_invitation' => true,
            'sponsor' => [
                'id' => $sponsor->id,
                'name' => $sponsor->name,
                'referral_code' => $sponsor->referral_code
            ],
            'can_register' => true,
            'message' => 'Código de invitación válido. Puedes proceder con el registro.'
        ]);
    }

    /**
     * Registro con validación de invitación obligatoria y Firebase Phone Auth
     * Diagrama: "Usuario llega a la Web"
     */
    public function register(Request $request)
    {
        // Validar datos
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'wallet' => 'required|string|max:255',
            'referral_code' => 'required|exists:users,referral_code',
            'phone_number' => 'required|string|max:20',
            'firebase_id_token' => 'required|string' // Token de Firebase después de verificar teléfono
        ]);

        // Detectar patrocinador
        $sponsor = User::where('referral_code', $request->referral_code)->first();

        if (!$sponsor) {
            return response()->json([
                'error' => '¿Datos Válidos? NO',
                'message' => 'Código de referido inválido'
            ], 400);
        }

        // Verificar token de Firebase (Phone Authentication)
        try {
            $firebaseUser = $this->firebase->verifyIdToken($request->firebase_id_token);
            
            // Verificar que el número de teléfono coincide
            if ($firebaseUser['phone_number'] !== $request->phone_number) {
                return response()->json([
                    'error' => '¿2FA Correcto? NO',
                    'message' => 'El número de teléfono no coincide con el verificado',
                    'requires_verification' => true
                ], 400);
            }

        } catch (FailedToVerifyToken $e) {
            return response()->json([
                'error' => '¿2FA Correcto? NO',
                'message' => 'Token de verificación inválido o expirado',
                'requires_verification' => true
            ], 401);
        } catch (\Exception $e) {
            \Log::error('Firebase verification error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Error en verificación',
                'message' => 'Error al verificar la autenticación'
            ], 500);
        }

        // Verificar si el número ya está registrado
        if (User::where('phone_number', $request->phone_number)->exists()) {
            return response()->json([
                'error' => 'Teléfono ya registrado',
                'message' => 'Este número de teléfono ya está en uso'
            ], 409);
        }

        // Crear Usuario en Base de Datos
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'wallet' => $request->wallet,
            'phone_number' => $request->phone_number,
            'firebase_uid' => $firebaseUser['uid'],
            'referral_code' => $this->generateUniqueReferralCode(),
            'sponsor_id' => $sponsor->id,
            'wallet_editable' => false,
            'value_cortyycado' => true,
            'requires_invitation' => true,
            'phone_verified' => true // Verificado por Firebase
        ]);

        // Vincular a Red Unilevel del Patrocinador
        // Ya vinculado con sponsor_id

        // Generar token de acceso
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Fin: Acceso al Dashboard',
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
            'sponsor' => [
                'name' => $sponsor->name,
                'email' => $sponsor->email
            ]
        ], 201);
    }

    /**
     * Generar código de referido único
     */
    private function generateUniqueReferralCode(): string
    {
        do {
            $code = strtoupper(Str::random(8));
        } while (User::where('referral_code', $code)->exists());

        return $code;
    }

    /**
     * Obtener código de referido del usuario
     */
    public function getReferralCode(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'referral_code' => $user->referral_code,
            'referral_link' => url('/register?ref=' . $user->referral_code),
            'total_referrals' => User::where('sponsor_id', $user->id)->count()
        ]);
    }

    /**
     * Ver red unilevel del usuario
     */
    public function getNetwork(Request $request)
    {
        $user = $request->user();

        // Obtener hasta 10 niveles de profundidad
        $network = $this->buildNetworkTree($user->id, 1, 10);

        return response()->json([
            'user' => $user,
            'network' => $network,
            'statistics' => [
                'direct_referrals' => User::where('sponsor_id', $user->id)->count(),
                'total_network' => $this->countTotalNetwork($user->id)
            ]
        ]);
    }

    /**
     * Construir árbol de red recursivamente
     */
    private function buildNetworkTree($userId, $currentLevel, $maxLevel)
    {
        if ($currentLevel > $maxLevel) {
            return [];
        }

        $users = User::where('sponsor_id', $userId)
            ->select('id', 'name', 'email', 'created_at')
            ->get();

        return $users->map(function ($user) use ($currentLevel, $maxLevel) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'level' => $currentLevel,
                'joined_at' => $user->created_at,
                'children' => $this->buildNetworkTree($user->id, $currentLevel + 1, $maxLevel)
            ];
        });
    }

    /**
     * Contar total de usuarios en la red
     */
    private function countTotalNetwork($userId, $count = 0)
    {
        $directReferrals = User::where('sponsor_id', $userId)->get();
        $count += $directReferrals->count();

        foreach ($directReferrals as $referral) {
            $count = $this->countTotalNetwork($referral->id, $count);
        }

        return $count;
    }
}
