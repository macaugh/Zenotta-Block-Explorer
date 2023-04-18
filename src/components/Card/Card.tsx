import * as React from 'react';
import styles from './Card.scss';
import { Pill } from 'components/Pill/Pill';

interface CardRow {
    heading: string,
    value: any,
}

interface RowTableProps {
    rows: CardRow[] | null,
    className?: string
}

export const Card = (props: RowTableProps) => {
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

    console.log(props.rows)
    return (
        <table className={`${styles.container} ${props.className}`}>
            <tbody>
                {props.rows && props.rows.length > 0 && props.rows.map((row: CardRow, i: number) => {
                    return (
                        <tr key={i}>
                            <td>{format(row.heading)}</td>
                            <td>
                                {row.heading === 'timestamp' ? <>{row.value} <Pill variant>approximation</Pill></> : row.value}
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );
}