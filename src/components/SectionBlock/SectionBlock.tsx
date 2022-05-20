import React, { useState } from 'react';
import * as styles from './SectionBlock.scss';

export const SectionBlock = () => {
    const [status, setStatus] = useState("");

    return (
        <div className={styles.sectionBlockContainer}>
            <header>
                <h5></h5>
                <div className={`${styles.status} ${status}`}></div>
            </header>
            
            <ul>
                <li>
                    <p>last miners</p>
                    <b></b>
                </li>
                <li>
                    <p>last winning pow</p>
                    <b></b>
                </li>
                <li>
                    <p>last reward</p>
                    <b>ZENO</b>
                </li>
                <li>
                    <p>current block no.</p>
                    <b></b>
                </li>
            </ul>
        </div>
    );
}