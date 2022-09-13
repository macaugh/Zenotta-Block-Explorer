const farmhash = require('farmhash');
const lruCache = require('./cache');

const DEFAULTS = {
    regularBuckets: 54,
    stashBuckets: 6,
    bucketSize: 14,
    maxSegments: 1000
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
        this.regularBucketsSize = regularBuckets;
        this.stashBucketsSize = stashBuckets;
        this.bucketSize = bucketSize;

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
    /**
     * @description Constructs a DragonflyCache
     * 
     * @param {number} segRegularBuckets - Number of regular buckets per segment
     * @param {number} segStashBuckets - Number of stash buckets per segment
     * @param {number} maxSegments - Maximum number of segments. Optional, defaults to 1000
     * @param {number} bucketSize - Number of entries in a bucket
     */
    constructor(segRegularBuckets, segStashBuckets, maxSegments, bucketSize) {
        this.cache = new Map();
        this.segRegularBuckets = segRegularBuckets || DEFAULTS.regularBuckets;
        this.segStashBuckets = segStashBuckets || DEFAULTS.stashBuckets;
        this.bucketSize = bucketSize || DEFAULTS.bucketSize;
        this.maxSegments = maxSegments || DEFAULTS.maxSegments;
    }

    /**
     * @description Generates a segment specific key for a given value
     * 
     * @param {object} input 
     * @returns A segment key integer
     */
    generateSegmentKey(input) {
        const key = generateKey(input);
        return key % this.maxSegments;
    }

    /**
     * @description Adds a value to the cache
     * 
     * @param {object} value 
     */
    add(value) {
        const key = generateKey(value);
        const segmentKey = this.generateSegmentKey(key);
        const segment = this.getSegment(segmentKey);

        if (segment) {
            segment.add(value);

        } else {
            this.addSegment(segmentKey);
            this.add(value);
        }
    }

    /**
     * Gets a value from cache
     * 
     * @param {object} value 
     * @returns 
     */
    get(key) {
        const key = generateKey(value);
        const segmentKey = this.generateSegmentKey(key);
        const segment = this.getSegment(segmentKey);

        if (segment) {
            return segment.get(value);
        }

        return null;
    }

    getSegment(key) {
        return this.cache.get(key);
    }

    addSegment(key) {
        const segment = new Segment(this.segRegularBuckets, this.segStashBuckets, );
        this.cache.set(key, new Segment(this.segRegularBuckets, this.segStashBuckets));
    }

    clear() {
        this.cache.clear();
    }
}