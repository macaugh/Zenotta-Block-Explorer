import * as React from 'react';
import { useEffect, useState } from 'react';
import { useObserver } from 'mobx-react';
import { StoreContext } from '../../index';
import { toJS } from 'mobx';

import { ItemList, DataType } from '../ItemList/ItemList';
import styles from './Overview.scss';

export const Overview = () => {
    const store = React.useContext(StoreContext);

    useEffect(() => {
        store.fetchLatestBlock().then(() => {
            store.fetchBlocksTableData(1, 10);
            store.fetchTxsTableData(1, 10);
        });
    }, []);

    return useObserver(() => (
        <div className={styles.container}>
            <ItemList title={'Latest Blocks'} data={store.blocksTableData} dataType={DataType.Block} />
            <ItemList title={'Latest Transactions'} data={store.txsTableData} dataType={DataType.Transaction} />
        </div>
    )) as any;
}