import React from 'react';
import { hot } from 'react-hot-loader/root';
import { useTranslation } from 'react-i18next';

import searchIcon from '../../static/img/search.svg';
import * as styles from './Search.scss';
import Loading from '../Loading/Loading';

interface SearchProps {
    id: string,
    ariaLabel?: string,
    onChange?: Function,
    onClick?: Function,
    onEnterKey?: Function,
    value?: string,
    placeholder?: string,
}

const Search = (props: SearchProps) => {
    let { t } = useTranslation();
    const placeholder = props.placeholder || "Search";
    let onChangeFunc = props.onChange ? props.onChange : () => {};
    let onClickFunc = props.onClick ? props.onClick : () => {};

    const onKeyDown = (key: string) => {
        if (key == "Enter" && props.onEnterKey) {
            props.onEnterKey();
        }
    }

    return (
        <div className={styles.searchContainer}>
           <input 
                type="text"
                id={props.id}
                name={props.id}
                className={styles.inputBox}
                aria-label={props.ariaLabel ? props.ariaLabel : t("Search")}
                onChange={e => onChangeFunc(e.target.value)}
                onClick={() => onClickFunc()}
                onKeyDown={e => onKeyDown(e.key)}
                value={props.value}
                placeholder={`${t(placeholder)}...`}
                />
            
            <span className={styles.searchIcon}>
                <img src={searchIcon} alt="Search Icon" />
            </span>
        </div>
    );
}

export default hot(Search);