import * as React from 'react';
import { useObserver } from 'mobx-react';
import { StoreContext } from '../../index';

import { Table } from 'chi-ui';
import { SectionBlock } from "../SectionBlock/SectionBlock";
import styles from './Explorer.scss';

export const Explorer = () => {
    const tableHeadings = [
        { value: "Block Number", isNumeric: true },
        { value: "Block Hash", isNumeric: false },
        { value: "Previous Hash", isNumeric: false },
        { value: "Merkle Root Hash", isNumeric: false },
        { value: "Compute Nodes", isNumeric: true },
        { value: "Transactions", isNumeric: true },
    ];

    const store = React.useContext(StoreContext);

    const mungeTableData = (data: any[]) => {
        let body = [];

        for (let d of data) {
            let blockHash = d[0];
            let blockData = d[1];

            let row = [
                { value: blockData.block.header.b_num, isNumeric: true },
                { value: <a href={`/${blockHash}`}>{blockHash}</a>, isNumeric: false },
                { value: blockData.block.header.previous_hash, isNumeric: false },
                { value: blockData.block.header.merkle_root_hash, isNumeric: false },
                { value: Object.keys(blockData.mining_tx_hash_and_nonces).length, isNumeric: true },
                { value: blockData.block.transactions.length, isNumeric: true },
            ];

            body.push(row);
        }

        return body;
    }

    return useObserver(() => (
        <div className={styles.container}>
            <div className={styles.mainContent}>
                <section className={styles.computeNodesContainer}>
                    <h2>compute nodes</h2>

                    <ul>
                        <li><SectionBlock /></li>
                        <li><SectionBlock /></li>
                        <li><SectionBlock /></li>
                    </ul>
                </section>

                <section className={styles.blockTable}>
                    <h2>latest blocks</h2>

                    <Table
                        sortable={true}
                        header={tableHeadings}
                        body={mungeTableData(store.tableData)}
                        overridingClass={styles.table} />
                </section>
            </div>
        </div>
    )) as any;
}