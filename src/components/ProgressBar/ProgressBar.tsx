import * as Progress from '@radix-ui/react-progress';
import styles from './ProgressBar.module.css';

type ProgressBarProps = {
  /**
   * The current value of the progress bar.
   */
  value: number;
};

const ProgressBar = ({ value, ...props }: ProgressBarProps) => {
  return (
    <Progress.Root className={styles.root} value={value} {...props}>
      <Progress.Indicator
        className={styles.indicator}
        style={{ transform: `translateX(-${100 - value}%)` }}
      />
    </Progress.Root>
  );
};

export { ProgressBar };
