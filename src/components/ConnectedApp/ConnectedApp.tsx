import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { BigNumber } from "ethers";
import React from "react";
import {
    useAccount,
    useContractReads,
    useContractWrite,
    useNetwork,
    usePrepareContractWrite,
    useSwitchNetwork,
    useWaitForTransaction,
} from "wagmi";
import vestingABI from "../../abis/vesting.abi.json";
import { useClaimGas } from "../../hooks/useClaimGas";
import { vestingContract, VESTING_ADDRESS } from "../../lib/constants";
import { formatBigNumber } from "../../utils/formatBigNumber";
import { Claim, formatClaim } from "../../utils/formatClaim";
import { ProgressBar } from "../ProgressBar";
import {
    ToastClose,
    ToastDescription,
    ToastProvider,
    ToastRoot,
    ToastTitle,
    ToastViewport,
} from "../Toast";
import toastStyles from "../Toast/Toast.module.css";
import styles from "./ConnectedApp.module.css";

dayjs.extend(relativeTime);

const ConnectedApp = () => {
    const [open, setOpen] = React.useState(false);
    const [toastInfo, setToastInfo] = React.useState({
        title: "",
        description: "",
    });
    const timerRef = React.useRef(0);
    const { address } = useAccount();
    const { chain, chains } = useNetwork();
    const { isLoading: switchNetworkLoading, switchNetwork } =
        useSwitchNetwork();
    const claimGasLimit = useClaimGas();

    React.useEffect(() => {
        return () => clearTimeout(timerRef.current);
    }, []);

    const {
        data: vestingData,
        isError,
        isLoading,
        refetch,
    } = useContractReads({
        contracts: [
            {
                ...vestingContract,
                functionName: "getClaim",
                args: [address],
                chainId: chains[0].id,
            },
            {
                ...vestingContract,
                functionName: "claimableAmount",
                args: [address],
                chainId: chains[0].id,
            },
            {
                ...vestingContract,
                functionName: "paused",
                chainId: chains[0].id,
            },
        ],
    });
    const claim = vestingData?.[0].result as unknown as Claim;
    const claimableAmount = vestingData?.[1].result as unknown as BigNumber;
    const paused = vestingData?.[2].result as unknown as boolean;

    const { config } = usePrepareContractWrite({
        address: VESTING_ADDRESS,
        abi: vestingABI,
        functionName: "claim",
        overrides: {
            gasLimit: claimGasLimit,
        },
        enabled: !!claimGasLimit,
    });

    const {
        data: claimTokens,
        isLoading: claimTokensLoading,
        write,
    } = useContractWrite({
        ...config,
        onSuccess: () => {
            setOpen(false);
            window.clearTimeout(timerRef.current);
            timerRef.current = window.setTimeout(() => {
                setToastInfo({
                    title: "Transaction sent 👍",
                    description:
                        "Please wait for the transaction to be approved.",
                });
                setOpen(true);
            }, 100);
        },
        onError: (error) => {
            // Log the error
            console.error(error);

            const errorDescription =
                error.name === "UserRejectedRequestError"
                    ? "Transaction rejected by user"
                    : "We were unable to send the transaction. Please try again later.";
            setOpen(false);
            window.clearTimeout(timerRef.current);
            timerRef.current = window.setTimeout(() => {
                setToastInfo({
                    title: "Failed to send transaction 🙁",
                    description: errorDescription,
                });
                setOpen(true);
            }, 100);
        },
    });

    const { isLoading: claimTokensTxLoading, isSuccess: claimTokensTxSuccess } =
        useWaitForTransaction({
            hash: claimTokens?.hash,
            onSuccess: () => {
                refetch();
                setOpen(false);
                window.clearTimeout(timerRef.current);
                timerRef.current = window.setTimeout(() => {
                    setToastInfo({
                        title: "Tokens claimed 🎉",
                        description:
                            "You have successfully claimed your tokens.",
                    });
                    setOpen(true);
                }, 100);
            },
            onError: (error) => {
                // Log the error
                console.error(error);

                setOpen(false);
                window.clearTimeout(timerRef.current);
                timerRef.current = window.setTimeout(() => {
                    setToastInfo({
                        title: "Failed to claim tokens 😢",
                        description: `We were unable to claim your tokens. Please try again later.`,
                    });
                    setOpen(true);
                }, 100);
            },
        });

    // Loading state
    if (isLoading) {
        return (
            <section className={styles.slice}>
                <p>Loading...</p>
            </section>
        );
    }

    // Error state
    if (isError) {
        return (
            <section className={styles.slice}>
                <p>
                    We were unable to fetch the claims data. Please try again
                    later.
                </p>
            </section>
        );
    }

    // Desctructure claim data
    const {
        vestAmount,
        unlockAmount,
        endTime,
        amountClaimed: tokensClaimed,
    } = formatClaim(claim);

    // // Current and matury dates
    const currentDate = Math.round(Date.now() / 1000);
    const maturityDate = new Date(Number.parseFloat(endTime.toString()) * 1000);

    // Claimable and total claimable tokens
    const claimableTokens = formatBigNumber(claimableAmount) + tokensClaimed;
    const totalClaimableTokens = vestAmount + unlockAmount;

    // Generated tokens, claimed tokens and availability
    const streamed = (claimableTokens / totalClaimableTokens) * 100 || 0;
    const claimed = (tokensClaimed / claimableTokens) * 100 || 0;
    let availability = claimableTokens - tokensClaimed;
    availability = availability <= 0.001 ? 0 : availability;

    // Maturity status
    let maturityStatus = `${dayjs(maturityDate).fromNow(true)} till maturity`;
    if (
        currentDate > Number.parseFloat(claim.endTime.toString()) ||
        !claim.endTime
    ) {
        maturityStatus = "Complete";
    } else if (paused) {
        maturityStatus = "Paused";
    } else if (totalClaimableTokens !== tokensClaimed && !claim.isActive) {
        maturityStatus = "Revoked";
    }

    // Is claim exhausted?
    const areClaimsDisabled =
        paused ||
        !claim.isActive ||
        availability === 0 ||
        tokensClaimed >= totalClaimableTokens ||
        tokensClaimed >= claimableTokens;

    return (
        <section className={styles.slice}>
            <ToastProvider swipeDirection="right">
                <header className={styles.sectionHeader}>
                    <h1>Claim Tokens</h1>
                    {chain &&
                    chains.find((chainObj) => chainObj.id === chain.id) ? (
                        <button
                            className={styles.claimTokensBtn}
                            disabled={areClaimsDisabled || claimTokensLoading}
                            onClick={() => write?.()}
                        >
                            {claimTokensTxLoading
                                ? "Claiming..."
                                : claimTokensTxSuccess
                                ? "Claimed"
                                : "Claim Bico"}
                        </button>
                    ) : (
                        //  Since we only have a single chain, we can use the first one.
                        <button
                            disabled={!switchNetwork}
                            onClick={() => switchNetwork?.(chains[0].id)}
                        >
                            {switchNetworkLoading
                                ? `Switching to ${chains[0].name}...`
                                : `Switch to ${chains[0].name}`}
                        </button>
                    )}
                </header>

                {/* Vesting information */}
                <article className={styles.article}>
                    <h2>Streamed</h2>
                    <ProgressBar
                        value={streamed}
                        aria-label="Streamed tokens"
                    />
                    <p>
                        {claimableTokens.toLocaleString()} /{" "}
                        {totalClaimableTokens.toLocaleString()} total tokens
                    </p>
                </article>

                <article className={styles.article}>
                    <h2>Claimed</h2>
                    <ProgressBar value={claimed} aria-label="Claimed tokens" />
                    <p>
                        {tokensClaimed.toLocaleString()} /{" "}
                        {claimableTokens.toLocaleString()} tokens claimed
                    </p>
                </article>

                <article className={styles.article}>
                    <h2>Time left</h2>
                    <p>{maturityStatus}</p>
                </article>

                <article className={styles.article}>
                    <h2>Availability</h2>
                    <p>
                        {availability.toLocaleString()} tokens available to
                        claim
                    </p>
                </article>

                {/* Toast */}
                <ToastRoot
                    className={toastStyles.toastRoot}
                    open={open}
                    onOpenChange={setOpen}
                >
                    <ToastTitle className={toastStyles.toastTitle}>
                        {toastInfo.title}
                    </ToastTitle>
                    <ToastDescription asChild>
                        <p className={toastStyles.toastDescription}>
                            {toastInfo.description}
                        </p>
                    </ToastDescription>
                    <ToastClose
                        className={toastStyles.toastClose}
                        aria-label="Close"
                    >
                        Dismiss
                    </ToastClose>
                </ToastRoot>
                <ToastViewport className={toastStyles.toastViewport} />
            </ToastProvider>
        </section>
    );
};

export { ConnectedApp };

