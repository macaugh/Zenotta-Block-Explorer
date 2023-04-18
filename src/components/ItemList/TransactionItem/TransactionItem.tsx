import * as React from 'react';
import { useEffect, useState } from 'react';
import { useObserver } from 'mobx-react';
import styles from './TransactionItem.scss';
import { StoreContext } from '../../..';
import { formatAddressForDisplay, formatAmount } from '../../../formatData';
import { TransactionTableData } from 'interfaces';
import { getEllapsedTime } from 'utils/getEllapsedTime';
import { BiReceipt } from 'react-icons/bi';

interface TransactionItemProps {
    data: TransactionTableData
}

export const TransactionItem = (props: TransactionItemProps) => {
    const store = React.useContext(StoreContext);
    const [data] = useState<TransactionTableData>(props.data);
    const [hashSize, setHashSize] = useState<number>(24);
    const [addrSize, setAddrSize] = useState<number>(10);
    const [visibleBadge, setVisibleBadge] = useState<boolean>(false);
    const [txTime, setTxTime] = useState<string>('');


    const generateBadgeContent = () => {
        if (Object.getOwnPropertyNames(data.transaction.outputs[0].value)[0] == 'Receipt')
            return <div className={styles.receipt}><BiReceipt /></div>

        else if (Object.getOwnPropertyNames(data.transaction.outputs[0].value)[0] == 'Token')
            return <div className={styles.rewardBadge}>{formatAmount(data.transaction, false)} <span className={styles.tokenName}>{' Zn'}</span></div>
    }

    useEffect(() => {// Set initial
        if (window.innerWidth >= 510) {
            setHashSize(24);
            setAddrSize(10);
            setVisibleBadge(true);
        } else {
            setHashSize(14);
            setAddrSize(5);
            setVisibleBadge(false);
        }
        setTxTime(getEllapsedTime(store.calculateBlockTime(data.bNum)))
    }), [];

    useEffect(() => {
        function handleResize() {
            if (window.innerWidth >= 510) {
                setHashSize(24);
                setAddrSize(10);
                setVisibleBadge(true);
            } else {
                setHashSize(14);
                setAddrSize(5);
                setVisibleBadge(false);
            }
        }

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    });

    return useObserver(() => {
        if (data) {
            return (<div className={styles.item}>
                <div className={styles.content}>
                    <div className={styles.itemHeader}>
                        <span className={styles.txNum}><a href={`${store.network.name}/tx/${data.hash}?bnum=${data.bNum}`}>{formatAddressForDisplay(data.hash, addrSize)}</a></span>
                        <span className={styles.timestamp}>{txTime}</span>
                    </div>

                    <div className={`${styles.hashs} ${visibleBadge ? styles.biggerHashes : ''}`}>
                        <div className={styles.left}>
                            {data.transaction.inputs.length === 1 && data.transaction.inputs[0].previousOut != null ? <span className={styles.hash}>{'From '}<a>{formatAddressForDisplay(data.transaction.inputs[0].previousOut.tHash, hashSize)}</a></span> : ''}
                            {data.transaction.inputs.length > 1 ? <span className={styles.hash}><a href={`${store.network.name}/tx/${data.hash}#inputs`}>{'Inputs ('}{data.transaction.inputs.length}{')'}</a></span> : ''}
                            {data.transaction.outputs.length === 1 ? <span className={styles.hash}>{'To '}<a>{formatAddressForDisplay(data.transaction.outputs[0].scriptPubKey, hashSize)}</a></span> : ''}
                            {data.transaction.outputs.length > 1 ? <span className={styles.hash}><a href={`${store.network.name}/tx/${data.hash}#outputs`}>{'Outputs ('}{data.transaction.outputs.length}{')'}</a></span> : ''}
                        </div>
                    </div>
                    {visibleBadge &&
                        <div className={styles.rewardContainer}>
                            
                                {generateBadgeContent()}
                            
                        </div>
                    }
                </div>
                <hr className={styles.separator} />
            </div>
            )
        }
    }) as JSX.Element;
}