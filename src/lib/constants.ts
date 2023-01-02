import vestingABI from '../abis/vesting.abi.json';

export const VESTING_ADDRESS =
  import.meta.env.MODE === 'production'
    ? '0xeE3593817fB142BFBEA560fcF47b3f354f519D33'
    : '0x483C9102a938D3d1f0bc4dc73bea831A2048D55b';

export const vestingContract = {
  address: VESTING_ADDRESS,
  abi: vestingABI,
};
