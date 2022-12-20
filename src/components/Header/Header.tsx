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
          <Web3Button />
        </li>
      </ul>
    </header>
  );
};

export { Header };
