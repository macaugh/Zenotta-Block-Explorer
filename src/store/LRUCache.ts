export class LRUCache {
    private capacity: number;
    private map: Map<string, { prev: string, next: string }>;
    private tail: string | null;
    private head: string | null;

    /**
     * Creates a new instance of LRUCache. LRU cache is used for 
     * the IndexedDB BrowserCache and manages entry membership. It's not a true LRU cache, 
     * we only care about the tail of the cache and capacity for membership
     * 
     * @param {number} capacity - The maximum number of items that can be stored in the cache
     */
    constructor(capacity: number) {
        this.capacity = capacity;
        this.map = new Map();
        this.tail = null;
        this.head = null;
    }

    /**
     * Hits the cache for the given key. If the key is not found, it'll be added.
     * If the key is found, it'll be moved to the tail of the cache
     * 
     * @param {string} key - The key of the item to be retrieved
     */    
    public promote(key: string) {
        if (this.map.has(key) && this.tail) {
            let tmp = this.map.get(this.tail);

            if (tmp) {
                this.makeMostRecent(key);
                this.removeFromPosition(key);
            }
        } else {
            let _ = this.add(key);
        }
    }

    /**
     * Adds an item to the cache. If the cache is full, the least 
     * recently used item will be removed and returned
     * 
     * @param {string} key - The key of the item to be added
     */
    public add(key: string): string | null {
        let removed = null;

        if (this.map.size >= this.capacity) {
            removed = this.ejectLRU();
        }

        if (this.tail) {
            let tmp = this.map.get(this.tail);
            let newEntry = { prev: this.tail, next: '' };

            if (tmp) {
                let tmpKey = this.tail;
                tmp.next = key;

                this.tail = key;
                this.map.set(this.tail, newEntry);
                this.map.set(tmpKey, tmp);
            }
        } else {
            this.head = key;
            this.tail = key;
            this.map.set(key, { prev: this.tail as string, next: '' });
        }

        return removed;
    }

    /**
     * Makes the provided key the most recent in the cache
     * 
     * @param {string} key - The key of the item to be made most recent
     */
    private makeMostRecent(key: string) {
        let newTail = { prev: this.tail as string, next: '' };
        let currentTail = this.map.get(this.tail as string);
        let currentTailKey = this.tail;

        if (currentTail) {
            currentTail.next = key;
            this.map.set(currentTailKey as string, currentTail);
            this.tail = key;
            this.map.set(this.tail, newTail);
        }
    }

    /**
     * Removes the provided key from the cache in its current position
     * 
     * @param {string} key - The key of the item to be removed from its current position
     */
    private removeFromPosition(key: string) {
        let curr = this.map.get(key);
        
        if (curr) {
            let prev = this.map.get(curr.prev);
            let next = this.map.get(curr.next);

            if (!prev && next) {
                this.head = curr.next;
                this.map.set(this.head, { prev: '', next: next.next });

            } else if (prev && next) {
                prev.next = curr.next;
                next.prev = curr.prev;

                this.map.set(curr.prev, prev);
                this.map.set(curr.next, next);
            }
        }   
    }

    /**
     * Ejects the least recently used item from the cache and returns the key
     * 
     * @returns {string} - The least recently used item in the cache
     */
    private ejectLRU(): string | null {
        let removedKey = this.head;
        let head = this.map.get(this.head as string);

        if (head) {
            let newHead = head.next;
            this.map.delete(this.head as string);
            this.head = newHead;
        }

        return removedKey;
    }
}