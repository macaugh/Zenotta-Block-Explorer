import * as React from 'react';
import { useObserver } from 'mobx-react';
import { useParams } from 'react-router-dom';
import { StoreContext } from '../../index';
import { ReceiptOutput, TokenOutput, TransactionData, TransactionInputsData, TransactionOutputsData } from '../../interfaces';

import styles from './TxView.scss';
import { RowTable } from '../RowTable/RowTable';
import { TxInfo } from '../TxInfo/TxInfo';
import { CsvBtn } from '../CsvBtn/CsvBtn';
import { downloadFile, formatCsvTxs, itemToCsv } from '../../formatCsv';
import { formatNumber } from '../../formatData';

export const TxView = () => {
    let { hash } = useParams<any>();
    const store = React.useContext(StoreContext);
    const [localData, setLocalData] = React.useState<any>(null);
    const [mainTxData, setMainTxData] = React.useState<any>(null);

    const checkSeenTxIns = (t: TransactionInputsData, seenIns: string[]) => {
        if (t.previous_out && t.previous_out.t_hash) {
            let t_hash = t.previous_out.t_hash;

            if (seenIns.indexOf(t_hash) == -1) {
                seenIns.push(t_hash);
                return true;
            }
            return false;
        }
        return false;
    };

    const formatScript = (stack: any[]) => {
        let combo = [];
        for (let entry of stack) {
            let key: any = Object.keys(entry)[0];
            let val = (entry as any)[key];

            combo.push(val instanceof Array ? toHexString(val) : val);
        }
        return combo.join('\n');
    };

    const formatTransactionInputs = (inputs: TransactionInputsData[]) => {
        return inputs.map((input) => {
            const previousOutputHash = input.previous_out && input.previous_out.t_hash ? input.previous_out.t_hash : 'N/A';
            return {
                previousOutputHash,
                scriptSig: formatScript(input.script_signature.stack),
            };
        });
    };

    const formatTransactionOutputs = (outputs: TransactionOutputsData[]) => {
        return outputs.map((output) => {
            if (output.value.hasOwnProperty('Token')) { // is a token output
                const token = (output.value as TokenOutput).Token;
                return {
                    address: output.script_public_key,
                    tokens: `${formatNumber((token / 25200).toFixed(2))} ZENO`,
                    fractionatedTokens: `${formatNumber(token)}`,
                    lockTime: output.locktime,
                };
            } else if (output.value.hasOwnProperty('Receipt')) { // is a Receipt output
                const obj = output.value as ReceiptOutput;
                return {
                    address: output.script_public_key,
                    receipts: obj.Receipt,
                    lockTime: output.locktime,
                };
            }
        });
    };

    const formatTransactions = (transactions: TransactionData[], hashes: string[]) => {
        if (!transactions || !transactions.length) {
            return [];
        }

        if (transactions.length == 1) {
            let tx = transactions[0];
            return extractTransactionInfo(tx, hashes, 0);
        }

        return transactions.map((tx, i) => {
            return extractTransactionInfo(tx, hashes, i);
        });
    };

    const formatDataForTable = (localData: any) => {
        if (!localData) { return null }
        return Object.keys(localData).map(key => {
            const value = localData[key];

            if (key === 'previousOutputHash' && value != 'N/A') { // Add clickable link if displayed as a block transaction
                return {
                    heading: key,
                    value: <a href={`/tx/${value}`}>{value}</a>
                };
            } else {
                return {
                    heading: key,
                    value: value
                };
            }
        });
    }

    const formatIncomingData = (tx: TransactionData) => {
        setMainTxData(formatTransactions([tx], [hash]));
        return {
            inputs: formatTransactionInputs(tx.inputs as TransactionInputsData[]),
            outputs: formatTransactionOutputs(tx.outputs as TransactionOutputsData[]),
        };
    };

    const extractTransactionInfo = (tx: any, hashes: string[], index: number) => {
        let seenIns: string[] = [];
        return {
            hash: hashes[index],
            totalTokens: formatNumber(tx.outputs.reduce((acc: number, o: any) => acc + o.value.Token, 0)),
            txInHashes: tx.inputs.filter((t: any) => checkSeenTxIns(t, seenIns)).map((i: any) => i.previous_out.t_hash),
            outputs: tx.outputs.map((o: any) => {
                return {
                    publicKey: o.script_public_key,
                    lockTime: o.locktime,
                    tokens: formatNumber(o.value.Token),
                };
            }),
        };
    };

    const toHexString = (byteArray: number[]) => {
        return Array.from(byteArray, (byte) => {
            return ('0' + (byte & 0xff).toString(16)).slice(-2);
        }).join('');
    };

    const downloadTx = async () => {
        const { txs, headers } = formatCsvTxs([localData]);
        const csv = itemToCsv(txs[0]);
        // downloadFile(`tx-${localData.blockNum}`, csv);
    };

    React.useEffect(() => {
        if (!localData) {
            store.fetchBlockchainItem(hash).then((fetchedData) => {
                if (fetchedData.hasOwnProperty('druid_info')) {
                    setLocalData(formatIncomingData(fetchedData as TransactionData));
                } else if (fetchedData.hasOwnProperty('block')) {
                    // Temp fix for searches on wrong filter. Must be changed on search level
                    localStorage.setItem('DROPDOWN_SELECT', 'Block Hash');
                    window.location.href = '/block/' + hash
                } else {
                    window.location.href = '/?invalid_search';
                }
            });
        }
    }, []);

    React.useEffect(() => {
        if (localData && window.location.hash) {
            let elmnt = document.getElementById(window.location.hash.substring(1));
            if (elmnt) elmnt.scrollIntoView(true);
        }
    }, [localData]);

    return useObserver(() => (
        <div className={styles.container}>
            <h2 className={styles.heading}>
                {'Transaction'}
            </h2>
            {/* <CsvBtn action={() => downloadTx()} /> */}
            <div className={styles.txContainer}>
                {mainTxData !== null && mainTxData !== undefined && <TxInfo {...mainTxData} txView={true} />}

                {localData && localData.inputs && localData.inputs.length > 0 &&
                    <>
                        <h2 id="inputs">Inputs</h2>
                        {localData.inputs.map((input: any, i: number) => {
                            return <div className={styles.infoContainer} key={i} ><RowTable rows={formatDataForTable(input)} /></div>;
                        })}
                    </>}

                {localData && localData.outputs && localData.outputs.length > 0 &&
                    <div>
                        <h2 id='outputs'>Outputs</h2>
                        {localData && localData.outputs.map((output: any, i: number) => {
                            return <div className={styles.infoContainer} key={i} ><RowTable rows={formatDataForTable(output)} /></div>;
                        })}
                    </div>}
            </div>
        </div>
    ));
};