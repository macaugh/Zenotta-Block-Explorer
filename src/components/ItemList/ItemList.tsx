import * as React from 'react';
import { useEffect, useState } from 'react';
import { Button } from 'chi-ui';
import { RequestData } from '../../interfaces';
import { useObserver } from 'mobx-react';
import styles from './ItemList.scss';
import { StoreContext } from '../..';
import { BlockItem } from './BlockItem/BlockItem';
import { TransactionItem } from './TransactionItem/TransactionItem';
import { Loading } from 'chi-ui';
import { toJS } from 'mobx';

export enum DataType {
    Block,
    Transaction
}

interface ItemListProps {
    title: string,
    data: any[],
    dataType: DataType,
    className?: string,
}

export const ItemList = (props: ItemListProps) => {
    const [loadTimeout, setLoadtimeout] = useState(false);

    useEffect(() => {
        let timeoutId: any = null;
        if (props.data.length === 0) {
            timeoutId = setTimeout(() => {
                setLoadtimeout(true)
            }, 10000);
        } 

        return () => {
            clearTimeout(timeoutId);
        }
    }, [props.data])

    return useObserver(() => (
        <div className={`${styles.container} ${props.className ? props.className : ''}`}>
            <div className={styles.header}>
                <h2>{props.title}</h2>
            </div>
            <div className={styles.content}>
                {props.data != [] &&
                    <>
                        {props.dataType == DataType.Block && props.data.map((obj: RequestData, index: number) => {
                            return (<BlockItem data={obj} key={index} />)
                        })}

                        {props.dataType == DataType.Transaction && props.data.map((txs: any, index: number) => {
                            return <TransactionItem data={txs} key={index} />
                        })}
                    </>}

                {!loadTimeout && props.data.length < 1 &&
                    <>
                        <Loading className={styles.loading} colour={'#999'} />
                    </>
                }
                {loadTimeout && props.data.length < 1 &&
                    <div className={styles.failed}>
                        <p>Failed to load</p>
                        <a href='/'>Try again</a>
                    </div>
                }

            </div>
            <div className={styles.footer}>
                <Button onClick={() => { window.location.href = props.dataType == DataType.Block ? '/blocks' : '/txs' }} className={styles.allBtn}>{'View all '}{props.dataType == DataType.Block ? 'Blocks' : 'Transactions'}</Button>
                <span></span>
            </div>
        </div>
    )) as any;
}