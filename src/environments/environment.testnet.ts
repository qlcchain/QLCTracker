// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: false,
    desktop: false,
    version: '1.0.2',
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


/*
* For easier debugging in development mode, you can import the following file
* to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
*
* This import should be commented out in production mode because it will have a negative impact
* on performance if an error is thrown.
*/
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
