import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { BigNumber, ethers } from 'ethers';
import {
  goerli,
  mainnet,
  useAccount,
  useContractRead,
  useNetwork,
  useSwitchNetwork,
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

const ClaimBicoButton = () => {
  return <button className="claim-bico--btn">Claim Bico</button>;
};

const SwitchNetworkButton = () => {
  const { isLoading, switchNetwork } = useSwitchNetwork();

  return (
    <button
      disabled={!switchNetwork}
      className="claim-bico--btn"
      onClick={() => switchNetwork?.(mainnet.id)}
    >
      {isLoading ? 'Switching...' : 'Switch to Ethereum'}
    </button>
  );
};

const ConnectedApp = () => {
  const { address } = useAccount();
  const { chain } = useNetwork();
  // TODO: Use mainnet for prod and goerli for dev.
  const supportedChainIds = [goerli.id, mainnet.id];

  const {
    data: claimData,
    isError: claimDataError,
    isLoading: claimDataLoading,
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
  } = useContractRead({
    address: BICO_VESTING_ADDRESS,
    abi: bicoVestingABI,
    functionName: 'claimableAmount',
    args: [address],
    chainId: 5,
  });
  const claimableAmount = claimableAmountData as BigNumber;

  const {
    data: claimPaused,
    isError: claimPausedError,
    isLoading: claimPausedLoading,
  } = useContractRead({
    address: BICO_VESTING_ADDRESS,
    abi: bicoVestingABI,
    functionName: 'paused',
    chainId: 5,
  });

  if (claimDataLoading || claimableAmountDataLoading || claimPausedLoading) {
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

  return (
    <section className={styles.slice}>
      <header className={styles.sectionHeader}>
        <h1>Claim Tokens</h1>
        {chain && supportedChainIds.includes(chain.id) ? (
          <ClaimBicoButton />
        ) : (
          <SwitchNetworkButton />
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
          {claimedTokens.toLocaleString()} /{' '}
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
