import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { BigNumber, ethers } from 'ethers';
import {
  goerli,
  mainnet,
  useAccount,
  useContractRead,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useSwitchNetwork,
  useWaitForTransaction,
} from 'wagmi';
import bicoVestingABI from '../../abis/bico-vesting.abi.json';
import { ProgressBar } from '../ProgressBar';
dayjs.extend(relativeTime);
import styles from './ConnectedApp.module.css';

const BICO_VESTING_ADDRESS = '0x483C9102a938D3d1f0bc4dc73bea831A2048D55b';

type ClaimData = {
  isActive: boolean;
  vestAmount: BigNumber;
  unlockAmount: BigNumber;
  unlockTime: BigNumber;
  startTime: BigNumber;
  endTime: BigNumber;
  amountClaimed: BigNumber;
};

const ConnectedApp = () => {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { isLoading: switchNetworkLoading, switchNetwork } = useSwitchNetwork();
  // TODO: Use mainnet for prod and goerli for dev.
  const supportedChainIds = [goerli.id, mainnet.id];

  const { config } = usePrepareContractWrite({
    address: BICO_VESTING_ADDRESS,
    abi: bicoVestingABI,
    functionName: 'claim',
  });
  const {
    data: claimBicoData,
    isLoading: claimBicoLoading,
    isSuccess: claimBicoSuccess,
    write,
  } = useContractWrite(config);

  const {
    data: claimBicoTransaction,
    isError: claimBicoTransactionError,
    isLoading: claimBicoTransactionLoading,
    isSuccess: claimBicoTransactionSuccess,
  } = useWaitForTransaction({
    hash: claimBicoData?.hash,
    onSuccess: () => {
      refetchClaimData();
      refetchClaimableAmountData();
      refetchClaimPausedData();
    },
  });

  const {
    data: claimData,
    isError: claimDataError,
    isLoading: claimDataLoading,
    refetch: refetchClaimData,
  } = useContractRead({
    address: BICO_VESTING_ADDRESS,
    abi: bicoVestingABI,
    functionName: 'getClaim',
    args: [address],
    chainId: 5,
  });
  const claim = claimData as ClaimData;

  const {
    data: claimableAmountData,
    isError: claimableAmountDataError,
    isLoading: claimableAmountDataLoading,
    refetch: refetchClaimableAmountData,
  } = useContractRead({
    address: BICO_VESTING_ADDRESS,
    abi: bicoVestingABI,
    functionName: 'claimableAmount',
    args: [address],
    chainId: 5,
  });
  const claimableAmount = claimableAmountData as BigNumber;

  const {
    data: claimPausedData,
    isError: claimPausedDataError,
    isLoading: claimPausedDataLoading,
    refetch: refetchClaimPausedData,
  } = useContractRead({
    address: BICO_VESTING_ADDRESS,
    abi: bicoVestingABI,
    functionName: 'paused',
    chainId: 5,
  });

  if (
    claimDataLoading ||
    claimableAmountDataLoading ||
    claimPausedDataLoading
  ) {
    return (
      <section className={styles.slice}>
        <p>Loading...</p>;
      </section>
    );
  }

  const amountClaimed = Number.parseFloat(
    ethers.utils.formatEther(claim.amountClaimed)
  );
  const maturityDate = new Date(
    Number.parseFloat(claim.endTime.toString()) * 1000
  );
  const currentDate = Math.round(Date.now() / 1000);
  const totalClaimableAmount = Number.parseFloat(
    ethers.utils.formatEther(
      claimableAmount.add(claim.amountClaimed).toString()
    )
  );
  const totalAmount = Number.parseFloat(
    ethers.utils.formatEther(
      claim.vestAmount.add(claim.unlockAmount).toString()
    )
  );
  const claimPaused = claimPausedData as boolean;
  const streamedTokens = (totalClaimableAmount / totalAmount) * 100;
  const claimedTokens = (amountClaimed / totalClaimableAmount) * 100;
  const availability = (totalClaimableAmount - amountClaimed).toLocaleString();

  let maturityStatus = `${dayjs(maturityDate).fromNow(true)} till maturity`;
  if (
    currentDate > Number.parseFloat(claim.endTime.toString()) ||
    !claim.endTime
  ) {
    maturityStatus = 'Complete';
  } else if (claimPaused) {
    maturityStatus = 'Paused';
  } else if (totalAmount !== amountClaimed && !claim.isActive) {
    maturityStatus = 'Revoked';
  }

  const isClaimTokensDisabled =
    claimPaused || totalAmount === amountClaimed || !claim.isActive;

  console.log({ totalAmount, amountClaimed, totalClaimableAmount });

  return (
    <section className={styles.slice}>
      <header className={styles.sectionHeader}>
        <h1>Claim Tokens</h1>
        {chain && supportedChainIds.includes(chain.id) ? (
          <button
            disabled={isClaimTokensDisabled || !write}
            onClick={() => write?.()}
          >
            {claimBicoTransactionLoading
              ? 'Claiming...'
              : claimBicoTransactionSuccess
              ? 'Claimed'
              : 'Claim Bico'}
          </button>
        ) : (
          <button
            disabled={!switchNetwork}
            onClick={() => switchNetwork?.(mainnet.id)}
          >
            {switchNetworkLoading ? 'Switching...' : 'Switch to Ethereum'}
          </button>
        )}
      </header>
      <article className={styles.article}>
        <h2>Streamed</h2>
        <ProgressBar value={streamedTokens} aria-label="Streamed tokens" />
        <p>
          {totalClaimableAmount.toLocaleString()} /{' '}
          {totalAmount.toLocaleString()} total tokens
        </p>
      </article>

      <article className={styles.article}>
        <h2>Claimed</h2>
        <ProgressBar value={claimedTokens} aria-label="Claimed tokens" />
        <p>
          {amountClaimed.toLocaleString()} /{' '}
          {totalClaimableAmount.toLocaleString()} tokens claimed
        </p>
      </article>

      <article className={styles.article}>
        <h2>Time left</h2>
        <p>{maturityStatus}</p>
      </article>

      <article className={styles.article}>
        <h2>Availability</h2>
        <p>{availability} tokens available to claim</p>
      </article>
    </section>
  );
};

export { ConnectedApp };
