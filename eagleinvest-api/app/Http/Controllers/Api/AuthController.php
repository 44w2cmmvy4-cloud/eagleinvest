<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Controlador de Autenticación con 2FA
 *
 * @package App\Http\Controllers\Api
 * @description Gestiona las operaciones de autenticación del sistema incluyendo:
 * - Login con autenticación de dos factores (2FA)
 * - Generación y envío de códigos de verificación
 * - Validación de credenciales
 * - Gestión de tokens temporales
 * 
 * @version 1.0.0
 * @since 2025-01-01
 */
class AuthController extends Controller
{
    /**
     * Maneja el inicio de sesión del usuario con autenticación 2FA
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     * 
     * @description Este método implementa un flujo de autenticación de dos factores:
     * 1. Valida las credenciales del usuario (email y contraseña)
     * 2. Genera un código aleatorio de 6 dígitos
     * 3. Almacena el código en caché por 10 minutos
     * 4. Genera un token temporal para completar la verificación
     * 5. Envía el código por email al usuario
     * 
     * @apiParam {string} email Email del usuario (requerido)
     * @apiParam {string} password Contraseña del usuario (requerido)
     * 
     * @apiSuccess {boolean} success Indica si la operación fue exitosa
     * @apiSuccess {boolean} requires_2fa Siempre true, indica que requiere verificación 2FA
     * @apiSuccess {string} temp_token Token temporal para completar la verificación
     * @apiSuccess {string} message Mensaje descriptivo de la respuesta
     * 
     * @apiError (401) {boolean} success false
     * @apiError (401) {string} message "Credenciales inválidas. Verifica tu email y contraseña."
     * 
     * @example
     * // Request:
     * POST /api/auth/login
     * {
     *   "email": "usuario@ejemplo.com",
     *   "password": "password123"
     * }
     * 
     * // Response exitoso:
     * {
     *   "success": true,
     *   "requires_2fa": true,
     *   "temp_token": "abc123...xyz789",
     *   "message": "Código de verificación enviado a tu correo"
     * }
     * 
     * @throws \Illuminate\Validation\ValidationException Si la validación falla
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Credenciales inválidas. Verifica tu email y contraseña.'
            ], 401);
        }

        // Generate 2FA code
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        
        // Store code in cache for 10 minutes
        Cache::put("2fa_code_{$user->id}", $code, 600);
        
        // Generate temporary token
        $tempToken = Str::random(60);
        Cache::put("temp_token_{$tempToken}", $user->id, 600);
        
        // Send 2FA code via email
        try {
            Mail::send('emails.2fa-code', ['code' => $code, 'user' => $user], function ($message) use ($user) {
                $message->to($user->email);
                $message->subject('Código de Verificación - EagleInvest');
            });
        } catch (\Exception $e) {
            \Log::error('Failed to send 2FA email: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'requires_2fa' => true,
            'temp_token' => $tempToken,
            'message' => 'Código de verificación enviado a tu correo'
        ]);
    }
}
