// src/components/mesh/MemberDepositButton.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface MemberDepositButtonProps {
  userId?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function MemberDepositButton({ userId, onSuccess, onError }: MemberDepositButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDeposit = async () => {
    if (!userId) {
      toast.error('Please sign in to claim your referral credit.');
      return;
    }
    setIsLoading(true);
    try {
      // Count referrals to compute the current credit (£50 per recruit, capped at £250)
      const { data: me } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('id', userId)
        .maybeSingle();

      let credit = 0;
      if (me?.referral_code) {
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('referred_by_code', me.referral_code);
        credit = Math.min((count ?? 0) * 50, 250);
      }

      const { error } = await supabase.from('reward_deposits').insert({
        user_id: userId,
        amount: credit,
        source: 'lions_referral',
        notes: `Impact Lions referral credit claim (£${credit})`,
      });
      if (error) throw error;

      toast.success(
        credit > 0
          ? `£${credit} referral credit logged. It will be applied to your next renewal.`
          : 'Deposit request logged. Refer a member to start earning £50 credit.',
      );
      onSuccess?.();
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || 'Failed to deposit rewards. Please try again.');
      onError?.(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleDeposit}
      disabled={isLoading}
      size="sm"
      className="gap-2"
    >
      <Wallet className="h-4 w-4" />
      {isLoading ? 'Processing…' : 'Deposit Rewards'}
    </Button>
  );
}
