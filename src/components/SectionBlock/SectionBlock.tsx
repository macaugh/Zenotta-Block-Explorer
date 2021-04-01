import React, { useState } from 'react';
import { hot } from 'react-hot-loader/root';

import * as styles from './SectionBlock.scss';

function SectionBlock() {
    const [status, setStatus] = useState("");

    return (
        <div className={styles.sectionBlockContainer}>
            <header>
                <h5>Sizzling Sally</h5>
                <div className={`${styles.status} ${status}`}></div>
            </header>
            
            <ul>
                <li>
                    <p>last miners</p>
                    <b>53</b>
                </li>
                <li>
                    <p>last winning pow</p>
                    <b>23098</b>
                </li>
                <li>
                    <p>last reward</p>
                    <b>23.5 ZNT</b>
                </li>
                <li>
                    <p>current block no.</p>
                    <b>639</b>
                </li>
            </ul>
        </div>
    );
}

export default hot(SectionBlock);