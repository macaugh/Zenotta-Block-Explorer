import * as React from 'react';
import { useEffect, useState } from 'react';
import { useObserver } from 'mobx-react';
import { StoreContext } from '../../index';

import { Pagination, Table } from 'chi-ui';
import styles from './TxsExplorer.scss';
import { CsvBtn } from '../CsvBtn/CsvBtn';
import { TransactionOutputsData } from '../../interfaces';
import { formatAmount } from '../../formatData';

export const TxsExplorer = () => {
    const store = React.useContext(StoreContext);

    const [totalTxs, setTotalTxs] = useState(0);
    const [maxTxsPerPage] = useState(10);
    const [leftArrowClass, setLeftArrowClass] = useState(styles.leftArrowDisabled);
    const [rightArrowClass, setRightArrowClass] = useState('');
    const [body, setBody]: any = useState([]);

    const tableHeadings = [
        { value: "Tx Hash", isNumeric: true },
        { value: "Tx Type", isNumeric: false },
        { value: "Block", isNumeric: true },
        { value: "Inputs", isNumeric: true },
        { value: "Outputs", isNumeric: true },
        { value: "Aggregated Amount", isNumeric: true },
    ];


    const mungeTableData = async (data: any) => {
        let body = [];

        for (let i = 0; i < data.length; i++) {
            const txTableData = data[i];

            if (txTableData) {

                let amount = formatAmount(txTableData.transaction); 

                let row = [
                    { value: <a href={`/tx/${txTableData.hash}`}>{txTableData.hash}</a>, isNumeric: false },
                    { value: getTxType(txTableData.transaction.outputs), isNumeric: false },
                    { value: <a style={{cursor: "pointer"}} href={`/block/${await getBlockHashFromNum(txTableData.blockNum)}`}>{txTableData.blockNum}</a>, isNumeric: false },
                    { value: txTableData.transaction.inputs.length, isNumeric: true },
                    { value: txTableData.transaction.outputs.length, isNumeric: true },
                    { value: parseInt(amount) != 0 ? amount + ' ZENO': 'N/A', isNumeric: false },
                ];
                body.push(row);
            }
        }
        return body;
    }

    const onPageChange = (currentPage: number) => {
        if (totalTxs > 0) {
            setLeftArrowClass(currentPage === 1 ? styles.leftArrowDisabled : '');
            setRightArrowClass(currentPage === Math.ceil(totalTxs / maxTxsPerPage) ? styles.rightArrowDisabled : '');

            setBody([]);
            store.fetchTxsTableData(currentPage, maxTxsPerPage).then(() => {
                mungeTableData(store.txsTableData).then(data => { setBody(data) }).catch(err => { })
            });
        }
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

    const getTxType = (outputs: TransactionOutputsData[]) => {
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

    useEffect(() => {
        store.fetchTxsTableData(1, maxTxsPerPage).then(() => {
            setTotalTxs(store.nbTxs);
            mungeTableData(store.txsTableData).then(data => { setBody(data) }).catch(err => { })
        });
    }, []);

    return useObserver(() => (

        <section className={styles.blockTable}>
            <CsvBtn action={() => { }} />
            <Table
                sortable={true}
                header={tableHeadings}
                body={body}
                className={styles.table} />

            <Pagination
                itemsPerPage={maxTxsPerPage}
                totalItems={totalTxs}
                maxPageNumbersDisplayed={9}
                onPaginate={onPageChange}
                backgroundColor="#FFFFFF"
                mainColor="#A6D4FF"
                enableArrowBackground
                className={`${styles.pagination} ${leftArrowClass} ${rightArrowClass}`} />
        </section>

    )) as any;
}