import * as React from 'react';
import { useEffect, useState } from 'react';
import { useObserver } from 'mobx-react';
import { StoreContext } from '../../index';
import { useLocation } from 'react-router-dom';

import { Pagination, Table } from 'chi-ui';
import { Dropdown } from 'react-bootstrap';
import styles from './BlockExplorer.scss';
import { CsvBtn } from '../CsvBtn/CsvBtn';
import { Loading } from 'chi-ui';
import { Block } from 'interfaces';

function useQuery() {
    const { search } = useLocation();
    return React.useMemo(() => new URLSearchParams(search), [search]);
}

export const BlockExplorer = () => {
    const query = useQuery();
    const page = query.get('page');

    const [totalBlocks, setTotalBlocks] = useState(0);
    const [maxBlocksPerPage, setMaxBlocksPerPage] = useState(10);
    const [loading, setLoading] = useState(false);
    const [currentPage] = useState(page ? parseInt(page) : 1);

    const tableHeadings = [
        { value: "Block Nb", isNumeric: true },
        { value: "Block Hash", isNumeric: false },
        { value: "Previous Hash", isNumeric: false },
        { value: "Merkle Root Hash", isNumeric: false },
        { value: "Txs", isNumeric: true },
    ];

    const store = React.useContext(StoreContext);

    const mungeTableData = (data: {block: Block, hash: string}[]) => {
        let body = [];

        for (let obj of data) {
            let prevHash = obj.block.previousHash || "N/A";
            let merkleRoot = obj.block.merkleRootHash.merkleRootHash || "N/A";

            let row = [
                { value: obj.block.bNum, isNumeric: true },
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
            window.history.pushState('data', '', '/blocks?page=' + currentPage);
            store.setBlockTableData([]);
            store.fetchLatestBlock().then(() => {
                store.fetchBlocksTableData(currentPage, maxBlocksPerPage);
                store.latestBlock ? setTotalBlocks(store.latestBlock.bNum) : setTotalBlocks(0);
            });
        }
    }

    const reloadTable = (maxBlocksPerPage: number) => {
        setLoading(true);
        store.fetchLatestBlock().then(() => {
            store.fetchBlocksTableData(1, maxBlocksPerPage);
            store.latestBlock ? setTotalBlocks(store.latestBlock.bNum) : setTotalBlocks(0);
            setLoading(false);
        });
        setMaxBlocksPerPage(maxBlocksPerPage);
    }

    const generateSelect = () => {
        let select: React.ReactNodeArray = [];
        const value = 10;
        for (let i = 1; i <= 10; i++)
            select.push(<Dropdown.Item key={value * i} onClick={() => { reloadTable(value * i) }}>{value * i}</Dropdown.Item>);

        return (
            <Dropdown className={`${styles.selectNbItems} shadow-none`} title={'Blocks per Page'}>
                <Dropdown.Toggle id="dropdown-autoclose-true">
                    {maxBlocksPerPage}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                    {select}
                </Dropdown.Menu>
            </Dropdown>
        );
    }

    useEffect(() => {
        store.fetchLatestBlock().then(() => {
            store.fetchBlocksTableData(1, maxBlocksPerPage);
            store.latestBlock ? setTotalBlocks(store.latestBlock.bNum) : setTotalBlocks(0)
        });
    }, []);


    return useObserver(() => (
        <section className={styles.blockTable}>
            <div className={styles.blockTableHeader}>
                <div className={styles.selectContainer}>
                    {generateSelect()}
                    {loading && <Loading className={styles.loading} colour={'#999'} />}
                </div>
                <CsvBtn action={() => { window.location.href = '/csv-block-export' }} />
            </div>
            <Table
                sortable={true}
                header={tableHeadings}
                body={mungeTableData(store.blocksTableData)}
                className={styles.table} />
            {totalBlocks > 0 &&
                <Pagination
                    itemsPerPage={maxBlocksPerPage}
                    totalItems={totalBlocks}
                    maxPageNumbersDisplayed={9}
                    onPaginate={onPageChange}
                    currentPage={currentPage}
                    backgroundColor="#FFFFFF"
                    mainColor="#A6D4FF"
                    enableArrowBackground
                    enableArrowCheck
                    className={`${styles.pagination}`} />
            }
        </section>

    )) as JSX.Element;
}
