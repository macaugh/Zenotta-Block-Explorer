const farmhash = require('farmhash');
const lruCache = require('./cache');

const DEFAULTS = {
    regularBuckets: 54,
    stashBuckets: 6,
    bucketSize: 14
};

/**
 * Converts a string or object into a hash-based integer value
 * 
 * @param {string | object} input 
 */
function generateKey(input) {
    const hexDigest = crypto.createHash('md5').update(input).digest('hex');
    farmhash.fingerprint32(hexDigest);
}

class Segment {
    /**
     * @class Segment
     * @classdesc Segment of a Dash Table
     * 
     * @param {number} regularBuckets - Number of regular buckets
     * @param {number} stashBuckets - Number of stash buckets
     * @param {number} bucketSize - Number of entries in a bucket
     */
    constructor(regularBuckets, stashBuckets, bucketSize) {
        this.regularBucketsSize = regularBuckets || DEFAULTS.regularBuckets;
        this.stashBucketsSize = stashBuckets || DEFAULTS.stashBuckets;
        this.bucketSize = bucketSize || DEFAULTS.bucketSize;

        this.regularBuckets = this.constructBuckets(this.regularBucketsSize, false);
        this.stashBuckets = this.constructBuckets(this.stashBucketsSize, true);
    }

    /**
     * @description Constructs an array of buckets
     * 
     * @param {number} size - Number of buckets to construct
     * @param {boolean} addAsHead - Whether new entries should be added to the head of the cache
     * @returns An array of buckets containing LRU caches
     */
    constructBuckets(size, addAsHead) {
        const buckets = [];

        for (let i = 0; i < size; i++) {
            buckets.push(new lruCache.NetworkCache(this.bucketSize, addAsHead));
        }

        return buckets;
    }

    /**
     * @description Adds a value to the segment, starting in the stash buckets
     * 
     * @param {object} value 
     * @returns A boolean indicating whether the value was added to the stash successfully
     */
    add(value) {
        const key = this.generateBucketKey(value, this.stashBucketsSize);
        const bucket = this.stashBuckets[key];
        if (!bucket) { throw new Error('Bucket does not exist'); }

        bucket.add(value);
    }

    /**
     * @description Gets a value from the segment
     * 
     * @param {object} value 
     */
    get(value) {
        const stashKey = this.generateBucketKey(value, this.stashBucketsSize);
        const stashBucket = this.stashBuckets[stashKey];
        if (!stashBucket) { throw new Error('Stash bucket does not exist'); }

        // Getting the entry will remove it from its stash cache
        const stashValue = stashBucket.get(stashKey);
        const regularKey = this.generateBucketKey(value, this.regularBucketsSize);
        const regularBucket = this.regularBuckets[regularKey];
        if (!regularBucket) { throw new Error('Regular bucket does not exist'); }

        // If it was in stash
        if (stashValue) {
            regularBucket.add(stashValue);
            return stashValue;
        }

        // Otherwise get from bucket (returns null if not present)
        return regularBucket.get(regularKey, true);
    }

    /**
     * @description Generates a bucket specific key for a given value
     * 
     * @param {object} input 
     * @returns 
     */
    generateBucketKey(input, bucketSize) {
        const key = generateKey(input);
        return key % bucketSize;
    }
}

class DragonflyCache {
    constructor(segRegularBuckets, segStashBuckets) {
        this.cache = new Map();
        this.segRegularBuckets = segRegularBuckets;
        this.segStashBuckets = segStashBuckets;
    }

    generateKey(input) {
        const hexDigest = crypto.createHash('md5').update(input).digest('hex');
        farmhash.fingerprint32(hexDigest);
    }

    generateSegmentKey(input) {
        const key = generateKey(input);
        return key % 1000;
    }

    add(value) {
        const key = generateKey(value);
        const segmentKey = this.generateSegmentKey(key);
        const segment = this.getSegment(segmentKey);

        if (segment) {
            let addResult = segment.add(value);

        } else {
            this.setSegment(segmentKey);
            this.add(value);
        }
    }

    getSegment(key) {
        return this.cache.get(key);
    }

    setSegment(key) {
        this.cache.set(key, new Segment(this.segRegularBuckets, this.segStashBuckets));
    }

    getKeys() {
        return this.cache.keys();
    }

    clear() {
        this.cache.clear();
    }
}