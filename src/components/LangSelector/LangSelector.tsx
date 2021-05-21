import React, { useState } from 'react';
import { i18n, langs } from '../../i18n';

import * as styles from './LangSelector.scss';
import arrowIcon from '../../static/img/triangle.svg';

// Flags
import frFlag from '../../static/img/fr-flag.svg';
import ukFlag from '../../static/img/uk-flag.svg';
import itFlag from '../../static/img/it-flag.svg';
import plFlag from '../../static/img/pl-flag.svg';
import zhFlag from '../../static/img/zh-flag.svg';
import ruFlag from '../../static/img/ru-flag.svg';
import deFlag from '../../static/img/de-flag.svg';
import esFlag from '../../static/img/es-flag.svg';
import jpFlag from '../../static/img/jp-flag.svg';

export const LangSelector = () => {
    const localLangSet = localStorage.getItem('I18N_LANGUAGE') || "en";
    const [dropdownClass, setLanguageDropdown] = useState("");
    const [currentLanguage, setCurrentLanguage] = useState(langs[localLangSet]);
    const flags: any = {
        "en": ukFlag,
        "fr": frFlag,
        "zhs": zhFlag,
        "po": plFlag,
        "ru": ruFlag,
        "it": itFlag,
        "de": deFlag,
        "es": esFlag,
        "jp": jpFlag
    };

    const hiddenLangs = [
        "es", "jp", "po", "ru"
    ];

    const changeLanguage = (language: string) => {
        localStorage.setItem('I18N_LANGUAGE', language);
        setCurrentLanguage(langs[language]);
        setLanguageDropdown("");
        i18n.changeLanguage(language);
    }

    const toggleLanguageDropdown = () => {
        let newClass = dropdownClass == "" ? styles.visible : "";
        setLanguageDropdown(newClass);
    }


    return (
        <div className={styles.langContainer} onClick={() => toggleLanguageDropdown()}>
            <span className={styles.flagMain}>
                <img src={flags[localLangSet]} />
            </span>
            {currentLanguage}
            <span className={styles.dropdownArrow}>
                <img className={dropdownClass} src={arrowIcon} />
            </span>
            <ul className={`${styles.langSelection} ${dropdownClass}`}>
                {Object.keys(langs).map((entry: string) => {
                    if (hiddenLangs.indexOf(entry) == -1) {
                        return (
                            <li key={entry} onClick={() => changeLanguage(entry)}>
                                <span className={styles.flagMain}>
                                    <img src={flags[entry]} alt={`${entry} flag`} />
                                </span>
                                {langs[entry]}
                            </li>
                        );
                    }
                })}
            </ul>
        </div>
    );
}