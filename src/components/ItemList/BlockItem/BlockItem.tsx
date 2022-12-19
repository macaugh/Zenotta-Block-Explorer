import * as React from 'react';
import { useEffect, useState } from 'react';
import { useObserver } from 'mobx-react';
import styles from './BlockItem.scss';
import { StoreContext } from '../../..';
import { formatAddressForDisplay } from 'formatData';
import { Block, Transaction } from 'interfaces';

interface BlockItemProps {
    data: {hash: string, block: Block}
}

export const BlockItem = (props: BlockItemProps) => {
    const store = React.useContext(StoreContext);

    const [data] = useState<{hash: string, block: Block}>(props.data);

    const [reward, setReward] = useState<string>('');
    const [hashSize, setHashSize] = useState<number>(24);
    const [visibleBadge, setVisibleBadge] = useState<boolean>(false);

    const fetchReward = async (coinbaseHash: string) => {
        if (coinbaseHash) {
            const tx = await store.fetchBlockchainItem(coinbaseHash) as Transaction;
            if (tx && tx.outputs.length > 0) {
                const output = tx.outputs[0];
                const tokens = ((output.value as { Token: number }).Token / 25200).toFixed(2);
                setReward(tokens.toString());
            }
        }
    }

    useEffect(() => {
        fetchReward(data.block.miningTxHashNonces.hash)
        if (window.innerWidth >= 510) {
            setHashSize(24);
            setVisibleBadge(true);
        } else {
            setHashSize(14);
            setVisibleBadge(false);
        }
    }, []);

    useEffect(() => {
        function handleResize() {
            if (window.innerWidth >= 510) {
                setHashSize(24);
                setVisibleBadge(true);
            } else {
                setHashSize(14);
                setVisibleBadge(false);
            }
        }

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    });

    return useObserver(() => (
        <div className={styles.item} key={data.hash}>
            <div className={styles.content}>
                <div className={styles.itemHeader}>
                    <span className={styles.blockNum}><a href={`${store.network.name}/block/${data.hash}`}>{data.block.bNum}</a></span>
                    <span className={styles.timestamp}>{'block time'}</span>
                </div>

                <div className={`${styles.hashs} ${visibleBadge ? styles.biggerHashes : ''}`}>
                    <div className={styles.left}>
                        <span className={styles.hash}><a href={`/tx/${data.block.miningTxHashNonces.hash}`}>{formatAddressForDisplay(data.block.miningTxHashNonces.hash, hashSize)}</a></span>
                        <span className={styles.hash}><a href={`/${data.block.transactions.length ? data.block.transactions[0] : '#'}`}>{data.block.transactions.length}{' Tx'}</a></span>
                    </div>
                </div>
                {visibleBadge &&
                <div className={styles.rewardContainer}>
                    <div className={styles.rewardBadge}>
                        {reward}<span className={styles.tokenName}>{' Zn'}</span>
                    </div>
                </div>
                }
            </div>
            <hr className={styles.separator} />
        </div>
    )) as JSX.Element;
}