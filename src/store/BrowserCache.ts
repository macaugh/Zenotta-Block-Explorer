import { NETWORKS } from "../networks";
import { IDB_TX_CACHE, IDB_BLOCKS_CACHE } from "../constants";

class BrowserCache {
  private db: IDBDatabase | null;

  constructor() {
    this.db = null;
    const openReq = window.indexedDB.open("cache", 1);
    const networks = NETWORKS.map(e => e.sIp);

    // error handler signifies that the database didn't open successfully
    openReq.addEventListener("error", () =>
      console.error("Database failed to open")
    );

    // success handler signifies that the database opened successfully
    openReq.addEventListener("success", () => {
      console.log("Database opened successfully");

      // Store the opened database object in the db variable. This is used a lot below
      this.db = openReq.result;
    });

    // Set up the database tables if this has not already been done
    openReq.addEventListener("upgradeneeded", (e: any) => {
      // Grab a reference to the opened database
      this.db = e.target.result;

      for (let n of networks) {
        this.createObjectStore(`${IDB_TX_CACHE}_${n}`, this.createTransactionStruct);
        this.createObjectStore(`${IDB_BLOCKS_CACHE}_${n}`, this.createBlockStruct);
      }
    });
  }

  /**
   * Adds data to the cache
   *
   * @param os {string} - Object store name
   * @param data {any} - Data to be stored
   */
  public add(os: string, data: any) {
    if (this.db && this.db.objectStoreNames.contains(os)) {
      const transaction = this.db.transaction([os], "readwrite");
      const objectStore = transaction.objectStore(os);
      const request = objectStore.openCursor(data.id);

      request.onsuccess = (e: any) => {
        let cursor = e.target.result;

        if (cursor) {
          // TODO: Update data? Under what conditions?

          // key already exist
          /**  cursor.update(data);
          // console.log(
          //   `Data updated in ${os.toUpperCase()} CACHE successfully: ${JSON.stringify(
          //     e
          //   )}`
          // );*/
        } else {
          // key not exist
          objectStore.add(data);
          console.log(
            `Data added to ${os.toUpperCase()} CACHE successfully: ${JSON.stringify(
              e
            )}`
          );
        }
      };
    } else {
      console.warn(
        `IndexedDB ${os.toUpperCase()} CACHE not available. Data not added.`
      );
    }
  }

  /**
   * Gets a data entry from the cache, if it exists. If it doesn't 
   * exist, the key will be returned
   *
   * @param os {string} - Object store name
   * @param key {string} - Key to be retrieved
   * @returns request
   */
  public async get(os: string, key: number | string) {
    if (this.db && this.db.objectStoreNames.contains(os)) {
      const transaction = this.db.transaction([os], "readonly");
      const objectStore = transaction.objectStore(os);
      const request = objectStore.get(key);

      return await new Promise((resolve, reject) => {
        request.onsuccess = () => {
          resolve(request.result ? request.result : { key });
        };

        request.onerror = (e: any) => {
          console.error(
            `Error getting data from ${os.toUpperCase()} CACHE: ${JSON.stringify(
              e
            )}`
          );
          reject(e);
        };
      });
    }

    console.warn(
      `IndexedDB ${os.toUpperCase()} CACHE not available. Data not retrieved.`
    );
    return null;
  }

  /**
   * Deletes a data entry from the cache
   *
   * @param os {string} - Object store name
   * @param key {string} - Key to be deleted
   */
  public delete(os: string, key: string) {
    if (this.db && this.db.objectStoreNames.contains(os)) {
      const transaction = this.db.transaction([os], "readwrite");
      const objectStore = transaction.objectStore(os)
      const request = objectStore.delete(key);

      request.onsuccess = () => {
        console.log(`Data deleted from ${os.toUpperCase()} CACHE successfully`);
      };

      request.onerror = (e: any) => {
        console.error(
          `Error deleting data from ${os.toUpperCase()} CACHE: ${JSON.stringify(
            e
          )}`
        );
      };
    }
  }

  /**
   * Creates an object store on the IndexedDB instance
   *
   * @param name {string} - Object store name
   * @param cb {Function} - Callback function to create object store structure
   */
  private async createObjectStore(name: string, cb: Function) {
    if (this.db) {
      const objectStore = this.db.createObjectStore(name, {
        keyPath: "id",
      });

      cb(objectStore);
      console.log(`${name.toUpperCase()} CACHE setup complete`);
    } else {
      console.warn(
        `IndexedDB not available. ${name.toUpperCase()} CACHE not setup.`
      );
    }
  }

  private createBlockStruct(blockStore: any) {
    blockStore.createIndex("id", "id", { unique: true });
  }

  private createTransactionStruct(txStore: any) {
    // Define transaction structure
    txStore.createIndex("id", "id", { unique: true });
  }
}

export default new BrowserCache();
