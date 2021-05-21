import * as React from 'react';
import { useObserver } from 'mobx-react';
import { useParams } from 'react-router-dom';
import { StoreContext } from '../../index';

import styles from './BCItemView.scss';

export const BCItemView = () => {
    let params: any = useParams();

    let { num } = params;
    const store = React.useContext(StoreContext);

    return useObserver(() => (
        <div className={styles.container}>
            
        </div>
    ));
}

