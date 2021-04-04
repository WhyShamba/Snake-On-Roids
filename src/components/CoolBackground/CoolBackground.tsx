import React from 'react';
import styles from './CoolBackground.module.css';

export const CoolBackground: React.FC = () => {
  return (
    <div className={styles.lines}>
      <div className={styles.line}></div>
      <div className={styles.line}></div>
      <div className={styles.line}></div>
    </div>
  );
};
