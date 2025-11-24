<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

/**
 * Controlador de Gestión de Wallets de Criptomonedas
 *
 * @package App\Http\Controllers
 * @description Gestiona las operaciones relacionadas con wallets de criptomonedas:
 * - Consulta de información de wallet conectada
 * - Conexión de nuevas wallets (MetaMask, WalletConnect, etc.)
 * - Desconexión de wallets
 * - Notificaciones por email de cambios en wallets
 * 
 * Este controlador soporta múltiples proveedores de wallets incluyendo:
 * - MetaMask
 * - WalletConnect
 * - Coinbase Wallet
 * - Trust Wallet
 * 
 * @version 1.0.0
 * @since 2025-01-01
 */
class WalletController extends Controller
{
    /**
     * Obtiene la información de la wallet del usuario
     *
     * @param  int  $userId ID del usuario
     * @return \Illuminate\Http\JsonResponse
     * 
     * @description Recupera los datos de la wallet conectada del usuario incluyendo:
     * - Dirección de la wallet
     * - Red blockchain (Ethereum, BSC, Polygon, etc.)
     * - Balance actual
     * - Estado de conexión
     * 
     * @apiSuccess {string} address Dirección de la wallet (vacío si no hay wallet conectada)
     * @apiSuccess {string} network Red blockchain de la wallet
     * @apiSuccess {string} balance Balance de la wallet en formato decimal
     * @apiSuccess {boolean} connected Indica si hay una wallet actualmente conectada
     * 
     * @apiError (404) {string} error "Usuario no encontrado"
     * 
     * @example
     * // Request:
     * GET /api/wallet/{userId}
     * 
     * // Response exitoso:
     * {
     *   "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
     *   "network": "Ethereum Mainnet",
     *   "balance": "1.2345",
     *   "connected": true
     * }
     */
    public function getWalletInfo($userId)
    {
        $user = User::find($userId);
        
        if (!$user) {
            return response()->json([
                'error' => 'Usuario no encontrado'
            ], 404);
        }
        
        return response()->json([
            'address' => $user->wallet_address ?? '',
            'network' => $user->wallet_network ?? '',
            'balance' => $user->wallet_balance ?? '0.00',
            'connected' => !empty($user->wallet_address)
        ]);
    }
    
    /**
     * Conecta una wallet de criptomonedas al usuario
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     * 
     * @description Asocia una wallet de criptomonedas con la cuenta del usuario.
     * Guarda la dirección, red y proveedor de la wallet, y envía un email
     * de confirmación al usuario notificando la conexión.
     * 
     * @apiParam {int} user_id ID del usuario (requerido)
     * @apiParam {string} wallet_address Dirección de la wallet (requerido, ej: 0x742d35...)
     * @apiParam {string} network Red blockchain (requerido, ej: "Ethereum Mainnet")
     * @apiParam {string} provider Proveedor de wallet (requerido, ej: "MetaMask", "WalletConnect")
     * 
     * @apiSuccess {boolean} success Indica si la operación fue exitosa
     * @apiSuccess {string} message Mensaje de confirmación
     * 
     * @apiError (404) {string} error "Usuario no encontrado"
     * @apiError (422) {object} errors Errores de validación de campos
     * 
     * @example
     * // Request:
     * POST /api/wallet/connect
     * {
     *   "user_id": 1,
     *   "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
     *   "network": "Ethereum Mainnet",
     *   "provider": "MetaMask"
     * }
     * 
     * // Response exitoso:
     * {
     *   "success": true,
     *   "message": "Wallet conectada exitosamente"
     * }
     * 
     * @throws \Illuminate\Validation\ValidationException Si la validación falla
     */
    public function connectWallet(Request $request)
    {
        $request->validate([
            'user_id' => 'required|integer',
            'wallet_address' => 'required|string',
            'network' => 'required|string',
            'provider' => 'required|string'
        ]);
        
        $user = User::find($request->user_id);
        
        if (!$user) {
            return response()->json([
                'error' => 'Usuario no encontrado'
            ], 404);
        }
        
        // Update user wallet info
        $user->wallet_address = $request->wallet_address;
        $user->wallet_network = $request->network;
        $user->wallet_provider = $request->provider;
        $user->save();
        
        // Send wallet connection alert email
        Mail::send('emails.wallet-connected', [
            'user' => $user,
            'address' => $request->wallet_address,
            'network' => $request->network
        ], function ($message) use ($user) {
            $message->to($user->email);
            $message->subject('Wallet Conectada - EagleInvest');
        });
        
        return response()->json([
            'success' => true,
            'message' => 'Wallet conectada exitosamente'
        ]);
    }
    
    /**
     * Desconecta la wallet del usuario
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     * 
     * @description Elimina la asociación entre la wallet y la cuenta del usuario.
     * Limpia los campos de dirección, red y proveedor de la base de datos.
     * No envía notificación por email.
     * 
     * @apiParam {int} user_id ID del usuario (requerido)
     * 
     * @apiSuccess {boolean} success Indica si la operación fue exitosa
     * @apiSuccess {string} message Mensaje de confirmación
     * 
     * @apiError (404) {string} error "Usuario no encontrado"
     * @apiError (422) {object} errors Errores de validación de campos
     * 
     * @example
     * // Request:
     * POST /api/wallet/disconnect
     * {
     *   "user_id": 1
     * }
     * 
     * // Response exitoso:
     * {
     *   "success": true,
     *   "message": "Wallet desconectada"
     * }
     * 
     * @throws \Illuminate\Validation\ValidationException Si la validación falla
     */
    public function disconnectWallet(Request $request)
    {
        $request->validate([
            'user_id' => 'required|integer'
        ]);
        
        $user = User::find($request->user_id);
        
        if (!$user) {
            return response()->json([
                'error' => 'Usuario no encontrado'
            ], 404);
        }
        
        // Clear wallet info
        $user->wallet_address = null;
        $user->wallet_network = null;
        $user->wallet_provider = null;
        $user->save();
        
        return response()->json([
            'success' => true,
            'message' => 'Wallet desconectada'
        ]);
    }
}
