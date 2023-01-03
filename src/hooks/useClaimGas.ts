import { BigNumber } from 'ethers';
import React from 'react';
import { useContract, useSigner } from 'wagmi';
import { vestingContract } from '../lib/constants';

export const useClaimGas = () => {
  const { data: signer } = useSigner();
  const contract = useContract({
    ...vestingContract,
    signerOrProvider: signer,
  });
  const [claimGasLimit, setClaimGasLimit] = React.useState<BigNumber>();

  React.useEffect(() => {
    async function getEstimate() {
      if (!contract || !signer) return;
      const gasLimit = await contract.estimateGas.claim();
      // Add 25k extra gas to be well within the limit
      setClaimGasLimit(gasLimit.add(BigNumber.from(25000)));
    }

    getEstimate();
  }, [contract, signer]);

  return claimGasLimit;
};
