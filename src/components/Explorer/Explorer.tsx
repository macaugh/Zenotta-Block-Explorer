import * as React from 'react';
import { useEffect, useState } from 'react';
import { useObserver } from 'mobx-react';
import { StoreContext } from '../../index';

import { Pagination, Table } from 'chi-ui';
import { RequestData } from '../../interfaces';
import styles from './Explorer.scss';
import { CsvBtn } from '../CsvBtn/CsvBtn';

export const Explorer = () => {
    const [totalBlocks, setTotalBlocks] = useState(0);
    const [maxBlocksPerPage] = useState(10);
    const [leftArrowClass, setLeftArrowClass] = useState(styles.leftArrowDisabled);
    const [rightArrowClass, setRightArrowClass] = useState('');

    const tableHeadings = [
        { value: "Block Number", isNumeric: true },
        { value: "Block Hash", isNumeric: false },
        { value: "Previous Hash", isNumeric: false },
        { value: "Merkle Root Hash", isNumeric: false },
        { value: "Transactions", isNumeric: true },
    ];

    const store = React.useContext(StoreContext);

    const mungeTableData = (data: RequestData[]) => {
        let body = [];
        
        for (let obj of data) {
            let prevHash = obj.block.header.previous_hash || "N/A";
            let merkleRoot = obj.block.header.merkle_root_hash || "N/A";

            let row = [
                { value: obj.block.header.b_num, isNumeric: true },
                { value: <a href={`/block/${obj.hash}`}>{obj.hash}</a>, isNumeric: false },
                { value: prevHash, isNumeric: false },
                { value: merkleRoot, isNumeric: false },
                { value: obj.block.transactions.length, isNumeric: true },
            ];

            body.push(row);
        }

        return body;
    }

    const onPageChange = (currentPage: number) => {
        if (totalBlocks > 0) {
            setLeftArrowClass(currentPage === 1 ? styles.leftArrowDisabled : '');
            setRightArrowClass(currentPage === Math.ceil(totalBlocks / maxBlocksPerPage) ? styles.rightArrowDisabled : '');

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

        <section className={styles.blockTable}>
            <CsvBtn action={() => {window.location.href = '/csv-export'}}/>
            <Table
                sortable={true}
                header={tableHeadings}
                body={mungeTableData(store.tableData)}
                className={styles.table} />

            <Pagination
                itemsPerPage={maxBlocksPerPage}
                totalItems={totalBlocks}
                maxPageNumbersDisplayed={9}
                onPaginate={onPageChange}
                backgroundColor="#FFFFFF"
                mainColor="#A6D4FF"
                enableArrowBackground
                className={`${styles.pagination} ${leftArrowClass} ${rightArrowClass}`} />
        </section>

    )) as any;
}