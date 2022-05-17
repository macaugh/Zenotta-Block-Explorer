import * as React from 'react';
import { useObserver } from 'mobx-react';
import { TextInput, Button } from 'chi-ui';
import { StoreContext } from '../../index';
import { BlockInfo, RequestData } from '../../interfaces';
import { formatToBlockInfo } from '../../formatData';
import styles from './CsvExport.scss';

const DEFAULT_WARNING = 'Please enter range of blocks to export';

const arrayToCsv = (data: RequestData[]) => {
  if (data.length > 0) {
    console.log('in');
    const header = 'hash,computeNodes,blockNum,merkleRootHash,previousHash,version,byteSize,transactions';
    let csv = header + '\n';

    data.forEach((item: RequestData) => {
      let blockInfo: BlockInfo = formatToBlockInfo(item); 
      csv += `${blockInfo.hash},${blockInfo.computeNodes},${blockInfo.blockNum},${blockInfo.merkleRootHash},${blockInfo.previousHash},${blockInfo.version},${blockInfo.byteSize},${blockInfo.transactions}\n`;
    });
    return csv;
  }
  return '';
};

export const downloadFile = (fileName: string, data: any) => {
  var link = document.createElement('a');
  link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
  link.setAttribute('download', fileName);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const CsvExport = () => {
  const store = React.useContext(StoreContext);
  const [startingBlock, setStartingBlock] = React.useState<number | undefined>(1);
  const [endingBlock, setEndingBlock] = React.useState<number | undefined>(4);
  const [warningMsg, setWarningMsg] = React.useState<string>(DEFAULT_WARNING);
  const [disabled, setDisabled] = React.useState<boolean>(true);
  const [loading, setLoading] = React.useState<boolean>(false);

  const valueCheck = async (start: number, end: number) => {
    setDisabled(true);
    if (start >= end) {
      setWarningMsg('Starting block must be less than ending block');
    } else {
      const sBlock = await store.blockNumIsValid(start); // Add timeouts
      const eBlock = await store.blockNumIsValid(end);

      if (!sBlock.isValid) {
        setWarningMsg(sBlock.error);
      } else if (!eBlock.isValid) {
        setWarningMsg(eBlock.error);
      } else {
        setDisabled(false);
        setWarningMsg('');
      }
    }
  };

  const downloadBlockRange = async () => {
    if (!disabled && startingBlock && endingBlock) {
      setLoading(true);
      store
        .fetchBlockRange(startingBlock, endingBlock)
        .then((blockRange: any) => {
          console.log('block range',blockRange);
          if (blockRange.length > 0) {
            console.log(true,blockRange[0]);
            let csv = arrayToCsv(blockRange);
            downloadFile('block_range.csv', csv);
            setWarningMsg('');
          }
        })
        .catch((err: any) => {
          setWarningMsg('Range is to big, please reduce range size');
          console.log(err.message);
        });
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (startingBlock && endingBlock) {
      valueCheck(startingBlock, endingBlock);
    } else {
      setDisabled(true);
      setWarningMsg(DEFAULT_WARNING);
    }
  }, [startingBlock, endingBlock]);

  return useObserver(() => (
    <div className={styles.container}>
      <h2 className={styles.heading}>Csv Export</h2>

      <div className={styles.content}>
        <p>Export a blocks from range</p>
        <div className={styles.inputs}>
          <TextInput
            className={styles.txtInput}
            type="number"
            value={startingBlock}
            placeholder="Start Block Number"
            onChange={(e: { target: { value: string } }) => {
              const val = e.target.value;
              setStartingBlock(val ? parseInt(val) : undefined);
            }}
          />
          {'to'}
          <TextInput
            className={styles.txtInput}
            type="number"
            value={endingBlock}
            placeholder="End Block Number"
            onChange={(e: { target: { value: string } }) => {
              const val = e.target.value;
              setEndingBlock(val ? parseInt(val) : undefined);
            }}
          />
        </div>
        {warningMsg && <p className={styles.warningMsg}>{warningMsg}</p>}
        <Button
          className={styles.btn}
          onClick={() => {
            downloadBlockRange();
          }}
          disabled={disabled}
          loading={loading}
        >
          Download CSV
        </Button>
      </div>
    </div>
  ));
};
