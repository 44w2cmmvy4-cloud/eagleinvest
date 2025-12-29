<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{
    /**
     * Registrar un nuevo usuario
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'password_confirmation' => 'required|string|same:password',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
            ]);

            $token = $user->createToken('api-token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Usuario registrado exitosamente',
                'user' => $user,
                'token' => $token,
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error al registrar usuario: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Login de usuario
     */
    public function login(Request $request)
    {
        // Normalize email to lowercase
        $request->merge(['email' => strtolower($request->email)]);

        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email|exists:users,email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            Log::error('Login validation failed', ['errors' => $validator->errors()->toArray(), 'data' => $request->all()]);
            return response()->json([
                'success' => false,
                'message' => 'Revisa los datos ingresados',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            Log::channel('login')->warning('Login failed: email not found', [
                'email' => $request->email,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'timestamp' => now()->toDateTimeString(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'El email no existe',
            ], 404);
        }

        if (!Hash::check($request->password, $user->password)) {
            Log::channel('login')->warning('Login failed: wrong password', [
                'user_id' => $user->id,
                'email' => $user->email,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'timestamp' => now()->toDateTimeString(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Contraseña incorrecta',
            ], 401);
        }

        Log::info('Login attempt', ['email' => $user->email, '2fa_enabled' => $user->two_factor_enabled]);

        // Si el usuario no tiene 2FA habilitado, emitir token directo
        if (!$user->two_factor_enabled) {
            $user->tokens()->delete();
            $token = $user->createToken('api-token')->plainTextToken;

            return response()->json([
                'success' => true,
                'requires_2fa' => false,
                'message' => 'Login exitoso',
                'user' => $user,
                'token' => $token,
            ], 200);
        }

        // Flujo 2FA por email
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Guardar código y token temporal 10 minutos
        Cache::put("2fa_code_{$user->id}", $code, 600);
        $tempToken = Str::random(60);
        Cache::put("temp_token_{$tempToken}", $user->id, 600);

        // Log code for debugging
        Log::info("2FA Code for user {$user->email}: {$code}");

        try {
            Mail::send('emails.2fa-code', ['code' => $code, 'user' => $user], function ($message) use ($user) {
                $message->to($user->email);
                $message->subject('Código de Verificación - EagleInvest');
            });
        } catch (\Exception $e) {
            Log::error('No se pudo enviar el email 2FA: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'requires_2fa' => true,
            'temp_token' => $tempToken,
            'message' => 'Código de verificación enviado a tu correo'
        ], 200);
    }

    /**
     * Obtener usuario autenticado
     */
    public function me(Request $request)
    {
        return response()->json($request->user(), 200);
    }

    /**
     * Logout de usuario
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logout exitoso'], 200);
    }

    /**
     * Verificar si el token es válido
     */
    public function verify(Request $request)
    {
        return response()->json([
            'valid' => true,
            'user' => $request->user(),
        ], 200);
    }
}
