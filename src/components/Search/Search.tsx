import * as React from "react";
import { useObserver } from "mobx-react";
import { Notification } from "chi-ui";
import { StoreContext } from "../../index";
import SearchIcon from "static/img/search-white.svg";

import * as styles from "./Search.scss";
import {
  Button,
  Dropdown,
  DropdownButton,
  Form,
  InputGroup,
} from "react-bootstrap";

interface NavProps {
  nav?: boolean;
}

export default function Search(props: NavProps) {
  const [searchOptions, _setSearchOptions] = React.useState<string[]>([
    "Block Hash",
    "Block Number",
    "Tx Hash",
  ]);
  const localStorageValue = localStorage.getItem("DROPDOWN_SELECT");
  const [currentSearchOption, setCurrentSearchOption] = React.useState<string>(
    localStorageValue ? localStorageValue : searchOptions[0]
  );
  const [searchValue, setSearchValue] = React.useState<string>("");
  const [searchError, setSearchError] = React.useState<string>("");
  const [submit, setSubmit] = React.useState<boolean>(false);
  const store = React.useContext(StoreContext);

  const submitSearchValue = async (value: string) => {
    if (currentSearchOption != "Block Number") {
      const validity = await store.searchHashIsValid(
        value,
        currentSearchOption
      );
      if (validity.isValid) {
        if (currentSearchOption === "Tx Hash")
        window.location.href = `/tx/${value}`;
        else if (currentSearchOption === "Block Hash")
        window.location.href = `/block/${value}`;
      } else {
        setSearchError(validity.error);
      }
    } else {
      handleBlockNumSearch(value);
    }
  };

  const handleSearchOptionSelect = (item: string) => {
    setSearchValue("");
    setSearchError("");
    setCurrentSearchOption(item);
  };

  const handleSearchInput = (value: string) => {
    setSearchError("");
    setSearchValue(value);
    defineSearchOption(value);
  };

  const defineSearchOption = (input: string) => {
    switch (input.charAt(0)) {
      case "b":
        setCurrentSearchOption("Block Hash");
        break;
      case "g":
        setCurrentSearchOption("Tx Hash");
        break;
      case "0":
        if (input.match(/^0\d{5}$/)) {
          setCurrentSearchOption("Tx Hash");
        } else {
          setCurrentSearchOption("Block Hash");
        }
        break;
      default:
        setCurrentSearchOption("Block Number");
        break;
    }
  }


  const handleBlockNumSearch = async (blockNum: string) => {
    const validity = await store.blockNumIsValid(parseInt(blockNum));
    if (validity.isValid) {
      store.fetchBlockHashByNum(parseInt(searchValue)).then((hash: string) => {
        if (hash) {
          window.location.href = `/block/${hash}`;
        }
      });
    } else {
      setSearchError(validity.error);
    }
  };

  React.useEffect(() => { // Add event listener for enter key
    var searchInput = document.getElementById("searchInput") as HTMLInputElement;
    if (searchInput) {
      searchInput.addEventListener("keydown", function (e) {
        if (e.code === "Enter") {  //checks whether the pressed key is "Enter"
          setSubmit(true);
        }
      });
    }
  }, []);

  React.useEffect(() => { // Sync states with submit 
    if (submit) {
      submitSearchValue(searchValue);
      setSubmit(false);
    }
  }, [submit]);

  return useObserver(() => (
    <>
      {searchError.length > 0 && (
        <Notification
          type="error"
          variant="outlined"
          closable
          className={styles.notification}
        >
          {searchError}
        </Notification>
      )}

      <div
        className={`${styles.searchContainer} ${props.nav ? styles.navSearchContainer : ""
          }`}
      >
        <InputGroup className={`${styles.inputGroup}`}>
          <DropdownButton
            variant="outline-secondary"
            title={currentSearchOption}
            id="input-group-dropdown-1"
          >
            {searchOptions.map((item: string, index: number) => {
              if (item !== currentSearchOption)
                return (
                  <Dropdown.Item
                    key={index}
                    onClick={() => handleSearchOptionSelect(item)}
                  >
                    {item}
                  </Dropdown.Item>
                );
            })}
          </DropdownButton>
          <Form.Control
            id="searchInput"
            aria-label="Search"
            value={searchValue}
            onChange={(e: any) => handleSearchInput(e.target.value)}
            onSubmit={() => setSubmit(true)}
          />
          <Button
            style={{ background: "#4cc9f0", border: 0 }}
            variant="outline-secondary"
            onClick={() => setSubmit(true)}
            title="Search"
          >
            <img className={styles.searchIcon} src={SearchIcon} alt="search" />
          </Button>
        </InputGroup>
      </div>
    </>
  ));
}
