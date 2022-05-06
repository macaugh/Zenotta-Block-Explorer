import * as React from 'react';
import styles from './TransactionView.scss';
import { RowTable } from '../RowTable/RowTable';
import { TransactionInfo, TransactionInfoProps } from '../TransactionInfo/TransactionInfo';

interface TransactionViewProps {
    summaryData: TransactionInfoProps,
    detailData: any
}

export const TransactionView = (props: TransactionViewProps) => {
    
    const formatDataForTable = (localData: any) => {
        if (!localData) { return null }
        
        return Object.keys(localData).map(key => {
            return {
                heading: key,
                value: localData[key]
            };
        });
    }

    return (
        <div className={styles.txContainer}>
            {props.summaryData !== null && props.summaryData !== undefined && <TransactionInfo {...props.summaryData} />}

            {props.detailData && props.detailData.inputs && props.detailData.inputs.length > 0 && 
            <>            
                <h2>Inputs</h2>
                {props.detailData.inputs.map((input: any, i: number) => {
                    return <div className={styles.row}><RowTable key={i} rows={formatDataForTable(input)} /></div>;
                })}
            </>}

            <h2>Outputs</h2>
            {props.detailData && props.detailData.outputs.map((output: any, i: number) => {
                return <div className={styles.row}><RowTable key={i} rows={formatDataForTable(output)} /></div>;
            })}
        </div>
    );
}