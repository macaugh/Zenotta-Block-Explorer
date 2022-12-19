import { Network } from './interfaces';

export const NETWORKS: Network[] = [
    {
        name: 'odin',
        displayName: 'Odin (Mainnet)',
        chainId: 0,
        sIp: 'storage-odin-1.zenotta.com',
        sPort: 3002
    },
    {
        name: 'loki',
        displayName: 'Loki (Testnet)',
        chainId: 1,
        sIp: 'storage-loki-1.zenotta.com',
        sPort: 3003
    }
];