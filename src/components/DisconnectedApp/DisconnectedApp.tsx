import { Web3Button } from '@web3modal/react';
import styles from './DisconnectedApp.module.css';

const DisconectedApp = () => {
  return (
    <section className={styles.slice}>
      <Web3Button />
    </section>
  );
};

export { DisconectedApp };
