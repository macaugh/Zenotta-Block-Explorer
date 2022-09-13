class Node {
    constructor(id, value) {
        this.id = id;
        this.value = value;
        this.prev = null;
        this.next = null;
    }
}

class NetworkCache {
    /**
     * Network cache constructor. Is LRU cache.
     * 
     * @param {number} capacity 
     * @param {boolean} addFromHead
     */
    constructor(capacity, addFromHead) {
        this.head = null;
        this.tail = null;
        this.filled = 0;

        this.capacity = capacity;
        this.addFromHead = addFromHead;
    }

    /**
     * Adds a new entry to the cache
     * 
     * @param {string} id 
     * @param {any} value 
     */
    add(id, value) {
        let entry = new Node(id, value);

        if (this.reachedCapacity()) {
            this.ejectLRU();
        } else {
            this.filled++;
        }

        if (this.addFromHead && this.head) {
            this.addAsHead(entry);
        }
        else if (!this.addFromHead && this.tail) {
            this.addAsTail(entry)
        } else {
            this.head = entry;
            this.tail = entry;
        }
    }

    addAsHead(entry) {
        this.head.prev = entry;
        entry.next = this.head;
        this.head = entry;
    }

    addAsTail(entry) {
        this.tail.next = entry;
        entry.prev = this.tail;
        this.tail = entry;
    }

    /**
     * Gets an entry by id
     * 
     * @param {object} value - The value to get
     * @param {boolean} promote - Whether the entry should be promoted toward the head of the cache
     */
    get(id, promote) {
        let current = this.head;
        let prev = null;
        promote = promote || false;

        while (current) {
            if (current.id === id) {
                if (promote) {
                    this.promoteWithPrev(current, prev);
                } else {
                    this.removeFromPosition(current);
                }

                return current.value;
            }

            prev = current;
            current = current.next;
        }

        return null;
    }

    /** Removes the least recently used entry from the cache */
    ejectLRU() {
        this.head = this.head.next;
        this.head.prev = null;
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
     * @description Promotes the entry toward the head of the cache, requiring 
     * the previous entry as argument
     * 
     * @param {object} entry 
     * @param {object} prev 
     */
    promoteWithPrev(entry, prev) {
        if (prev) {
            const tempId = prev.id;
            const tempVal = prev.value;

            prev.id = entry.id;
            entry.id = tempId;
            prev.value = entry.value;
            entry.value = tempVal;
        }
    }

    /**
     * Promotes the entry toward the head of the cache
     * 
     * @param {Node} entry 
     */
    promote(entry) {
        let current = this.head;
        let prev = null;

        while (current.id != entry.id) {
            prev = current;
            current = current.next;
        }

        if (prev && current) {
            let tempVal = prev.value;
            let tempId = prev.id;
            prev.value = entry.value;
            prev.id = entry.id;
            current.value = tempVal;
            current.id = tempId;
        }
    }

    /**
     * Predicate for checking whether cache has reached capacity
     */
    reachedCapacity() {
        return this.filled >= this.capacity;
    }
}

module.exports = {
    Node,
    NetworkCache
};