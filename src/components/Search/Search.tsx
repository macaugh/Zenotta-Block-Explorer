import * as React from 'react';
import { useObserver } from 'mobx-react';
import { TextInput, Notification } from 'chi-ui';
import { StoreContext } from '../../index';

import * as styles from "./Search.scss";
import { Dropdown } from '../Dropdown/Dropdown';

interface NavProps {
    nav?: boolean
}

export default function Search(props: NavProps) {
    const [searchOptions, _setSearchOptions] = React.useState<any[]>([
        "Transaction Hash",
        "Block Hash",
        "Block Number",
    ]);
    const [currentSearchOption, setCurrentSearchOption] = React.useState<string>("Transaction");
    const [searchValue, setSearchValue] = React.useState<string>("");
    const [searchError, setSearchError] = React.useState<string>("");
    const store = React.useContext(StoreContext);

    const submitSearchValue = async () => {
        if (currentSearchOption != "Block Number") {
            const validity = await store.searchHashIsValid(searchValue, currentSearchOption);

            if (validity.isValid) {
                window.location.href = `/${searchValue}`;
            } else {
                setSearchError(validity.error);
            }

        } else {
            handleBlockNumSearch(searchValue);
        }
    }

    const handleSearchOptionSelect = (item: string) => {
        setSearchValue('');
        setSearchError('');
        setCurrentSearchOption(item);
    }

    const handleSearchInput = (value: string) => {
        setSearchError('');
        setSearchValue(value);
    }

    const handleBlockNumSearch = async (blockNum: string) => {
        const validity = await store.blockNumIsValid(parseInt(blockNum));

        if (validity.isValid) {
            store.fetchBlockHashByNum(parseInt(searchValue)).then((hash: string) => {
                if (hash) {
                    window.location.href = `/${hash}`;
                }
            });
        } else {
            setSearchError(validity.error);
        }
    }

    return useObserver(() => (
        <>
            {!props.nav &&
                <div className={styles.searchContainer}>
                    <div className={styles.innerContainer}>
                        <Dropdown
                            onItemClick={(item: any) => handleSearchOptionSelect(item)}
                            listItems={searchOptions} />

                        <TextInput
                            type="search"
                            label="Search here..."
                            iconType="text"
                            className={styles.search}
                            shouldSubmitOnEnter={true}
                            onChange={(e: any) => handleSearchInput(e.target.value)}
                            onSubmit={() => submitSearchValue()} />
                    </div>
                </div>
            }
            {props.nav &&
                <div className={styles.navSearchContainer}>
                    <div className={styles.innerContainer}>
                        <Dropdown
                            onItemClick={(item: any) => handleSearchOptionSelect(item)}
                            listItems={searchOptions} 
                            nav={true} />

                        <TextInput
                            type="search"
                            label="Search here..."
                            iconType="text"
                            className={styles.search}
                            shouldSubmitOnEnter={true}
                            onChange={(e: any) => handleSearchInput(e.target.value)}
                            onSubmit={() => submitSearchValue()} />
                    </div>
                </div>
            }
            {searchError.length > 0 &&
                <Notification
                    type="error"
                    variant="outlined"
                    closable
                    className={styles.notification}>
                    {searchError}
                </Notification>}
        </>
    ));
}
