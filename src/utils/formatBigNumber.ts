import { BigNumber, ethers } from 'ethers';

const formatBigNumber = (bigNumber: BigNumber) => {
  return Number.parseFloat(ethers.utils.formatEther(bigNumber));
};

export { formatBigNumber };
