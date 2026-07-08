// src/components/mesh/MemberDepositButton.tsx
import { useState } from 'react';
import { MeshService } from '@/services/meshService';
import { Button } from '@/components/ui/button';
import { Wallet } from 'lucide-react';

interface MemberDepositButtonProps {
  userId: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function MemberDepositButton({ userId, onSuccess, onError }: MemberDepositButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDeposit = async () => {
    setIsLoading(true);
    try {
      const meshService = MeshService.getInstance();
      await meshService.openMemberDeposit(userId);
      onSuccess?.();
    } catch (error) {
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleDeposit}
      disabled={isLoading}
      className="gap-2"
    >
      <Wallet className="h-4 w-4" />
      {isLoading ? 'Connecting...' : 'Deposit Rewards'}
    </Button>
  );
}
