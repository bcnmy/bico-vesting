import { ProgressBar } from '../ProgressBar';
import styles from './TokensInfo.module.css';

type TokensInfoProps = {
  tokensClaimed: number;
  availability: string;
  claimedTokens: number;
  maturityStatus: string;
  streamedTokens: number;
  totalClaimableTokens: number;
  claimableTokens: number;
};

const TokensInfo = ({
  tokensClaimed,
  availability,
  claimedTokens,
  maturityStatus,
  streamedTokens,
  totalClaimableTokens,
  claimableTokens,
}: TokensInfoProps) => {
  return (
    <>
      <article className={styles.article}>
        <h2>Streamed</h2>
        <ProgressBar value={streamedTokens} aria-label="Streamed tokens" />
        <p>
          {claimableTokens.toLocaleString()} /{' '}
          {totalClaimableTokens.toLocaleString()} total tokens
        </p>
      </article>

      <article className={styles.article}>
        <h2>Claimed</h2>
        <ProgressBar value={claimedTokens} aria-label="Claimed tokens" />
        <p>
          {tokensClaimed.toLocaleString()} / {claimableTokens.toLocaleString()}{' '}
          tokens claimed
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
    </>
  );
};

export { TokensInfo };
