import React from 'react';
import * as styles from "./App.scss";
import logo from "../../static/img/zenotta-logo.svg";

import LangSelector from "../LangSelector/LangSelector";
import SectionBlock from "../SectionBlock/SectionBlock";
import Search from "../Search/Search";


export default function App() {
  return (
    <div className={styles.container}>
      <div className={styles.langSelect}>
        <LangSelector />
      </div>

      <img src={logo} className={styles.logo} alt="Zenotta logo" />
      
      <div className={styles.searchContainer}>
        <Search 
          placeholder="Search for transactions, blocks and addresses"
          id="search" />
      </div>

      <div className={styles.mainContent}>
        <section className={styles.computeNodesContainer}>
          <h4>compute nodes</h4>

          <ul>
            <li><SectionBlock /></li>
            <li><SectionBlock /></li>
            <li><SectionBlock /></li>
          </ul>
        </section>

        <section className={styles.blockTable}>
          <h4>latest blocks</h4>

          <table>
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

            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
