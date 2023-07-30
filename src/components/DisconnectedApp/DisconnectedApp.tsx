import { Web3Button } from '@web3modal/react';
import styles from './DisconnectedApp.module.css';

const DisconectedApp = () => {
  return (
    <section className={styles.slice}>
      {/* TypeSript is not happy with this for some reason
          but this is as per the documentation:
          https://docs.walletconnect.com/2.0/web3modal/react/components
      */}
      <Web3Button icon="hide" />
    </section>
  );
};

export { DisconectedApp };
