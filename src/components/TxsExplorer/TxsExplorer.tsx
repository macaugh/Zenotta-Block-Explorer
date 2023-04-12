import * as React from 'react';
import { useEffect, useState } from 'react';
import { useObserver } from 'mobx-react';
import { StoreContext } from '../../index';
import { Pagination, Table } from 'chi-ui';
import styles from './TxsExplorer.scss';
import { CsvBtn } from '../CsvBtn/CsvBtn';
import { formatAmount } from '../../formatData';
import { useLocation } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import { Loading } from 'chi-ui';
import { Output } from 'interfaces';

function useQuery() {
    const { search } = useLocation();
    return React.useMemo(() => new URLSearchParams(search), [search]);
}

export const TxsExplorer = () => {

    const store = React.useContext(StoreContext);

    const query = useQuery();
    const page = query.get('page');

    const [totalTxs, setTotalTxs] = useState(store.nbTxs);
    const [maxTxsPerPage, setMaxTxsPerPage] = useState(10);
    const [body, setBody]: any = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(page ? parseInt(page) : 1);

    const tableHeadings = [
        { value: "Tx Nb", isNumeric: true },
        { value: "Tx Hash", isNumeric: false },
        { value: "Tx Type", isNumeric: false },
        { value: "Block Number", isNumeric: true },
        { value: "Inputs", isNumeric: true },
        { value: "Outputs", isNumeric: true },
        { value: "Aggregated Amount", isNumeric: true },
    ];


    const mungeTableData = async (data: any) => {
        let body = [];

        for (let i = 0; i < data.length; i++) {
            const txTableData = data[i];

            if (txTableData) {
                let amount = formatAmount(txTableData.transaction, true);

                let row = [
                    { value: (totalTxs - i) - ((currentPage - 1) * maxTxsPerPage), isNumeric: true },
                    { value: <a href={`/tx/${txTableData.hash}?bnum=${txTableData.bNum}`}>{txTableData.hash}</a>, isNumeric: false },
                    { value: getTxType(txTableData.transaction.outputs), isNumeric: false },
                    { value: <a style={{ cursor: "pointer" }} href={`/block/${await getBlockHashFromNum(txTableData.bNum)}`}>{txTableData.bNum}</a>, isNumeric: false },
                    { value: txTableData.transaction.inputs.length, isNumeric: true },
                    { value: txTableData.transaction.outputs.length, isNumeric: true },
                    { value: parseInt(amount) != 0 ? amount + ' ZENO' : 'N/A', isNumeric: false },
                ];
                body.push(row);
            }
        }
        return body;
    }

    const getBlockHashFromNum = async (blockNum: string) => {
        const validity = await store.blockNumIsValid(parseInt(blockNum));
        if (validity.isValid) {
            return store.fetchBlockHashByNum(parseInt(blockNum)).then((hash: string) => {
                if (hash) {
                    return hash;
                }
            });
        } else {
            console.log(validity.error);
        }
    }

    const getTxType = (outputs: Output[]) => {
        let result: string = 'N/A';
        outputs.forEach((output) => {
            if (output.value.hasOwnProperty('Token')) { // is a token output
                result = 'Token';
            } else if (output.value.hasOwnProperty('Receipt')) { // is a Receipt output
                result = 'Receipt';
            }
        });
        return result
    }

    const generateSelect = () => {
        let select: any = [];
        const value = 10;
        for (let i = 1; i <= 3; i++)
            select.push(<Dropdown.Item key={value * i} onClick={() => { reloadTable(value * i) }}>{value * i}</Dropdown.Item>);

        return (
            <Dropdown className={`${styles.selectNbItems} shadow-none`} title={'Test'}>
                <Dropdown.Toggle id="dropdown-autoclose-true">
                    {maxTxsPerPage}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                    {...select}
                </Dropdown.Menu>
            </Dropdown>
        );
    }

    const onPageChange = (currentPage: number) => {
        if (totalTxs > 0) {
            window.history.pushState('data', '', '/txs?page=' + currentPage);
            setBody([]);
            store.fetchTxsTableData(currentPage, maxTxsPerPage).then(() => {       
                setCurrentPage(currentPage); // Triggers useEffect hook
            });
        }
    }

    const reloadTable = (maxTxsPerPage: number) => {
        setLoading(true);
        store.fetchTxsTableData(currentPage, maxTxsPerPage).then(() => {
            setMaxTxsPerPage(maxTxsPerPage); //Triggers useEffect hook
            setLoading(false);
        });
    }

    // On component mount, initial data fetch
    useEffect(() => {
        store.fetchTxsTableData(currentPage, maxTxsPerPage).then(() => {
            setTotalTxs(store.nbTxs); //Triggers useEffect hook
        });
    }, []);

    // Update table data hook
    useEffect(() => {
        mungeTableData(store.txsTableData).then(data => { setBody(data) }).catch(err => { });
    }, [currentPage, totalTxs, maxTxsPerPage]);

    return useObserver(() => (

        <section className={styles.txsTable}>
            <div className={styles.txsTableHeader}>
                <div className={styles.selectContainer}>
                    {generateSelect()}
                    {loading && <Loading className={styles.loading} colour={'#999'} />}
                </div>
                <CsvBtn action={() => { window.location.href = '/csv-tx-export' }} />
            </div>
            <Table
                sortable={true}
                header={tableHeadings}
                body={body}
                className={styles.table} />
            {totalTxs > 0 &&
                <Pagination
                    itemsPerPage={maxTxsPerPage}
                    totalItems={totalTxs}
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