import { Network } from './interfaces';

export const NETWORKS: Network[] = [
    {
        name: 'Odin (Mainnet)',
        chainId: 0,
        sIp: 'storage-odin-1.zenotta.com',
        sPort: 3002
    },
    {
        name: 'Loki (Testnet)',
        chainId: 1,
        sIp: 'storage-loki-1.zenotta.com',
        sPort: 3003
    }
];