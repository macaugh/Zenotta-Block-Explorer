import * as React from 'react';
import { useObserver } from 'mobx-react';
import styles from './Pill.scss';

export const Pill = (props: any) => {
    return useObserver(() => (
        <div className={styles.container}>
            {props.children}
        </div>
    ));
}