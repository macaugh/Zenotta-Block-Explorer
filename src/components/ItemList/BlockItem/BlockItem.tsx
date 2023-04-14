import * as React from 'react';
import { useEffect, useState } from 'react';
import { useObserver } from 'mobx-react';
import styles from './BlockItem.scss';
import { StoreContext } from '../../..';
import { formatAddressForDisplay } from 'formatData';
import { Block, Transaction } from 'interfaces';

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

    const getEllapsedTime = (timestamp: number) => {
        let now = new Date();
        let blocktime = new Date(timestamp * 1000);
        // let difference = now.getTime() - blocktime.getTime();
        let ellapsedSeconds = Math.abs(now.getTime() - blocktime.getTime())/1000;
        let ellapsedMinutes = ellapsedSeconds/60;
        let ellapsedHours = ellapsedMinutes/60;

        if (ellapsedSeconds < 60) {
            setBlockTime(`${ellapsedSeconds} seconds ago`);
        } else if (ellapsedMinutes < 60) {
            setBlockTime(`${ellapsedMinutes} minutes ago`);
        } else if (ellapsedHours < 24) {
            let minutes = Math.floor((ellapsedHours - Math.floor(ellapsedHours)) * 60);
            setBlockTime(`${Math.floor(ellapsedHours)}h${minutes < 10 ? '0'+minutes: minutes}m ago`);
        } else if (ellapsedHours >= 24) {
            setBlockTime(blocktime.toLocaleString());
        }
    }

    useEffect(() => {
        // fetchReward(data.block.miningTxHashNonces.hash)
        if (window.innerWidth >= 510) {
            setHashSize(32);
            setVisibleBadge(true);
        } else {
            setHashSize(20);
            setVisibleBadge(false);
        }

        getEllapsedTime(store.calculateBlockTime(data.block.bNum))

        // setBlockTime(new Date(store.calculateBlockTime(data.block.bNum) * 1000).toLocaleString());

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
                        <a className={styles.txLink} href={`/${data.block.transactions.length ? data.block.transactions[0] : '#'}`}>{data.block.transactions.length}{' Tx'}</a>
                    </div>
                </div>
            </div>
            <hr className={styles.separator} />
        </div>
    )) as JSX.Element;
}