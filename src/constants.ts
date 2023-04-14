import { NETWORKS } from "./networks";

/** SERVER */

export const HOST_PROTOCOL = 'https';
export const HOST_NAME = 'explorer.zenotta.com';
export const HOST_PORT = 8090;

/** LOCAL CACHE */

export const MAX_CACHE_SIZE = NETWORKS.length ? 1_000_000 / (2 * NETWORKS.length) : 1_000_000;
export const IDB_TX_CACHE = "zen_exp_transactions";
export const IDB_BLOCKS_CACHE = "zen_exp_blocks";

/** BLOCK TIME */

export const BLOCK_TIME_REFERENCE = {bNum: 1550361, timestamp: 1681286820};
export const ODIN_BLOCK_TIME_REFERENCE = {bNum: 904587, timestamp: 1681287060};
export const BLOCK_TIME = 120;

// ODIN 904587 at 10:11 
// LOKI 1550361 at 10:07