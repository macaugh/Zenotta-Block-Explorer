import * as React from 'react';
import { useEffect, useState } from 'react';
import { useObserver } from 'mobx-react';
import styles from './TransactionItem.scss';
import { TransactionTableData } from '../../../interfaces';
import { formatAddressForDisplay, formatAmount } from '../../../formatData';

export const TransactionItem = (props: any) => {
    const [txTableData] = useState<TransactionTableData>(props.data);

    return useObserver(() => {
        if (txTableData) {
            return (<div className={styles.item}>
                <div className={styles.content}>
                    <div className={styles.itemHeader}>
                        <span className={styles.txNum}><a href={`/tx/${txTableData.hash}?bnum=${txTableData.blockNum}`}>{formatAddressForDisplay(txTableData.hash, 10)}</a></span>
                        <span className={styles.timestamp}>{'tx time'}</span>
                    </div>

                    <div className={styles.hashs}>
                        <div className={styles.left}>
                            {txTableData.transaction.inputs.length === 1 && txTableData.transaction.inputs[0].previous_out ? <span className={styles.hash}>{'From '}<a>{txTableData.transaction.inputs[0].previous_out.t_hash}</a></span> : ''}
                            {txTableData.transaction.inputs.length > 1 ? <span className={styles.hash}><a href={`/tx/#inputs`}>{'Inputs ('}{txTableData.transaction.inputs.length}{')'}</a></span> : ''}
                            {txTableData.transaction.outputs.length === 1 ? <span className={styles.hash}>{'To '}<a>{formatAddressForDisplay(txTableData.transaction.outputs[0].script_public_key, 24)}</a></span> : ''}
                            {txTableData.transaction.outputs.length > 1 ? <span className={styles.hash}><a href={`/tx/#outputs`}>{'Ouputs ('}{txTableData.transaction.outputs.length}{')'}</a></span> : ''}
                        </div>
                    </div>
                    <div className={styles.rewardContainer}>
                        <div className={styles.rewardBadge}>
                            {formatAmount(txTableData.transaction) }<span className={styles.tokenName}>{' Zn'}</span>
                        </div>
                    </div>
                </div>
                <hr className={styles.separator} />
            </div>
            )
        } else {
            return <></>
        }
    }) as any;
}