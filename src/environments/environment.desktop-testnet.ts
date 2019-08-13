export const environment = {
    production: true,
    desktop: true,
    version: '1.0.1',
    qlcChainNetwork: 'test', // test or main
    neoNetwork: 'test', // test or main
    mainRpcUrl: {
        'test' : 'https://rpc-test.qlcchain.online',
        'main' : 'https://rpc.qlcchain.online'
    },
    rpcUrl: {
        'test' : 'http://127.0.0.1:19735',
        'main' : 'http://127.0.0.1:9735'
    },        
    nep5Url: {
        'test' : '',
        'main' : 'https://nep5.qlcchain.online'
    },
    neoSmartContract: {
        'test' : '',
        'main' : '3078aa0e095defba3f00e0af12810187ecfb586a'
    },
    neoPublicKey: {
        'test' : '',
        'main' : '02c6e68c61480003ed163f72b41cbb50ded29d79e513fd299d2cb844318b1b8ad5'
    },
    neoScanApi: {
        'test' : 'https://neoscan-testnet.io/api/test_net',
        'main' : 'https://api.neoscan.io/api/main_net'
    },
    neoScan: {
        'test' : 'https://neoscan-testnet.io',
        'main' : 'https://neoscan.io'
    },
    neonNetwork: {
        'test' : 'TestNet',
        'main' : 'MainNet'
    }
};
