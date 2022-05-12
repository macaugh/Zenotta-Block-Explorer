import * as React from 'react';
import {useEffect, useState} from 'react';
import {useObserver} from 'mobx-react';
import {StoreContext} from '../../index';

import {Pagination, Table} from 'chi-ui';
import {SectionBlock} from "../SectionBlock/SectionBlock";
import dlicon from "../../static/img/dlicon.svg";
import styles from './Explorer.scss';

export const Explorer = () => {
    const [totalBlocks, setTotalBlocks] = useState(0);
    const [maxBlocksPerPage] = useState(10);

    const tableHeadings = [
        {value: "Block Number", isNumeric: true},
        {value: "Block Hash", isNumeric: false},
        {value: "Previous Hash", isNumeric: false},
        {value: "Merkle Root Hash", isNumeric: false},
        {value: "Compute Nodes", isNumeric: true},
        {value: "Transactions", isNumeric: true},
    ];

    const store = React.useContext(StoreContext);

    const mungeTableData = (data: any[]) => {
        let body = [];

        for (let d of data) {
            let blockHash = d[0];
            let blockData = d[1];

            let row = [
                {value: blockData.block.header.b_num, isNumeric: true},
                {value: <a href={`/${blockHash}`}>{blockHash}</a>, isNumeric: false},
                {value: blockData.block.header.previous_hash, isNumeric: false},
                {value: blockData.block.header.merkle_root_hash, isNumeric: false},
                {value: Object.keys(blockData.mining_tx_hash_and_nonces).length, isNumeric: true},
                {value: blockData.block.transactions.length, isNumeric: true},
            ];

            body.push(row);
        }

        return body;
    }

    const onPageChange = (currentPage: number) => {
        if (totalBlocks > 0) {
            store.fetchLatestBlock(currentPage, maxBlocksPerPage).then(() => {
                store.latestBlock ? setTotalBlocks(store.latestBlock.block.header.b_num) : setTotalBlocks(0);
            });
        }
    }

    useEffect(() => {
        store.fetchLatestBlock(1, maxBlocksPerPage).then(() => {
            store.latestBlock ? setTotalBlocks(store.latestBlock.block.header.b_num) : setTotalBlocks(0);
        });
    }, []);

    return useObserver(() => (
        <div className={styles.container}>
            <div className={styles.mainContent}>
                {/*<section className={styles.computeNodesContainer}>
                    <h2>compute nodes</h2>

                    <ul>
                        <li><SectionBlock/></li>
                        <li><SectionBlock/></li>
                        <li><SectionBlock/></li>
                    </ul>
                </section>*/}

                <section className={styles.blockTable}>
                    <h2>latest blocks</h2>

                    <div className={styles.dlContainer}><p className={styles.dlBtn} onClick={() => {window.location.href = '/csv-export'}}>[Download <span className={styles.csvExport}>CSV Export<img className={styles.dlicon} src={dlicon} /></span>]</p></div>
                    <Table
                        sortable={true}
                        header={tableHeadings}
                        body={mungeTableData(store.tableData)}
                        className={styles.table}/>

                    <Pagination
                        itemsPerPage={maxBlocksPerPage}
                        totalItems={totalBlocks}
                        maxPageNumbersDisplayed={9}
                        onPaginate={onPageChange}
                        backgroundColor="#FFFFFF"
                        mainColor="#A6D4FF"
                        enableArrowBackground
                        className={styles.pagination}/>
                </section>
            </div>
        </div>
    )) as any;
}