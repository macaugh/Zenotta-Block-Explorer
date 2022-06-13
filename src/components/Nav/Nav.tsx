import * as React from 'react';
import { useObserver } from 'mobx-react';
import { TextInput, Notification } from 'chi-ui';
import { useLocation } from "react-router-dom";

import * as styles from "./Nav.scss";
import logo from "../../static/img/zenotta-logo.svg";
import Search from '../Search/Search';

export default function App() {
    const { pathname: path } = useLocation();

    const isHomePage = (): boolean => {
        if (path == '/')
            return true
        else
            return false
    }

    return useObserver(() => (
        <nav className={`${styles.nav} ${!isHomePage() ? styles.navCompact : ''}`}>

            <div className={styles.leftContainer}>
                <a href="/" className={`${styles.logo}`}><img src={logo} alt="Zenotta logo" /></a>
                <div className={styles.navLinks}>
                    <a href='/'>Home</a>
                    <a href='/blocks'>Blocks</a>
                    <a href='/txs'>Transactions</a>
                </div>
            </div>

            {!isHomePage() &&
                <Search nav={true} />
            }
        </nav>
    ));
}
