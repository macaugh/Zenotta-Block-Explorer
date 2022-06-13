import * as React from 'react';
import { useEffect, useState } from 'react';
import { Button } from 'chi-ui';
import { RequestData } from '../../interfaces';
import { useObserver } from 'mobx-react';
import styles from './ItemList.scss';
import { StoreContext } from '../..';
import { BlockItem } from './BlockItem/BlockItem';

export enum DataType {
    Block,
    Transaction
}

interface ItemListProps {
    title: string,
    data: any,
    dataType: DataType,
    className?: string,
}

export const ItemList = (props: ItemListProps) => {
    const store = React.useContext(StoreContext);

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

                        {/* {props.dataType == DataType.Transaction && props.data.map((obj: any) => {
                            return (
                                <>
                                </>)
                        })} */}
                    </>}
                {props.data === [] &&
                    <div className={styles.loading}>{'Loading'}</div>
                }

            </div>
            <div className={styles.footer}>
                <Button onClick={() => { window.location.href = props.dataType == DataType.Block ? '/blocks' : '/transactions' }} className={styles.allBtn}>{'View all '}{props.dataType == DataType.Block ? 'Blocks' : 'Transactions'}</Button>
                <span></span>
            </div>
        </div>
    )) as any;
}