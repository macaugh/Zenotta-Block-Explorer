import * as React from 'react';
import styles from './TxInfo.scss';
import arrowIcon from '../../static/img/left-arrow.svg';
import { StoreContext } from '../../index';


export interface TransactionInfoProps {
  hash: string;
  bNum?: number;
  txInHashes: string[];
  totalTokens: number;
  outputs: TxOutPuts[];
  txView?: boolean; // Removes link reference when on TxView
}

interface TxOutPuts {
  publicKey: string;
  lockTime: number;
  tokens: number;
}




export const TxInfo = (props: TransactionInfoProps) => {

  const [blockUrl, setBlockUrl] = React.useState<string>('');

  const store = React.useContext(StoreContext);

  const getBlockHashFromNum = async (blockNum: string) => {
    const validity = await store.blockNumIsValid(parseInt(blockNum));
    if (validity.isValid) {
      return store.fetchBlockHashByNum(parseInt(blockNum)).then((hash: string) => {
        if (hash) {
          return hash;
        }
      });
    } else {
      console.log(validity.error);
    }
  }

  React.useEffect(() => {
    if (props.bNum) {
      getBlockHashFromNum(props.bNum.toString()).then((hash: any) => {
        if (hash) {
          setBlockUrl(`/block/${hash}`);
        }
      });
    }
  }, []);

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
          {props.bNum && (
            <li>
              <div className={styles.row}>
                <p>Block Number</p>
                <p><a style={{ cursor: "pointer" }} href={blockUrl}>{props.bNum}</a></p>
                {/* <p>{props.bNum}</p> */}
              </div>
            </li>
          )}
          {props.totalTokens && (
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
          {props.outputs.map((o: TxOutPuts, i: number) => {
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
