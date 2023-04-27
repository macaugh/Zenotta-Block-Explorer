import * as React from 'react';
import { useEffect, useState } from 'react';
import { useObserver } from 'mobx-react';
import styles from './BlockItem.scss';
import { StoreContext } from '../../..';
import { formatAddressForDisplay } from 'formatData';
import { Block, Transaction } from 'interfaces';
import { getEllapsedTime } from 'utils/getEllapsedTime';

interface BlockItemProps {
    data: { hash: string, block: Block }
}

export const BlockItem = (props: BlockItemProps) => {
    const store = React.useContext(StoreContext);

    const [data] = useState<{ hash: string, block: Block }>(props.data);

    const [reward, setReward] = useState<string>('');
    const [hashSize, setHashSize] = useState<number>(32);
    const [visibleBadge, setVisibleBadge] = useState<boolean>(false);
    const [blockTime, setBlockTime] = useState<string>('');

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
        if (window.innerWidth >= 510) {
            setHashSize(32);
            setVisibleBadge(true);
        } else {
            setHashSize(20);
            setVisibleBadge(false);
        }
        setBlockTime(getEllapsedTime(store.calculateBlockTime(data.block.bNum)))
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
                    <span className={styles.timestamp}>{blockTime}</span>
                </div>

                <div className={`${styles.hashs} ${visibleBadge ? styles.biggerHashes : ''}`}>
                    <div className={styles.left}>
                        <span className={styles.hash}><a href={`${store.network.name}/tx/${data.block.miningTxHashNonces.hash}`}>{formatAddressForDisplay(data.block.miningTxHashNonces.hash, hashSize)}</a></span>
                    </div>
                </div>
                <div className={styles.rewardContainer}>
                    <div className={styles.rewardBadge}>
                        <a className={styles.txLink} href={`${data.block.transactions.length ? `${store.network.name}/tx/${data.block.transactions[0]}` : '#'}`}>{data.block.transactions.length}{' Tx'}</a>
                    </div>
                </div>
            </div>
            <hr className={styles.separator} />
        </div>
    )) as JSX.Element;
}