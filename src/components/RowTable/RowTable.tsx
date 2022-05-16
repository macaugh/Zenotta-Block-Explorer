import * as React from 'react';
import styles from './RowTable.scss';

interface RowTableRow {
    heading: string,
    value: string
}

interface RowTableProps {
    rows: RowTableRow[] | null
}

export const RowTable = (props: RowTableProps) => {
    const format = (val: string) => {
        // Get first letter as capital
        let valFirst = val.charAt(0).toUpperCase();
        val = val.slice(1);
        val = valFirst + val;

        let split = val.match(/[A-Z][a-z]+/g);

        if (split && split.length) {
            let first = split[0].charAt(0).toUpperCase();
            let concat = split[0].slice(1);
            split[0] = first + concat;

            return split.join(' ');
        }

        return val;
    }

    return (
        <table className={styles.container}>
            <tbody>
                {props.rows && props.rows.length > 0 && props.rows.map((row: RowTableRow, i: number) => {
                    return (
                        <tr key={i}>
                            <td>{format(row.heading)}</td>
                            <td>
                                {row.value}
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}