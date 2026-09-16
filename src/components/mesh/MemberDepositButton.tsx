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
      // The credit (£50 per referral, capped at £250) is computed and recorded
      // server-side so it cannot be tampered with from the client.
      const { data, error } = await supabase.rpc('claim_referral_reward');
      if (error) throw error;
      const credit = Number(data ?? 0);


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
