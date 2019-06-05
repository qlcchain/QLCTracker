// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
	desktop: false,
  qlcChainNetwork: 'main', // test or main
  neoNetwork: 'main', // test or main
  rpcUrl: {
      'test' : 'https://rpc-test.qlcchain.online',
      'main' : 'https://rpc.qlcchain.online'
  },        
  nep5Url: {
      'test' : 'https://nep5-test.qlcchain.online',
      'main' : 'https://nep5.qlcchain.online'
  },
  neoSmartContract: {
      'test' : '30f69798a129527b4996d6dd8e974cc15d51403d',
      'main' : '30f69798a129527b4996d6dd8e974cc15d51403d'
  },
  neoPublicKey: {
      'test' : '03f19ffa8acecb480ab727b0bf9ee934162f6e2a4308b59c80b732529ebce6f53d',
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
