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
                <ul>
                    <li>
                        <div className={styles.row}>
                            <p>Hash</p>
                            <p>{props.hash}</p>
                        </div>
                    </li>
                    <li>
                        <div className={styles.row}>
                            <p>Total Fractionated Tokens</p>
                            <p className={styles.tokenTotal}><b>{props.totalTokens}</b></p>
                        </div>
                    </li>
                    <li>
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
                    </li>
                </ul>
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
                                    <p><b>{(o.tokens / 25200).toFixed(2)}</b> ZENO</p>
                                </div>
                                <div className={styles.row}>
                                    <p>Fractionated Tokens</p>
                                    <p><b>{o.tokens}</b></p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    )
}