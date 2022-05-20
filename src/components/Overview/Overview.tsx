import * as React from 'react';
import {useEffect, useState} from 'react';
import {useObserver} from 'mobx-react';
import { toJS } from 'mobx';
import {StoreContext} from '../../index';

import {Pagination, Table} from 'chi-ui';
import { RequestData } from '../../interfaces';
import {SectionBlock} from "../SectionBlock/SectionBlock";
import styles from './Overview.scss';

export const Overview = () => {
    const store = React.useContext(StoreContext);

    useEffect(() => {
    }, []);


    return useObserver(() => (
        <div className={styles.container}>
            <div className={styles.mainContent}>
            </div>
        </div>
    )) as any;
}