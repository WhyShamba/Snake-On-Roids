import React from 'react';
import styles from './CoolBackground.module.css';

interface CoolBackgroundProps {}

export const CoolBackground: React.FC<CoolBackgroundProps> = ({}) => {
  return (
    <div className={styles.lines}>
      <div className={styles.line}></div>
      <div className={styles.line}></div>
      <div className={styles.line}></div>
    </div>
  );
};
