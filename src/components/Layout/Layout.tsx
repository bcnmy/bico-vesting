import { ReactNode } from 'react';
import { Header } from '../Header';
import styles from './Layout.module.css';

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className={styles.wrapper}>
      <Header />
      <main>{children}</main>
    </div>
  );
};

export { Layout };
