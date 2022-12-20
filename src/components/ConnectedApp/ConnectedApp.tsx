import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { BigNumber } from 'ethers';
import {
  goerli,
  mainnet,
  useAccount,
  useContractReads,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useSwitchNetwork,
  useWaitForTransaction,
} from 'wagmi';
import vestingABI from '../../abis/vesting.abi.json';
import { formatBigNumber } from '../../utils/formatBigNumber';
import { Claim, formatClaim } from '../../utils/formatClaim';
import { TokensInfo } from '../TokensInfo';
import styles from './ConnectedApp.module.css';
dayjs.extend(relativeTime);

const VESTING_ADDRESS = '0x483C9102a938D3d1f0bc4dc73bea831A2048D55b';

const vestingContract = {
  address: VESTING_ADDRESS,
  abi: vestingABI,
};

const ConnectedApp = () => {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { isLoading: switchNetworkLoading, switchNetwork } = useSwitchNetwork();
  // TODO: Use mainnet for prod and goerli for dev.
  const supportedChainIds = [goerli.id, mainnet.id];

  const {
    data: vestingData,
    isError,
    isLoading,
    refetch,
  } = useContractReads({
    contracts: [
      {
        ...vestingContract,
        functionName: 'getClaim',
        args: [address],
        chainId: 5,
      },
      {
        ...vestingContract,
        functionName: 'claimableAmount',
        args: [address],
        chainId: 5,
      },
      {
        ...vestingContract,
        functionName: 'paused',
        chainId: 5,
      },
    ],
  });
  const data = vestingData as [Claim, BigNumber, boolean];
  const [claim, claimableAmount, paused] = data;

  // Loading state
  if (isLoading) {
    return (
      <section className={styles.slice}>
        <p>Loading...</p>;
      </section>
    );
  }

  // Error state
  if (isError) {
    return (
      <section className={styles.slice}>
        <p>We were unable to fetch the claims data. Please try again later.</p>;
      </section>
    );
  }

  const { config } = usePrepareContractWrite({
    address: VESTING_ADDRESS,
    abi: vestingABI,
    functionName: 'claim',
  });
  const { data: claimTokensData, write } = useContractWrite(config);
  const {
    isError: claimTokensTxError,
    isLoading: claimTokensTxLoading,
    isSuccess: claimTokensTxSuccess,
  } = useWaitForTransaction({
    hash: claimTokensData?.hash,
    onSuccess: () => {
      refetch();
    },
  });

  // Desctructure claim data
  const {
    vestAmount,
    unlockAmount,
    endTime,
    amountClaimed: tokensClaimed,
  } = formatClaim(claim);

  // Current and matury dates
  const currentDate = Math.round(Date.now() / 1000);
  const maturityDate = new Date(Number.parseFloat(endTime.toString()) * 1000);

  // Claimable and total claimable tokens
  const claimableTokens = formatBigNumber(claimableAmount) + tokensClaimed;
  const totalClaimableTokens = vestAmount + unlockAmount;

  // Generated tokens, claimed tokens and availability
  const streamedTokens = (claimableTokens / totalClaimableTokens) * 100;
  const claimedTokens = (tokensClaimed / claimableTokens) * 100;
  const availability = (claimableTokens - tokensClaimed).toLocaleString();

  // Maturity status
  let maturityStatus = `${dayjs(maturityDate).fromNow(true)} till maturity`;
  if (
    currentDate > Number.parseFloat(claim.endTime.toString()) ||
    !claim.endTime
  ) {
    maturityStatus = 'Complete';
  } else if (paused) {
    maturityStatus = 'Paused';
  } else if (totalClaimableTokens !== tokensClaimed && !claim.isActive) {
    maturityStatus = 'Revoked';
  }

  // Is claim exhausted?
  const areClaimsDisabled =
    paused ||
    tokensClaimed >= totalClaimableTokens ||
    tokensClaimed >= claimableTokens ||
    !claim.isActive;

  return (
    <section className={styles.slice}>
      <header className={styles.sectionHeader}>
        <h1>Claim Tokens</h1>
        {chain && supportedChainIds.includes(chain.id) ? (
          <button
            className={styles.claimTokensBtn}
            disabled={areClaimsDisabled || !write}
            onClick={() => write?.()}
          >
            {claimTokensTxLoading
              ? 'Claiming...'
              : claimTokensTxSuccess
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

      <TokensInfo
        tokensClaimed={tokensClaimed}
        availability={availability}
        claimedTokens={claimedTokens}
        maturityStatus={maturityStatus}
        streamedTokens={streamedTokens}
        claimableTokens={claimableTokens}
        totalClaimableTokens={totalClaimableTokens}
      />
    </section>
  );
};

export { ConnectedApp };
