# SMS Billing


## Development Prerequisites

- Node Package Manager: [Install npm](https://www.npmjs.com/get-npm)
- Angular CLI: `npm i -g @angular/cli`

## Development Guide

### Clone repository and install dependencies

```bash
git clone https://github.com/qlcchain/sms-billing
cd sms-billing
npm install
```

## Build SMS Billing (For Production)

Build a production version of the SMS Billing for web:

```bash
npm run sms:build
```

## Build SMS Billing (For Desktop)

Build a production version of the SMS Billing for desktop:

```bash
npm run sms:build-desktop
```

Then run

```bash
npm run desktop:dev
```

for development or

```bash
npm run desktop:local
```

to create an executable in dist-desktop.

### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Bugs/Feedback

If you run into any issues, please use the [GitHub Issue Tracker](https://github.com/qlcchain/sms-billing/issues)
We are continually improving and adding new features based on the feedback you provide, so please let your opinions be known!

## Acknowledgements

Special thanks to the following!

- [numtel/nano-webgl-pow](https://github.com/numtel/nano-webgl-pow) - WebGL PoW Implementation
- [jaimehgb/RaiBlocksWebAssemblyPoW](https://github.com/jaimehgb/RaiBlocksWebAssemblyPoW) - CPU PoW Implementation
- [dcposch/blakejs](https://github.com/dcposch/blakejs) - Blake2b Implementation
- [dchest/tweetnacl-js](https://github.com/dchest/tweetnacl-js) - Cryptography Implementation

## Links & Resources

- [QLC Website](https://qlcchain.org)
- [Discord Chat](https://discord.gg/JnCnhjr)
- [Reddit](https://www.reddit.com/r/Qlink/)
- [Medium](https://medium.com/qlc-chain)
- [Twitter](https://twitter.com/QLCchain)
- [Telegram](https://t.me/qlinkmobile)

## License

MIT