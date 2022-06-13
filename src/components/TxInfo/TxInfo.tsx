import * as React from 'react';
import styles from './TxInfo.scss';
import arrowIcon from '../../static/img/left-arrow.svg';

export interface TransactionInfoProps {
  hash: string;
  txInHashes: string[];
  totalTokens: number[];
  outputs: TxOutPuts[];
  txView?: boolean; // Removes link reference when on TxView
}

interface TxOutPuts {
  publicKey: string;
  lockTime: number;
  tokens: number;
}

export const TxInfo = (props: any) => {
  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <ul>
          <li>
            <div className={styles.row}>
              <p>Hash</p>
              {props.txView &&
                <p>{props.hash}</p>
              }{!props.txView &&
                <p><a href={`/tx/${props.hash}`}>{props.hash}</a></p>
              }
            </div>
          </li>
          {props.totalTokens.length > 0 && (
            <li>
              <div className={styles.row}>
                <p>Total Fractionated Tokens</p>
                <p className={styles.tokenTotal}>
                  <b>{props.totalTokens}</b>
                </p>
              </div>
            </li>
          )}
          <li>
            <div className={styles.row}>
              <p>Input Transaction(s)</p>

              {props.txInHashes && props.txInHashes.length > 0 && (
                <ul className={styles.ins}>
                  {props.txInHashes.map((h: string) => {
                    return (
                      <li key={h}>
                        <a href={`/tx/${h}`}>{h}</a>
                      </li>
                    );
                  })}
                </ul>
              )}

              {!props.txInHashes || (props.txInHashes.length === 0 && <p>N/A</p>)}
            </div>
          </li>
        </ul>
      </div>

      <img src={arrowIcon} className={styles.arrowIcon} />

      <div className={styles.right}>
        <ul>
          {props.outputs.map((o: any, i: number) => {
            return (
              <li key={i}>
                <div className={styles.row}>
                  <p>Address</p>
                  <p className={styles.addr}>{o.publicKey}</p>
                </div>
                {o.tokens > 0 && (
                  <>
                    <div className={styles.row}>
                      <p>Tokens</p>
                      <p>
                        <b>{(o.tokens / 25200).toFixed(2)}</b> ZENO
                      </p>
                    </div>
                    <div className={styles.row}>
                      <p>Fractionated Tokens</p>
                      <p>
                        <b>{o.tokens}</b>
                      </p>
                    </div>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
