import React from 'react';
import { hot } from 'react-hot-loader/root';

import * as styles from './Table.scss';

function Table() {
    return (
        <table className={styles.blockTable}>
            <thead>
                <tr>
                    <th>Block Number</th>
                    <th>Participating Compute Nodes</th>
                    <th>Participating Mining Nodes</th>
                    <th>Timeout At</th>
                    <th>Transactions</th>
                    <th>Combined Reward</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>546</td>
                    <td>8</td>
                    <td>40613</td>
                    <td>2021/03/04 21:44:51</td>
                    <td>1092</td>
                    <td>223</td>
                </tr>
                <tr>
                    <td>546</td>
                    <td>8</td>
                    <td>40613</td>
                    <td>2021/03/04 21:44:51</td>
                    <td>1092</td>
                    <td>223</td>
                </tr>
                <tr>
                    <td>546</td>
                    <td>8</td>
                    <td>40613</td>
                    <td>2021/03/04 21:44:51</td>
                    <td>1092</td>
                    <td>223</td>
                </tr>
                <tr>
                    <td>546</td>
                    <td>8</td>
                    <td>40613</td>
                    <td>2021/03/04 21:44:51</td>
                    <td>1092</td>
                    <td>223</td>
                </tr>
            </tbody>
        </table>
    )
}

export default hot(Table);