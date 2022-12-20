import { Web3Button } from '@web3modal/react';
import biconomyLogo from '../../assets/biconomy.svg';
import styles from './Header.module.css';

const Header = () => {
  return (
    <header className={styles.siteHeader}>
      <img src={biconomyLogo} alt="Biconomy - Logo" />

      <ul className={styles.nav}>
        <li className={styles.navItem}>
          <a
            href="https://staking.biconomy.io/"
            target="_blank"
            rel="noreferrer"
          >
            Stake BICO
          </a>
        </li>
        <li className={styles.navItem}>
          {/* TypeSript is not happy with this for some reason
            but this is as per the documentation:
            https://docs.walletconnect.com/2.0/web3modal/react/components
          */}
          {/* @ts-expect-error */}
          <Web3Button icon="hide" />
        </li>
      </ul>
    </header>
  );
};

export { Header };
