import * as React from 'react';
import { useObserver } from "mobx-react";
import * as styles from './Footer.scss';

export const Footer = () => {
    return useObserver(() => 
        <div className={styles.container}>
            
        </div>
    );
}