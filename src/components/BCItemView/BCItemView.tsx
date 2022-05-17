import * as React from 'react';
import { useObserver } from 'mobx-react';
import { useParams } from 'react-router-dom';
import { StoreContext } from '../../index';
import { RowTable } from '../RowTable/RowTable';
import { TransactionView } from '../TransactionView/TransactionView';
import { TransactionInfo, TransactionInfoProps } from '../TransactionInfo/TransactionInfo';
import { downloadFile } from '../CsvExport/CsvExport';
import dlicon from '../../static/img/dlicon.svg';
import { Transaction, Stack, TransactionInputs, TransactionOutputs} from '../../interfaces';
import { formatToBlockInfo } from '../../formatData';

import styles from './BCItemView.scss';
import { BlockInfo } from '../../interfaces';

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

  const formatScript = (stack: Stack[]) => {
    let combo = [];
    for (let entry of stack) {
      let key:any = Object.keys(entry)[0];
      let val = (entry as any)[key];

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
    return outputs.map((output) => {
      return {
        address: output.script_public_key,
        tokens: `${(output.value.Token / 25200).toFixed(2)} ZENO`,
        fractionatedTokens: `${output.value.Token}`,
        lockTime: output.locktime,
      };
    });
  };

  const getTransactionInfo = (tx: any, hashes: string[], index: number) => {
    let seenIns: string[] = [];
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
      let tx = transactions[0];
      return getTransactionInfo(tx, hashes, 0);
    }

    return transactions.map((tx, i) => {
      return getTransactionInfo(tx, hashes, i);
    });
  };

  const fetchTransactions = async (txs: string[]) => {
    let tInfo = await Promise.all(getTxPromises(txs)).then((results) => formatTransactions(results, txs));
    setTransactions(tInfo);
  };

  const formatDataForTable = (localData: BlockInfo) => {
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

  const formatMiningTxDataForTable = (miningTx: any) => {
    if (!miningTx) {
      return null;
    }
    return [
      { heading: 'Coinbase Hash', value: coinbaseHash },
      { heading: 'Token Reward', value: miningTx.tokensDivided },
      { heading: 'Fractionated Token Reward', value: miningTx.tokens },
      { heading: 'Version', value: miningTx.version },
      { heading: 'Script Public Key', value: miningTx.scriptPublicKey },
    ];
  };

  const fetchMiningTx = async (miningTxAndNonce: any) => {
    const coinbaseHash = miningTxAndNonce.hash;
    setCoinbaseHash(coinbaseHash);

    if (miningTxAndNonce && coinbaseHash) {
      const tx = await store.fetchBlockchainItem(coinbaseHash) as Transaction;

      if (!tx.hasOwnProperty('block')) {
        const reward = tx.outputs[0].value.Token.toString();
        const miningTx = {
          tokens: reward,
          tokensDivided: (parseFloat(reward) / 25200).toFixed(2),
          scriptPublicKey: tx.outputs[0].script_public_key,
          version: tx.version,
        };

        setMiningTx(miningTx);
      }
    }
  };

  const formatIncomingData = (data: any) => {
    if (data.hasOwnProperty('block')) {
      let blockInfo = data.block;
      let miningTx = data.miningTxHashAndNonces;

      fetchTransactions(blockInfo.transactions);

      let merkleHash = blockInfo.header.merkle_root_hash;

      // Handle the coinbase
      fetchMiningTx(miningTx);

      let newData: BlockInfo = formatToBlockInfo({hash, block: blockInfo, miningTxHashAndNonces: miningTx}); 

      return newData;
    } else {
      setMainTxData(formatTransactions([data], [hash]));

      return {
        inputs: formatTransactionInputs((data.inputs as TransactionInputs[])),
        outputs: formatTransactionOutputs((data.outputs as TransactionOutputs[])),
      };
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
        setHeading(nowData ? (nowData.hasOwnProperty('block') ? 'Block' : 'Transaction') : '');
        setLocalData(formatIncomingData(nowData));
      });
    }
  }, []);

  return useObserver(() => (
    <div className={styles.container}>
      <h2 className={styles.heading}>
        {heading} {localData && localData.blockNum} Summary
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
