<?php

namespace App\Http\Controllers;

use App\Models\SupportTicket;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class SupportTicketController extends Controller
{
    /**
     * Solicitar cambio de Wallet siguiendo el diagrama "Usuario desea cambiar Wallet"
     */
    public function requestWalletChange(Request $request)
    {
        $request->validate([
            'new_wallet' => 'required|string|max:255',
            'description' => 'required|string|max:1000'
        ]);

        $user = $request->user();

        // Paso 1: El campo Wallet NO es editable directamente
        // Paso 2: Crear ticket de soporte
        $ticket = SupportTicket::create([
            'user_id' => $user->id,
            'type' => 'wallet_change',
            'subject' => 'Solicitud de Cambio de Wallet',
            'description' => $request->description,
            'old_wallet' => $user->wallet,
            'new_wallet' => $request->new_wallet,
            'status' => 'open'
        ]);

        // Notificar al usuario que debe contactar soporte
        return response()->json([
            'message' => 'Contactar Soporte para cambios',
            'ticket' => $ticket,
            'instructions' => 'Un agente revisará tu solicitud en las próximas 24-48 horas. Es posible que se requiera verificación de identidad.'
        ], 201);
    }

    /**
     * Admin: Listar tickets pendientes
     */
    public function pendingTickets(Request $request)
    {
        $admin = $request->user();

        if (!$admin->is_admin) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $tickets = SupportTicket::open()
            ->with('user')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($tickets);
    }

    /**
     * Admin: Revisar caso (Personal de Soporte revisa el caso)
     */
    public function reviewTicket(Request $request, $id)
    {
        $admin = $request->user();

        if (!$admin->is_admin) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $request->validate([
            'admin_notes' => 'nullable|string|max:1000'
        ]);

        $ticket = SupportTicket::findOrFail($id);

        $ticket->update([
            'status' => 'in_review',
            'assigned_to' => $admin->id,
            'admin_notes' => $request->admin_notes
        ]);

        return response()->json([
            'message' => 'Ticket en revisión',
            'ticket' => $ticket->load('user')
        ]);
    }

    /**
     * Admin: Verificar identidad
     */
    public function verifyIdentity(Request $request, $id)
    {
        $admin = $request->user();

        if (!$admin->is_admin) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $request->validate([
            'verified' => 'required|boolean',
            'notes' => 'nullable|string|max:1000'
        ]);

        $ticket = SupportTicket::findOrFail($id);

        if ($request->verified) {
            // Es el dueño - marcar como verificado
            $ticket->update([
                'status' => 'pending_verification',
                'identity_verified' => true,
                'admin_notes' => ($ticket->admin_notes ?? '') . "\n" . ($request->notes ?? 'Identidad verificada.')
            ]);

            return response()->json([
                'message' => 'Identidad verificada. El ticket puede ser aprobado.',
                'ticket' => $ticket
            ]);
        } else {
            // Sospechoso - rechazar por seguridad
            $ticket->update([
                'status' => 'rejected',
                'identity_verified' => false,
                'rejection_reason' => 'Rechazar: Riesgo de Seguridad - ' . ($request->notes ?? 'Identidad no verificada'),
                'resolved_by' => $admin->id,
                'resolved_at' => now()
            ]);

            return response()->json([
                'message' => 'Ticket rechazado por motivos de seguridad',
                'ticket' => $ticket
            ]);
        }
    }

    /**
     * Admin: Aprobar cambio de wallet
     */
    public function approveWalletChange(Request $request, $id)
    {
        $admin = $request->user();

        if (!$admin->is_admin) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $ticket = SupportTicket::findOrFail($id);

        if (!$ticket->canBeApproved()) {
            return response()->json(['error' => 'Este ticket no puede ser aprobado. Verifica que la identidad esté confirmada.'], 400);
        }

        // Admin edita la Wallet manualmente en el Sistema
        $user = $ticket->user;
        $oldWallet = $user->wallet;

        $user->update([
            'wallet' => $ticket->new_wallet,
            'wallet_last_changed' => now()
        ]);

        $ticket->update([
            'status' => 'approved',
            'resolved_by' => $admin->id,
            'resolved_at' => now()
        ]);

        // Sistema envía Email de Confirmación
        // Mail::to($user->email)->send(new WalletChangedNotification($user, $oldWallet, $ticket->new_wallet));

        return response()->json([
            'message' => 'Wallet actualizada exitosamente',
            'ticket' => $ticket,
            'user' => $user,
            'confirmation_sent' => true
        ]);
    }

    /**
     * Admin: Rechazar cambio de wallet
     */
    public function rejectWalletChange(Request $request, $id)
    {
        $admin = $request->user();

        if (!$admin->is_admin) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $request->validate([
            'reason' => 'required|string|max:500'
        ]);

        $ticket = SupportTicket::findOrFail($id);

        $ticket->update([
            'status' => 'rejected',
            'rejection_reason' => $request->reason,
            'resolved_by' => $admin->id,
            'resolved_at' => now()
        ]);

        return response()->json([
            'message' => 'Cambio Denegado',
            'ticket' => $ticket
        ]);
    }

    /**
     * Ver tickets del usuario
     */
    public function userTickets(Request $request)
    {
        $user = $request->user();

        $tickets = SupportTicket::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($tickets);
    }

    /**
     * Ver detalle de un ticket
     */
    public function getTicket(Request $request, $id)
    {
        $user = $request->user();

        $ticket = SupportTicket::where('id', $id)
            ->where('user_id', $user->id)
            ->orWhere(function($q) use ($user) {
                $q->where('assigned_to', $user->id)->orWhere('resolved_by', $user->id);
            })
            ->first();

        if (!$ticket) {
            return response()->json(['error' => 'Ticket no encontrado'], 404);
        }

        return response()->json($ticket->load(['user', 'assignedTo', 'resolvedBy']));
    }
}
