class Node {
    constructor(value) {
        this.value = value;
        this.prev = null;
        this.next = null;
    }
}

class NetworkCache {
    constructor(capacity) {
        this.head = null;
        this.tail = null;
        this.lookup = {};

        this.capacity = capacity;
    }

    /**
     * Adds a new entry to the cache
     * 
     * @param {string} id 
     * @param {any} value 
     */
    add(id, value) {
        let entry = new Node(value);

        if (this.reachedCapacity()) {
            this.ejectLRU();
        }

        if (this.tail) {
            this.tail.next = entry;
            entry.prev = this.tail;
            this.tail = entry;
        } else {
            this.head = entry;
            this.tail = entry;
        }

        this.lookup[id] = entry;
    }

    /**
     * Gets an entry by id
     * 
     * @param {string} id 
     */
    get(id) {
        if (this.lookup.hasOwnProperty(id)) {
            let entry = this.lookup[id];

            this.makeMostRecent(entry);
            this.removeFromPosition(entry);

            return entry.value;
        }
        
        return null;
    }

    /** Removes the least recently used entry from the cache */
    ejectLRU() {
        this.head = this.head.next;
        this.head.prev = null;
    }

    /**
     * Makes the passed entry the most recently tagged in the cache
     * 
     * @param {Node} entry
     */
    makeMostRecent(entry) {
        let newEntry = new Node(entry.value);

        // Create new tail
        newEntry.next = null;
        newEntry.prev = this.tail;
        this.tail.next = newEntry;
        this.tail = newEntry;
    }

    /**
     * Removes the entry from its current position in the cache
     * 
     * @param {Node} entry 
     */
    removeFromPosition(entry) {
        // If we're dealing with the head
        if (!entry.prev) {
            this.head = entry.next;
            this.head.prev = null;

        } else if (entry.next) {
            entry.prev.next = entry.next;
            entry.next.prev = entry.prev;
        }
    }

    /**
     * Predicate for checking whether cache has reached capacity
     */
    reachedCapacity() {
        return Object.keys(this.lookup).length >= this.capacity;
    }
}

module.exports = {
    Node,
    NetworkCache
};