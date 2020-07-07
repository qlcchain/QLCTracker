export const environment = {
  production: true,
  desktop: true,
  version: '1.3.3',
  qlcChainNetwork: 'main', // test or main
  neoNetwork: 'main', // test or main
  chainxNetworkDefault: 'main', // test or main
  mainRpcUrl: {
    'test': '',
    'main': 'https://rpc.qlcchain.online'
  },
  rpcUrl: {
    'test': 'http://127.0.0.1:19735',
    'main': 'http://127.0.0.1:9735'
  },
  wsUrl: {
    'test': 'ws://127.0.0.1:19736',
    'main': 'ws://127.0.0.1:9736'
  },
  nep5Url: {
    'test': '',
    'main': 'https://nep5.qlcchain.online'
  },
  neoSmartContract: {
    'test': '',
    'main': '3078aa0e095defba3f00e0af12810187ecfb586a'
  },
  neoPublicKey: {
    'test': '',
    'main': '02c6e68c61480003ed163f72b41cbb50ded29d79e513fd299d2cb844318b1b8ad5'
  },
  neoScanApi: {
    'test': 'https://neoscan-testnet.io/api/test_net',
    'main': 'https://api.neoscan.io/api/main_net'
  },
  neoScan: {
    'test': 'https://neoscan-testnet.io',
    'main': 'https://neoscan.io'
  },
  neonNetwork: {
    'test': 'TestNet',
    'main': 'MainNet'
  },
  chainxWs: {
    test: 'ws://39.96.178.97:8087',
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
