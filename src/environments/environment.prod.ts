// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  desktop: false,
  version: '1.4.2',
  qlcChainNetwork: 'main', // test or main
  neoNetwork: 'main', // test or main
  chainxNetworkDefault: 'main', // test or main // test doesn't work
  ethNetworkDefault: 'mainnet', // mainnet, ropsten, rinkeby
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
  neotube: {
    test: 'https://testnet.api.neotube.io/api/',
    main: 'https://mainnet.api.neotube.io/api/'
  },
  etherscan: {
    test: 'https://rinkeby.etherscan.io/',
    main: 'https://etherscan.io/'
  },
  ethExplorer: {
    mainnet: 'https://etherscan.io',
    ropsten: 'https://ropsten.etherscan.io',
    rinkeby: 'https://rinkeby.etherscan.io'
  },
  ethEtherscanApiKey: 'QB9XWH5BSIYIVIVZ5A85C8TK3XTH4WPVAK',
  ethEtherscanApi: {
    mainnet: 'https://api.etherscan.io',
    ropsten: 'https://api-ropsten.etherscan.io',
    rinkeby: 'https://api-rinkeby.etherscan.io'
  },
  neotubeSite: {
    test: 'https://testnet.neotube.io/',
    main: 'https://neotube.io/'
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
    {authorization:'eyJhbGciOiJFUzUxMiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJRTENDaGFpbiBCb3QiLCJqdGkiOiIwYmE3N2ViMS0yNmMyLTRhZTItODU1Yi0zYmU5NmI3ODVjZTYiLCJpYXQiOjE2MDk4Mjg4MzksImlzcyI6IlFMQ0NoYWluIEJvdCIsInN1YiI6InNpZ25lciIsInJvbGVzIjpbInVzZXIiXX0.AVHd9IlSEb8SkblcJFc_e2oLNe-xb7Chm7jQCr3tlT06AYqlHP1Ks1ajP7AbTl_-Yrlgu1l9phyEnNaJevmQY2r3AVucd0a9j41cSfA5q-XelapyeDNbf8SihOYo_pclsBPR9WsCU9ABOHLzNd-uh_yVFMbICdYNDaP_rrP4o8iBH4oq'}
  },
  neoSmartContract: {
    test: '',
    main: '3078aa0e095defba3f00e0af12810187ecfb586a'
  },
  neo5swapSmartContract: {
    test: 'bfcbb52d61bc6d3ef2c8cf43f595f4bf5cac66c5',
    main: 'd2028b9c5639ef287cff7b08e1a4ec0b858e68a2'
  },
  neo5QLCSmartContract: {
    test: 'b9d7ea3062e6aeeb3e8ad9548220c4ba1361d263',
    main: '0d821bd7b6d53f5c2b40e217c6defc8bbe896cf5'
  },
  etherswapSmartContract: {
    test: '0xE2484A4178Ce7FfD5cd000030b2a5de08c0Caf8D',
    main: '0xd196f680e0bDF810f1fe8b323b90CA0B62f4e63e'
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
