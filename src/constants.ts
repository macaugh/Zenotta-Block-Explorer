import { NETWORKS } from "./networks";

/** SERVER */

export const HOST_PROTOCOL = 'https';
export const HOST_NAME = 'explorer.zenotta.com';
export const HOST_PORT = 8090;

/** LOCAL CACHE */

export const MAX_CACHE_SIZE = NETWORKS.length ? 1_000_000 / (2 * NETWORKS.length) : 1_000_000;
export const IDB_TX_CACHE = "zen_exp_transactions";
export const IDB_BLOCKS_CACHE = "zen_exp_blocks";