<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;

class TwoFactorController extends Controller
{
    public function send2FACode(Request $request)
    {
        $user = $request->user();
        
        // Generate 6-digit code
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        
        // Store code in cache for 10 minutes
        Cache::put("2fa_code_{$user->id}", $code, 600);
        
        // Send email
        Mail::send('emails.2fa-code', ['code' => $code, 'user' => $user], function ($message) use ($user) {
            $message->to($user->email);
            $message->subject('Código de Verificación - EagleInvest');
        });
        
        return response()->json([
            'success' => true,
            'message' => 'Código enviado a tu correo'
        ]);
    }
    
    public function verify2FACode(Request $request)
    {
        $request->validate([
            'temp_token' => 'required|string',
            'code' => 'required|string|size:6'
        ]);
        
        // Retrieve user ID from temp token
        $userId = Cache::get("temp_token_{$request->temp_token}");
        
        if (!$userId) {
            return response()->json([
                'success' => false,
                'error' => 'Token inválido o expirado'
            ], 401);
        }
        
        $user = User::find($userId);
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'error' => 'Usuario no encontrado'
            ], 404);
        }
        
        // Verify code
        $storedCode = Cache::get("2fa_code_{$userId}");
        
        if (!$storedCode || $storedCode !== $request->code) {
            return response()->json([
                'success' => false,
                'error' => 'Código inválido'
            ], 401);
        }
        
        // Code is valid, clear it
        Cache::forget("2fa_code_{$userId}");
        Cache::forget("temp_token_{$request->temp_token}");
        
        // Create token
        $token = $user->createToken('auth_token')->plainTextToken;
        
        // Send login alert email
        Mail::send('emails.login-alert', ['user' => $user], function ($message) use ($user) {
            $message->to($user->email);
            $message->subject('Nuevo Inicio de Sesión - EagleInvest');
        });
        
        return response()->json([
            'success' => true,
            'message' => 'Verificación exitosa',
            'token' => $token,
            'user' => $user
        ]);
    }
    
    public function resend2FACode(Request $request)
    {
        $request->validate([
            'temp_token' => 'required|string'
        ]);
        
        $userId = Cache::get("temp_token_{$request->temp_token}");
        
        if (!$userId) {
            return response()->json([
                'success' => false,
                'error' => 'Token inválido o expirado'
            ], 401);
        }
        
        $user = User::find($userId);
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'error' => 'Usuario no encontrado'
            ], 404);
        }
        
        // Generate new code
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        
        // Update code in cache
        Cache::put("2fa_code_{$user->id}", $code, 600);
        
        // Send email
        Mail::send('emails.2fa-code', ['code' => $code, 'user' => $user], function ($message) use ($user) {
            $message->to($user->email);
            $message->subject('Código de Verificación - EagleInvest');
        });
        
        return response()->json([
            'success' => true,
            'message' => 'Código reenviado'
        ]);
    }
}
