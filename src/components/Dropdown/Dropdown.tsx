import React, { FunctionComponent, useEffect, useState } from 'react';
import { Button } from 'chi-ui';
import styles from './Dropdown.scss';
import OutsideAlerter from './OutsideAlerter';

export interface DropdownProps {
    listItems: string[],
    onItemClick?: Function,
    nav?: boolean,
}

export const Dropdown: FunctionComponent<DropdownProps> = (props) => {
    const [selected, setSelected] = useState(props.listItems[0]);
    const [dropdownClass, setDropdownClass] = useState('');

    const onSelect = (selection: any) => {
        localStorage.setItem('DROPDOWN_SELECT', selection);
        setSelected(selection);
        setDropdownClass('');

        if (props.onItemClick) {
            props.onItemClick(selection);
        }
    }

    const toggleDropdown = () => {
        setDropdownClass(dropdownClass == '' ? styles.visible : '');
    }

    useEffect(() => {
        const localVal = localStorage.getItem('DROPDOWN_SELECT');
        if (localVal) {
            setSelected(localVal);
        }
    }, []);

    return (
        <div className={`${styles.container} `} data-testid="dropdown">
            <OutsideAlerter action={setDropdownClass}>
                <Button textColour="#000" mainColour="#cecece" onClick={() => toggleDropdown()} className={`${styles.button} ${props.nav ? styles.buttonCompact : ''}`}>
                    <span>{selected}</span>
                    <svg className={`${styles.dropdownArrow} ${dropdownClass}`} viewBox="0 0 512 512">
                        <path fill="#000" d="M507.521,427.394L282.655,52.617c-12.074-20.122-41.237-20.122-53.311,0L4.479,427.394
                        c-12.433,20.72,2.493,47.08,26.655,47.08h449.732C505.029,474.474,519.955,448.114,507.521,427.394z"/>
                    </svg>
                </Button>
                <ul className={`${styles.menu} ${dropdownClass}`}>
                    {props.listItems.map((item, i) => {
                        return <li key={i} onClick={() => onSelect(item)}>{item}</li>;
                    })}
                </ul>
            </OutsideAlerter>
        </div>
    );
}