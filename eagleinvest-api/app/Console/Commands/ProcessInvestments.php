<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\UserInvestment;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ProcessInvestments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'investments:process-minute';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process investment earnings every minute (Simulation Mode)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting investment processing (Minute Simulation)...');

        $investments = UserInvestment::with('investmentPlan')->where('status', 'active')->get();

        foreach ($investments as $investment) {
            try {
                DB::transaction(function () use ($investment) {
                    $lastRun = $investment->last_earning_date ?? $investment->created_at;
                    
                    // Check if at least 1 minute has passed
                    // In simulation mode, we treat minutes as days
                    if (Carbon::parse($lastRun)->diffInMinutes(now()) >= 1) {
                        
                        // Calculate earning (Daily return applied per minute for simulation)
                        // daily_return in UserInvestment is the fixed amount to pay
                        $earningAmount = $investment->daily_return;
                        
                        // Create Transaction
                        Transaction::create([
                            'user_id' => $investment->user_id,
                            'investment_id' => $investment->id, // Using the column from fillable
                            'amount' => $earningAmount,
                            'type' => 'earnings',
                            'status' => 'completed',
                            'description' => 'Rendimiento minuto (Simulación) - Plan #' . $investment->id,
                            'reference_id' => 'EARN-' . $investment->id . '-' . time(),
                            'metadata' => ['investment_id' => $investment->id],
                            'processed_at' => now()
                        ]);

                        // Update User Balance
                        $user = User::find($investment->user_id);
                        $user->earnings_balance += $earningAmount;
                        $user->total_earnings += $earningAmount;
                        $user->save();

                        // Update Investment
                        $investment->total_earned += $earningAmount;
                        $investment->last_earning_date = now();
                        $investment->days_completed += 1; // Increment "days" (minutes in sim)
                        
                        // Check if investment is completed
                        if ($investment->investmentPlan && $investment->days_completed >= $investment->investmentPlan->duration_days) {
                            $investment->status = 'completed';
                            $this->info("Investment #{$investment->id} completed (Duration reached).");
                        }

                        $investment->save();

                        $this->info("Processed investment #{$investment->id}: Earned {$earningAmount}");
                    }
                });
            } catch (\Exception $e) {
                $this->error("Error processing investment #{$investment->id}: " . $e->getMessage());
            }
        }

        $this->info('Investment processing completed.');
    }
}
