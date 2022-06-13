import React from 'react'
import styles from './CsvBtn.scss';
import dlicon from "../../static/img/dlicon.svg";

export const CsvBtn = (props: any) => {
    return (
        <div className={styles.dlContainer}>
            <p className={styles.dlBtn} onClick={() => { props.action()}}>
                [ Download <span className={styles.csvExport}>CSV Export<img className={styles.dlicon} src={dlicon} /></span>]
            </p>
        </div>
    )
}