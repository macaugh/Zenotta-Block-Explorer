import * as React from 'react';
import { useObserver } from 'mobx-react';
import { useParams } from 'react-router-dom';
import { StoreContext } from '../../index';

import styles from './BCItemView.scss';

export const BCItemView = () => {
    let localData: any;
    let heading: string | null = localData ? localData.hasOwnProperty('Block') ? 'Block' : 'Transaction' : null;
    let { hash } = useParams<any>();
    const store = React.useContext(StoreContext);

    const fetchInfo = async () => {
        localData = await store.fetchBlockchainItem(hash);
        heading = localData ? localData.hasOwnProperty('Block') ? 'Block' : 'Transaction' : null;

        console.log('localData', Object.keys(localData));
        console.log("heading", heading);
    }

    fetchInfo();

    React.useEffect(() => {
    });

    return useObserver(() => (
        <div className={styles.container}>
            <h2>{heading}</h2>
        </div>
    ));
}

