import * as React from 'react';
import { useEffect } from 'react';
import { useObserver } from 'mobx-react';
import { StoreContext } from '../../index';

import { ItemList, DataType } from '../ItemList/ItemList';
import styles from './Overview.scss';
import Search from 'components/Search/Search';

export const Overview = () => {
    const store = React.useContext(StoreContext);

    useEffect(() => {
        store.fetchLatestBlock().then(() => {
            store.fetchBlocksTableData(1, 10);
            store.fetchTxsTableData(1, 10);

        });
    }, []);

    return useObserver(() => (
        <>

            {/* <h1 className={styles.title}>Zenotta Block Explorer</h1> */}
            <div className={styles.searchContainer}>
                <Search />
            </div>

            <div className={styles.container}>
                <ItemList title={'Latest Blocks'} data={store.blocksTableData} dataType={DataType.Block} />
                <ItemList title={'Latest Transactions'} data={store.txsTableData} dataType={DataType.Transaction} />
            </div>

            {/* <div className={styles.backgroundBanner} /> */}
        </>
    )) as JSX.Element;
}