<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Withdrawal;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AdminWithdrawalController extends Controller
{
    /**
     * Obtener todos los retiros pendientes
     */
    public function getPendingWithdrawals(Request $request)
    {
        $withdrawals = Withdrawal::with('user')
            ->where('status', 'pending')
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($withdrawal) {
                return [
                    'id' => $withdrawal->id,
                    'user_id' => $withdrawal->user_id,
                    'user_name' => $withdrawal->user->name,
                    'user_email' => $withdrawal->user->email,
                    'amount' => $withdrawal->amount,
                    'fee' => $withdrawal->fee,
                    'net_amount' => $withdrawal->net_amount,
                    'withdrawal_method' => $withdrawal->withdrawal_method,
                    'wallet_address' => $withdrawal->wallet_address,
                    'plan_type' => $withdrawal->plan_type,
                    'status' => $withdrawal->status,
                    'created_at' => $withdrawal->created_at->toIso8601String(),
                ];
            });

        return response()->json($withdrawals);
    }

    /**
     * Obtener todos los retiros con filtros
     */
    public function getAllWithdrawals(Request $request)
    {
        $query = Withdrawal::with('user');

        // Filtro por estado
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filtro por fecha
        if ($request->has('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }

        if ($request->has('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        $withdrawals = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 50));

        return response()->json($withdrawals);
    }

    /**
     * Aprobar retiro
     */
    public function approveWithdrawal(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'admin_notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $withdrawal = Withdrawal::with('user')->findOrFail($id);

            if ($withdrawal->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Solo se pueden aprobar retiros pendientes'
                ], 400);
            }

            // Actualizar estado a approved
            $withdrawal->status = 'approved';
            $withdrawal->approved_at = now();
            $withdrawal->admin_notes = $request->admin_notes;
            $withdrawal->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Retiro aprobado exitosamente',
                'withdrawal' => $withdrawal
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al aprobar retiro: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Rechazar retiro
     */
    public function rejectWithdrawal(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'reason' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $withdrawal = Withdrawal::with('user')->findOrFail($id);

            if ($withdrawal->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Solo se pueden rechazar retiros pendientes'
                ], 400);
            }

            $user = $withdrawal->user;

            // Desbloquear balance
            $user->blocked_balance = max(0, ($user->blocked_balance ?? 0) - $withdrawal->amount);
            $user->save();

            // Actualizar estado a rejected
            $withdrawal->status = 'rejected';
            $withdrawal->rejected_at = now();
            $withdrawal->admin_notes = $request->reason;
            $withdrawal->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Retiro rechazado exitosamente',
                'withdrawal' => $withdrawal
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al rechazar retiro: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Marcar retiro como procesando (con transaction hash)
     */
    public function processWithdrawal(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'transaction_hash' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $withdrawal = Withdrawal::findOrFail($id);

            if ($withdrawal->status !== 'approved') {
                return response()->json([
                    'success' => false,
                    'message' => 'Solo se pueden procesar retiros aprobados'
                ], 400);
            }

            // Actualizar estado a processing
            $withdrawal->status = 'processing';
            $withdrawal->processed_at = now();
            $withdrawal->transaction_hash = $request->transaction_hash;
            $withdrawal->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Retiro marcado como procesando',
                'withdrawal' => $withdrawal
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al procesar retiro: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Completar retiro
     */
    public function completeWithdrawal(Request $request, $id)
    {
        try {
            DB::beginTransaction();

            $withdrawal = Withdrawal::with('user')->findOrFail($id);

            if (!in_array($withdrawal->status, ['approved', 'processing'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Solo se pueden completar retiros aprobados o en proceso'
                ], 400);
            }

            $user = $withdrawal->user;

            // Descontar del balance bloqueado
            $user->blocked_balance = max(0, ($user->blocked_balance ?? 0) - $withdrawal->amount);
            
            // Descontar del balance de ganancias o referidos
            $remainingAmount = $withdrawal->amount;
            
            if ($user->earnings_balance >= $remainingAmount) {
                $user->earnings_balance -= $remainingAmount;
            } else {
                $fromEarnings = $user->earnings_balance;
                $user->earnings_balance = 0;
                $user->referral_balance -= ($remainingAmount - $fromEarnings);
            }

            // Incrementar total retirado
            $user->total_withdrawn = ($user->total_withdrawn ?? 0) + $withdrawal->net_amount;
            $user->save();

            // Actualizar estado a completed
            $withdrawal->status = 'completed';
            $withdrawal->completed_at = now();
            $withdrawal->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Retiro completado exitosamente',
                'withdrawal' => $withdrawal
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error al completar retiro: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de retiros
     */
    public function getWithdrawalStats(Request $request)
    {
        $stats = [
            'pending_count' => Withdrawal::where('status', 'pending')->count(),
            'pending_amount' => Withdrawal::where('status', 'pending')->sum('amount'),
            'approved_count' => Withdrawal::where('status', 'approved')->count(),
            'processing_count' => Withdrawal::where('status', 'processing')->count(),
            'completed_count' => Withdrawal::where('status', 'completed')->count(),
            'completed_amount' => Withdrawal::where('status', 'completed')->sum('net_amount'),
            'rejected_count' => Withdrawal::where('status', 'rejected')->count(),
            'total_fees_collected' => Withdrawal::where('status', 'completed')->sum('fee'),
        ];

        return response()->json($stats);
    }
}
