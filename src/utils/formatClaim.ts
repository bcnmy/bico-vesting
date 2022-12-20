import { BigNumber } from 'ethers';
import { formatBigNumber } from './formatBigNumber';

export type Claim = {
  isActive: boolean;
  vestAmount: BigNumber;
  unlockAmount: BigNumber;
  unlockTime: BigNumber;
  startTime: BigNumber;
  endTime: BigNumber;
  amountClaimed: BigNumber;
};

const formatClaim = (claim: Claim) => {
  return {
    ...claim,
    vestAmount: formatBigNumber(claim.vestAmount),
    unlockAmount: formatBigNumber(claim.unlockAmount),
    unlockTime: formatBigNumber(claim.unlockTime),
    amountClaimed: formatBigNumber(claim.amountClaimed),
  };
};

export { formatClaim };
