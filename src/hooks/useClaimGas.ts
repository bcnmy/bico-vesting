import { BigNumber } from 'ethers';
import React from 'react';
import { useAccount, useContractWrite, usePublicClient, useWalletClient } from 'wagmi';
import { vestingContract } from '../lib/constants';
import { Account } from 'viem';

export const useClaimGas = () => {
  const { data: signer } = useWalletClient();
  const { address } = useAccount();
  const account = address as unknown as Account;
  const client = usePublicClient();
  const contract = useContractWrite({
    ...vestingContract,
  });
  const [claimGasLimit, setClaimGasLimit] = React.useState<BigNumber>();

  React.useEffect(() => {
    async function getEstimate() {
      if (!contract || !signer) return;
      let gasLimit = BigInt(0);
      gasLimit = await client.estimateContractGas({
        ...vestingContract,
        functionName: 'claim',
        account
      })

      // const gasLimit = await contract.estimateGas.claim();
      // Add 25k extra gas to be well within the limit
      setClaimGasLimit(BigNumber.from(BigInt(25000) + gasLimit));
    }

    getEstimate();
  }, [contract, signer]);

  return claimGasLimit;
};
