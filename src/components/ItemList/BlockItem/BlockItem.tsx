import * as React from 'react';
import { useEffect, useState } from 'react';
import { useObserver } from 'mobx-react';
import styles from './BlockItem.scss';
import { Button } from 'chi-ui';
import { DataType } from '../ItemList';
import { MiningTxHashAndNoceData, TokenOutput, TransactionData, TransactionOutputsData } from '../../../interfaces';
import { StoreContext } from '../../..';

export const BlockItem = (props: any) => {

    const [reward, setReward] = useState<string>('');
    const store = React.useContext(StoreContext);


    const fetchReward = async (coinbaseHash: string) => {
        if (coinbaseHash) {
            const tx = (await store.fetchBlockchainItem(coinbaseHash)) as TransactionData;
            if (tx.outputs.length > 0) {
                const output = tx.outputs[0] as TransactionOutputsData;
                const tokens = ((output.value as TokenOutput).Token / 25200).toFixed(2);
                setReward(tokens.toString());
            }
        }
    }

useEffect(() => {
    fetchReward(props.data.miningTxHashAndNonces.hash)
}, []);

return useObserver(() => (
    <div className={styles.item} key={props.data.hash}>
        <div className={styles.content}>
            <div className={styles.itemHeader}>
                <span className={styles.blockNum}><a href={`/block/${props.data.hash}`}>{props.data.block.header.b_num}</a></span>
                <span className={styles.timestamp}>{'block time'}</span>
            </div>

            <div className={styles.hashs}>
                <div className={styles.left}>
                    <span className={styles.hash}><a href={`/tx/${props.data.miningTxHashAndNonces.hash}`}>{props.data.miningTxHashAndNonces.hash}</a></span>
                    <span className={styles.hash}><a href={`/${props.data.block.transactions.length ? props.data.block.transactions[0] : '#'}`}>{props.data.block.transactions.length}{' Tx'}</a></span>
                </div>
            </div>
            <div className={styles.rewardContainer}>
                <div className={styles.rewardBadge}>
                    {reward}<span className={styles.tokenName}>{' Zn'}</span>
                </div>
            </div>
        </div>
        <hr className={styles.separator} />
    </div>
)) as any;
}