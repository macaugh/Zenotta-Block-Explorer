import * as React from 'react';
import { useEffect, useState } from 'react';
import { useObserver } from 'mobx-react';
import { toJS } from 'mobx';
import { StoreContext } from '../../index';

import { Pagination, Table } from 'chi-ui';
import { RequestData } from '../../interfaces';
import { SectionBlock } from "../SectionBlock/SectionBlock";
import { ItemList, DataType } from '../ItemList/ItemList';
import styles from './Overview.scss';

export const Overview = () => {
    const store = React.useContext(StoreContext);

    const [totalBlocks, setTotalBlocks] = useState(0);
    const [visibleBlocks] = useState(10);

    useEffect(() => {
        store.fetchLatestBlock(1, visibleBlocks).then(() => {
            store.latestBlock ? setTotalBlocks(store.latestBlock.block.header.b_num) : setTotalBlocks(0);
        });
    }, []);


    return useObserver(() => (
        <div className={styles.container}>
            <ItemList title={'Latest Blocks'} data={store.tableData} dataType={DataType.Block}/>
            <ItemList title={'Latest Transactions'} data={[]} dataType={DataType.Transaction}/>
        </div>
    )) as any;
}