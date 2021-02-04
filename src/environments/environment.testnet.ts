// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  desktop: false,
  version: '1.4.2',
  qlcChainNetwork: 'main', // test or main
  neoNetwork: 'test', // test or main
  chainxNetworkDefault: 'main', // test or main // test doesn't work
  infuraId: '111769056614454ba82f3c6a16be68bb',
  mainRpcUrl: {
    test: '',
    main: 'https://rpc.qlcchain.online'
  },
  rpcUrl: {
    test: 'http://seed2.ngd.network:20332/',
    main: 'https://rpc.qlcchain.online'
  },
  swapUrl: {
    test: 'http://seed2.ngd.network:20332/',
    main: 'http://seed2.ngd.network:10332/'
  },
  wsUrl: {
    test: '',
    main: 'wss://rpc-ws.qlcchain.online'
  },
  nep5Url: {
    test: '',
    main: 'https://nep5.qlcchain.online'
  },
  neo5toerc20swapwrapperurl: {
    test: 'https://hub-test.qlcchain.online',
    main: 'https://hub.qlcchain.online'
  },
  neo5toerc20swapjwtauth: {
    test:
    // tslint:disable-next-line: max-line-length
    {authorization: 'eyJhbGciOiJFUzUxMiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJRTENDaGFpbiBCb3QiLCJqdGkiOiJiZDhiMDM3YS03YzgzLTQxN2UtYTVhMC1kNzc2ODg0MGNlMjIiLCJpYXQiOjE2MDYzOTY5MDgsImlzcyI6IlFMQ0NoYWluIEJvdCIsInN1YiI6InNpZ25lciIsInJvbGVzIjpbInVzZXIiXX0.AHXxllMMeBelYQ8zMLMIZLrlwkxqwGfZ_Zrdzfny7dGHgLOVxUQpIGZjwL5ZTyOTZa5aJ-3sr5lehNWofnM47vOjAV5CpJ3LdGec1DcGX9mN45anluoavcBVePmE1c4maMv4Ale7DEamhSndsYnEGjRJYb2HjNMm0geIVOcs9xW9zQ5z'},
    main:
    // tslint:disable-next-line: max-line-length
    {authorization:'eyJhbGciOiJFUzUxMiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJRTENDaGFpbiBCb3QiLCJqdGkiOiJiZDhiMDM3YS03YzgzLTQxN2UtYTVhMC1kNzc2ODg0MGNlMjIiLCJpYXQiOjE2MDYzOTY5MDgsImlzcyI6IlFMQ0NoYWluIEJvdCIsInN1YiI6InNpZ25lciIsInJvbGVzIjpbInVzZXIiXX0.AHXxllMMeBelYQ8zMLMIZLrlwkxqwGfZ_Zrdzfny7dGHgLOVxUQpIGZjwL5ZTyOTZa5aJ-3sr5lehNWofnM47vOjAV5CpJ3LdGec1DcGX9mN45anluoavcBVePmE1c4maMv4Ale7DEamhSndsYnEGjRJYb2HjNMm0geIVOcs9xW9zQ5z'}
  },
  neoSmartContract: {
    test: '',
    main: '3078aa0e095defba3f00e0af12810187ecfb586a'
  },
  neo5swapSmartContract: {
    test: 'bfcbb52d61bc6d3ef2c8cf43f595f4bf5cac66c5',
    main: ''
  },
  etherswapSmartContract: {
    test: '0xE2484A4178Ce7FfD5cd000030b2a5de08c0Caf8D',
    main: ''
  },
  testSmartContract: {
    test: '0x40E3dCC2EC0B8f7381332614630Aa9EF19b18cA2',
    main: ''
  },
  neoPublicKey: {
    test: '',
    main: '02c6e68c61480003ed163f72b41cbb50ded29d79e513fd299d2cb844318b1b8ad5'
  },
  neoScanApi: {
    test: 'https://api.neoscan.io/api/main_net',
    main: 'https://api.neoscan.io/api/main_net'
  },
  neoScan: {
    test: 'https://testnet.api.neotube.io',
    main: 'https://neoscan.io'
  },
  neonNetwork: {
    test: 'TestNet',
    main: 'MainNet'
  },
  chainxWs: {
    test: '',
    main: 'wss://w1.chainx.org/ws'
  },
  chainxExplorer: {
    test: 'https://scan.chainx.org',
    main: 'https://scan.chainx.org'
  },
  chainxNetwork: {
    test: 'TestNet',
    main: 'MainNet'
  },
  chainxApi: {
    test: 'https://api.chainx.org.cn',
    main: 'https://api.chainx.org.cn'
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
