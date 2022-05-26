import * as React from 'react';
import { useObserver } from 'mobx-react';
import { useParams } from 'react-router-dom';
import { StoreContext } from '../../index';
import { RowTable, RowTableRow } from '../RowTable/RowTable';
import { TransactionView } from '../TransactionView/TransactionView';
import { TransactionInfo, TransactionInfoProps } from '../TransactionInfo/TransactionInfo';
import { downloadFile } from '../CsvExport/CsvExport';
import dlicon from '../../static/img/dlicon.svg';
import { Block, MiningTx, MiningTxHashAndNoce, ReceiptOutput, TokenOutput, Transaction, TransactionInputs, TransactionOutputs } from '../../interfaces';
import { formatToBlockInfo } from '../../formatData';
import { toJS } from 'mobx';

import styles from './BCItemView.scss';
import { BlockInfo } from '../../interfaces';
import { Button } from 'chi-ui';

export const BCItemView = () => {
  let { hash } = useParams<any>();
  const store = React.useContext(StoreContext);
  const [transactions, setTransactions] = React.useState<any>(null);
  const [miningTx, setMiningTx] = React.useState<any>(null);
  const [localData, setLocalData] = React.useState<any>(null);
  const [coinbaseHash, setCoinbaseHash] = React.useState<string>('');
  const [mainTxData, setMainTxData] = React.useState<any>(null);
  const [heading, setHeading] = React.useState<string>('');

  const getTxPromises = (transactions: string[]): Promise<any>[] => {
    return transactions.map((tx) => store.fetchBlockchainItem(tx));
  };

  const checkSeenTxIns = (t: TransactionInputs, seenIns: string[]) => {
    if (t.previous_out && t.previous_out.t_hash) {
      let t_hash = t.previous_out.t_hash;

      if (seenIns.indexOf(t_hash) == -1) {
        seenIns.push(t_hash);
        return true;
      }
      return false;
    }
    return false;
  };

  const toHexString = (byteArray: number[]) => {
    return Array.from(byteArray, (byte) => {
      return ('0' + (byte & 0xff).toString(16)).slice(-2);
    }).join('');
  };

  const formatScript = (stack: any[]) => {
    let combo = [];
    for (let entry of stack) {
      let key: any = Object.keys(entry)[0];
      let val = (entry as any)[key];

      // console.log(toJS(val))

      combo.push(val instanceof Array ? toHexString(val) : val);
    }
    return combo.join('\n');
  };

  const formatTransactionInputs = (inputs: TransactionInputs[]) => {
    return inputs.map((input) => {
      const previousOutputHash = input.previous_out && input.previous_out.t_hash ? input.previous_out.t_hash : 'N/A';
      return {
        previousOutputHash,
        scriptSig: formatScript(input.script_signature.stack),
      };
    });
  };

  const formatTransactionOutputs = (outputs: TransactionOutputs[]) => {
    console.log('1')
    return outputs.map((output) => {
      if (isToken(output.value)) {
        const token = output.value as TokenOutput;
        return {
          address: output.script_public_key,
          tokens: `${(token.Token / 25200).toFixed(2)} ZENO`,
          fractionatedTokens: `${token}`,
          lockTime: output.locktime,
        };
      } else {
        const obj = output.value as any;
        console.log(obj.Receipt)
        return {
          address: output.script_public_key,
          receipts: obj.Receipt,
          lockTime: output.locktime,
        };
      }
    });
  };

  const getTransactionInfo = (tx: any, hashes: string[], index: number) => {
    let seenIns: string[] = [];
    console.log('DEBUG: ', tx, hashes, index);
    return {
      hash: hashes[index],
      totalTokens: tx.outputs.reduce((acc: number, o: any) => acc + o.value.Token, 0),
      txInHashes: tx.inputs.filter((t: any) => checkSeenTxIns(t, seenIns)).map((i: any) => i.previous_out.t_hash),
      outputs: tx.outputs.map((o: any) => {
        return {
          publicKey: o.script_public_key,
          lockTime: o.locktime,
          tokens: o.value.Token,
        };
      }),
    };
  };

  const formatTransactions = (transactions: Transaction[], hashes: string[]) => {
    if (!transactions || !transactions.length) {
      return [];
    }

    if (transactions.length == 1) {
      console.log(transactions);
      let tx = transactions[0];
      return getTransactionInfo(tx, hashes, 0);
    }

    return transactions.map((tx, i) => {
      console.log(tx, i);
      return getTransactionInfo(tx, hashes, i);
    });
  };

  const fetchTransactions = async (txs: string[]) => {
    let tInfo = await Promise.all(getTxPromises(txs)).then((results) => formatTransactions(results, txs));
    setTransactions(tInfo);
  };

  const formatDataForTable = (localData: BlockInfo): RowTableRow[] | null => {
    if (!localData) {
      return null;
    }
    return Object.keys(localData).map((key) => {
      return {
        heading: key,
        value: (localData as any)[key],
      };
    });
  };

  const formatMiningTxDataForTable = (miningTx: MiningTx): RowTableRow[] | null => {
    if (!miningTx) {
      return null;
    }
    return [
      { heading: 'Coinbase Hash', value: coinbaseHash.toString() },
      { heading: 'Token Reward', value: miningTx.tokensDivided.toString() },
      { heading: 'Fractionated Token Reward', value: miningTx.tokens.toString() },
      { heading: 'Version', value: miningTx.version.toString() },
      { heading: 'Script Public Key', value: miningTx.scriptPublicKey },
    ];
  };

  const fetchMiningTx = async (miningTxAndNonce: MiningTxHashAndNoce) => {
    const coinbaseHash = miningTxAndNonce.hash;
    setCoinbaseHash(coinbaseHash);

    if (miningTxAndNonce && coinbaseHash) {
      const tx = (await store.fetchBlockchainItem(coinbaseHash)) as Transaction;

      if (!isBlock(tx)) {
        if (isToken(tx.outputs[0].value)) {
          const output = tx.outputs[0] as TransactionOutputs;
          const reward = (output.value as TokenOutput).Token.toString();
          const miningTx = {
            tokens: reward,
            tokensDivided: (parseFloat(reward) / 25200).toFixed(2),
            scriptPublicKey: output.script_public_key,
            version: tx.version,
          };
          setMiningTx(miningTx);
        }
      }
    }
  };

  const formatIncomingData = (data: Block | Transaction) => {
    if (isBlock(data)) {
      const block = data as Block;
      let blockInfo = block.block;
      let miningTx = block.miningTxHashAndNonces;

      fetchTransactions(blockInfo.transactions);

      // Handle the coinbase
      fetchMiningTx(miningTx);

      let newData: BlockInfo = formatToBlockInfo({ hash, block: blockInfo, miningTxHashAndNonces: miningTx });

      return newData;
    } else {
      console.log('transaction');
      const tx = data as Transaction;
      setMainTxData(formatTransactions([tx], [hash]));

      return {
        inputs: formatTransactionInputs(tx.inputs as TransactionInputs[]),
        outputs: formatTransactionOutputs(tx.outputs as TransactionOutputs[]),
      };
    }
  };

  const isBlock = (data: Block | Transaction) => {
    if (data.hasOwnProperty('block')) {
      return true;
    } else {
      return false;
    }
  };

  const isToken = (data: TokenOutput | ReceiptOutput) => {
    if (data.hasOwnProperty('Token')) {
      return true;
    } else if (data.hasOwnProperty('Receipt')) {
      return false;
    }
  };

  // const formatBlockCsv = (blockInfo: BlockInfo) => {
  //   const header = 'hash,computeNodes,blockNum,merkleRootHash,previousHash,version,byteSize,transactions';
  //   let csv = header + '\n';
  //   csv += `${blockInfo.hash},${blockInfo.computeNodes},${blockInfo.blockNum},${blockInfo.merkleRootHash},${blockInfo.previousHash},${blockInfo.version},${blockInfo.byteSize},${blockInfo.transactions}\n`;
  //   return csv;
  // };

  // const formatTransactionCsv = (transactionInfo: any) => {
  //   const header = 'coinbaseHash,tokenReward,fractionatedTokenReward,version,scriptPublicKey';
  //   let csv = header + '\n';
  //   csv += `${coinbaseHash},${transactionInfo.tokens},${transactionInfo.tokensDivided},${transactionInfo.version},${transactionInfo.scriptPublicKey}\n`;
  //   return csv;
  // };

  React.useEffect(() => {
    if (!localData) {
      store.fetchBlockchainItem(hash).then((nowData) => {
        setHeading(nowData ? (isBlock(nowData) ? 'Block' : 'Transaction') : '');

        setLocalData(formatIncomingData(nowData));
      });
    }
  }, []);

  React.useEffect(() => {
    console.log(miningTx);
  })

  return useObserver(() => (
    <div className={styles.container}>
      <h2 className={styles.heading}>
        {heading} {localData && localData.blockNum && <span className={styles.blockNum}>{'#' + localData.blockNum}</span>}
      </h2>

      {/* <div className={styles.dlContainer}>
        <p
          className={styles.dlBtn}
          onClick={() => {
            downloadFile(`block-${hash}.csv`, formatBlockCsv(localData));
          }}
        >
          [Download{' '}
          <span className={styles.csvExport}>
            CSV Export
            <img className={styles.dlicon} src={dlicon} />
          </span>
          ]
        </p>
      </div> */}

      {heading == 'Transaction' && <TransactionView summaryData={mainTxData} detailData={localData} />}

      {heading == 'Block' && <RowTable rows={formatDataForTable(localData)} />}

      {heading && heading == 'Block' && transactions && transactions.length > 0 && (
        <div className={styles.transactionContainer}>
          <h2 className={styles.innerHeading}>Block Transactions</h2>

          {transactions && transactions.length > 0 && (
            <div className={styles.transactionContainer}>
              {transactions.map((t: TransactionInfoProps, i: number) => {
                console.log('T', t);
                return (
                  <div key={i}>
                    <TransactionInfo {...t} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {heading && heading == 'Block' && miningTx && (
        <>
          <h2 className={styles.innerHeading}>Coinbase Transaction</h2>
          {/* <div className={styles.dlContainer}>
            <p
              className={styles.dlBtn}
              onClick={() => {
                downloadFile(`transaction-${coinbaseHash}.csv`, formatTransactionCsv(miningTx));
              }}
            >
              [Download{' '}
              <span className={styles.csvExport}>
                CSV Export
                <img className={styles.dlicon} src={dlicon} />
              </span>
              ]
            </p>
          </div> */}
          <div className={styles.transactionContainer}>
            <RowTable rows={formatMiningTxDataForTable(miningTx)} />
          </div>
        </>
      )}
    </div>
  ));
};
// formatMiningTxDataForTable(miningTx)
