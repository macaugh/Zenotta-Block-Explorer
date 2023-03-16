import * as React from "react";
import { useObserver } from "mobx-react";
import { useParams } from "react-router-dom";
import { StoreContext } from "../../index";

import styles from "./TxView.scss";
import { TxInfo } from "../TxInfo/TxInfo";
import { downloadFile, formatCsvTxs, itemToCsv } from "../../formatCsv";
import { formatNumber } from "../../formatData";
import { Card } from "components/Card/Card";
import { Pill } from "components/Pill/Pill";
import {
  Block,
  Input,
  InputInfo,
  Output,
  ReceiptInfo,
  StackData,
  TokenInfo,
  Transaction,
  TransactionInfo,
  OutputValueV2,
} from "interfaces";

export const TxView = () => {
  let { hash, network } = useParams<any>();
  const store = React.useContext(StoreContext);
  const [localData, setLocalData] = React.useState<TransactionInfo | null>(
    null
  );
  const [mainTxData, setMainTxData] = React.useState<any>(null);

  const checkSeenTxIns = (t: Input, seenIns: string[]) => {
    if (t.previousOut && t.previousOut.tHash) {
      let tHash = t.previousOut.tHash;

      if (seenIns.indexOf(tHash) == -1) {
        seenIns.push(tHash);
        return true;
      }
      return false;
    }
    return false;
  };

  const formatScript = (stack: StackData[]) => {
    let combo = [];
    for (let entry of stack) {
      let key: any = Object.keys(entry)[0];

      console.log("entry", (entry as any)[key]);
      let val = (entry as any)[key];

      combo.push(val instanceof Array ? toHexString(val) : val);
    }
    return combo.join("\n");
  };

  const formatTransactionInputs = (inputs: Input[]) => {
    return inputs.map((input) => {
      const previousOutHash =
        input.previousOut && input.previousOut.tHash
          ? input.previousOut.tHash
          : "N/A";
      return {
        previousOutHash: previousOutHash,
        scriptSig: formatScript(input.scriptSig.stack),
      };
    });
  };

  const formatMetadata = (metadata: any) => {
    if (metadata) {
      try {
        return JSON.parse(metadata);
      } catch {
        return "N/A";
      }
    }

    return "N/A";
  };

  const formatTransactionOutputs = (
    outputs: Output[]
  ): TokenInfo[] | ReceiptInfo[] => {
    return outputs.map((output: Output) => {
      if (output.value.hasOwnProperty("Token")) {
        // is a token output
        const tokens = (output.value as { Token: number }).Token;
        return {
          address: output.scriptPubKey,
          tokens: `${formatNumber((tokens / 25200).toFixed(2))} ZENO`,
          fractionatedTokens: `${formatNumber(tokens)}`,
          lockTime: output.locktime,
        } as TokenInfo;
      } else if (output.value.hasOwnProperty("Receipt")) {
        // is a Receipt output
        const receipt = output.value;

        if (typeof (receipt as { Receipt: number }).Receipt === "number") {
          const receipts = (output.value as { Receipt: number }).Receipt;
          return {
            address: output.scriptPubKey,
            receipts: receipts,
            lockTime: output.locktime,
            genesisTransactionHash: "N/A",
            metadata: "N/A",
          } as ReceiptInfo;
        }

        if ("amount" in (receipt as { Receipt: OutputValueV2 }).Receipt) {
          const amount = (receipt as { Receipt: OutputValueV2 }).Receipt.amount;
          const drsTxHash = (receipt as { Receipt: OutputValueV2 }).Receipt
            .drs_tx_hash;
          const metadata = formatMetadata(
            (receipt as { Receipt: OutputValueV2 }).Receipt.metadata
          );

          return {
            address: output.scriptPubKey,
            receipts: amount,
            lockTime: output.locktime,
            genesisTransactionHash: drsTxHash || "N/A",
            metadata,
          } as ReceiptInfo;
        }

        return {
          address: output.scriptPubKey,
          receipts: 0,
          lockTime: output.locktime,
          genesisTransactionHash: "N/A",
          metadata: "N/A",
        };
      }
    }) as TokenInfo[] | ReceiptInfo[];
  };

  const formatTransactions = (
    transactions: Transaction[],
    hashes: string[]
  ) => {
    if (!transactions || !transactions.length) {
      return [];
    }

    if (transactions.length == 1) {
      let tx = transactions[0];
      return extractTransactionInfo(tx, hashes, 0);
    }

    return transactions.map((tx, i) => {
      return extractTransactionInfo(tx, hashes, i);
    });
  };

  const formatDataForTable = (localData: any) => {
    if (!localData) {
      return null;
    }

    return Object.keys(localData).map((key) => {
      const value = localData[key];

      switch (key) {
        case "scriptSig":
          let script = value.split("\n");
          return {
            heading: key,
            value: (
              <>
                {Object.keys(script).map((k) => {
                  return (
                    <div style={{ display: 'inline-block', marginBottom: "10px" }}>
                      <Pill>{script[k]}</Pill>
                    </div>
                  );
                })}
              </>
            ),
          };

        case "metadata":
          if (value != "N/A") {
            return {
              heading: key,
              value: (
                <>
                  {Object.keys(value).map((k) => {
                    return (
                      <div style={{ marginBottom: "10px" }}>
                        <Pill>{k}</Pill>
                        <div style={{ display: "inline" }}>{value[k]}</div>
                      </div>
                    );
                  })}
                </>
              ),
            };
          }

        case "previousOutHash":
          if (value != "N/A") {
            return {
              heading: key,
              value: <a href={`${store.network.name}/tx/${value}`}>{value}</a>,
            };
          }

        default:
          return {
            heading: key,
            value: value,
          };
      }
    });
  };

  const formatIncomingData = (
    tx: Transaction | null
  ): TransactionInfo | null => {
    if (tx) {
      setMainTxData(formatTransactions([tx], [hash]));

      return {
        inputs: formatTransactionInputs(tx.inputs as Input[]),
        outputs: formatTransactionOutputs(tx.outputs as Output[]),
      };
    }
    return null;
  };

  const extractTransactionInfo = (
    tx: Transaction,
    hashes: string[],
    index: number
  ) => {
    let seenIns: string[] = [];
    return {
      hash: hashes[index],
      totalTokens: formatNumber(
        tx.outputs.reduce(
          (acc: number, o: Output) =>
            acc + (o.value as { Token: number }).Token,
          0
        )
      ),
      txInHashes: tx.inputs
        .filter((t: Input) => checkSeenTxIns(t, seenIns))
        .map((i: Input) => i.previousOut && i.previousOut.tHash),
      outputs: tx.outputs.map((o: Output) => {
        return {
          publicKey: o.scriptPubKey,
          lockTime: o.locktime,
          tokens: formatNumber((o.value as { Token: number }).Token),
        };
      }),
    };
  };

  const toHexString = (byteArray: number[]) => {
    return Array.from(byteArray, (byte) => {
      return ("0" + (byte & 0xff).toString(16)).slice(-2);
    }).join("");
  };

  // const downloadTx = async () => {
  //     if (localData) {
  //         const { txs, headers } = formatCsvTxs([localData]);
  //         const csv = itemToCsv(txs[0]);
  //         downloadFile(`tx-${hash}`, csv);
  //     }
  // };

  React.useEffect(() => {
    store.setNetwork(network);

    if (!localData) {
      store
        .fetchBlockchainItem(hash)
        .then((fetchedData: Transaction | Block | null) => {
          setLocalData(
            formatIncomingData(
              fetchedData ? (fetchedData as Transaction) : null
            )
          );
        });
    }
  }, []);

  React.useEffect(() => {
    if (localData && window.location.hash) {
      let elmnt = document.getElementById(window.location.hash.substring(1));
      if (elmnt) {
        elmnt.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "start",
        });
        // (elmnt.parentNode as HTMLElement).scrollTop = elmnt.offsetTop - 30;
      }
    }
  }, [localData]);

  return useObserver(() => (
    <div className={styles.container}>
      <h2 className={styles.heading}>{"Transaction"}</h2>
      {/* <CsvBtn action={() => downloadTx()} /> */}
      <div className={styles.txContainer}>
        {mainTxData !== null && mainTxData !== undefined && (
          <TxInfo {...mainTxData} txView={true} />
        )}

        {localData && localData.inputs && localData.inputs.length > 0 && (
          <>
            <h2 id="inputs">Inputs</h2>
            {localData.inputs.map((input: InputInfo, i: number) => {
              return (
                <div className={styles.infoContainer} key={i}>
                  <Card rows={formatDataForTable(input)} />
                </div>
              );
            })}
          </>
        )}

        {localData && localData.outputs && localData.outputs.length > 0 && (
          <>
            <h2 id="outputs">Outputs</h2>
            {localData &&
              (localData.outputs as any).map(
                (output: TokenInfo | ReceiptInfo, i: number) => {
                  return (
                    <div className={styles.infoContainer} key={i}>
                      <Card rows={formatDataForTable(output)} />
                    </div>
                  );
                }
              )}
          </>
        )}
      </div>
    </div>
  ));
};
