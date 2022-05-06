import * as React from 'react';
import styles from './TransactionInfo.scss';
import arrowIcon from '../../static/img/left-arrow.svg';

export interface TransactionInfoProps {
    hash: string,
    txInHashes: string[],
    totalTokens: number[],
    outputs: TxOutPuts[]
}

interface TxOutPuts {
    publicKey: string,
    lockTime: number,
    tokens: number
}

export const TransactionInfo = (props: TransactionInfoProps) => {
    return (
        <div className={styles.container}>
            <div className={styles.left}>
                <div className={styles.row}>
                    <p>Hash</p>
                    <a href={`/${props.hash}`}>{props.hash}</a>
                </div>

                <div className={styles.row}>
                    <p>Total Tokens</p>
                    <p className={styles.tokenTotal}><b>{props.totalTokens}</b> ZENO</p>
                </div>

                <div className={styles.row}>
                    <p>Input Transaction(s)</p>

                    {props.txInHashes && props.txInHashes.length > 0 &&
                    <ul className={styles.ins}>
                        {props.txInHashes.map(h => {
                            return <li key={h}><a href={`/${h}`}>{h}</a></li>;
                        })}
                    </ul>}

                    {!props.txInHashes || props.txInHashes.length === 0 && <p>N/A</p>}
                </div>
            </div>

            <img src={arrowIcon} className={styles.arrowIcon} />

            <div className={styles.right}>
                <ul>
                    {props.outputs.map((o, i) => {
                        return (
                            <li key={i}>
                                <div className={styles.row}>
                                    <p>Address</p>
                                    <p>{o.publicKey}</p>
                                </div>
                                <div className={styles.row}>
                                    <p>Tokens</p>
                                    <p><b>{o.tokens}</b> ZENO</p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    )
}