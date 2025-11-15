import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';

export function useSuiWallet() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransactionBlock } = useSignAndExecuteTransaction();

  return {
    isConnected: !!currentAccount,
    address: currentAccount?.address,
    account: currentAccount,
    signAndExecuteTransactionBlock,
  };
}