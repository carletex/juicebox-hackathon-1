# 🏗 Scaffold-ETH NFTs for Juicebox

Give some NFT love to your [Juicebox's](https://juicebox.money/#/) donors.

![Main screen](.github/img/main.png?raw=true)

## 🏄‍♂️ Quick Start

**Juicebox set up**

You first need to [create](https://juicebox.money/#/create) a Juicebox project.

You'll need to deploy a payer contract (inside 🔧 Tools)

![Deploy payer](.github/img/payer.png?raw=true)

**Scaffold-eth set up**

Prerequisites: [Node (v16 LTS)](https://nodejs.org/en/download/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)

> clone/fork this repo

Edit the `config.json` in `packages/react-app/src/config.json`:

> Get these from your Juicebox project

```
"juiceBoxProjectId": "",
"juiceboxPayersAddresses":
```

> Configure the NFTs: different NFT levels, with the price and the previously uploaded IPFS metadata

```
"nftName": "JBNFT",
"nftSymbol": "JBNFT",
"nfts": { levels: {} }
```

> install dependencies and start your 👷‍ Hardhat chain:

```bash
yarn install
yarn chain
```

> in a second terminal window, start your 📱 frontend:

```bash
cd scaffold-eth
yarn start
```

> in a third terminal window, 🛰 deploy your contract:

```bash
cd scaffold-eth
yarn deploy
```

🔏 Edit your smart contract in `packages/hardhat/contracts`

📝 Edit your frontend `App.jsx` in `packages/react-app/src`

💼 Edit your deployment scripts in `packages/hardhat/deploy`

📱 Open http://localhost:3000 to see the app

# 📚 Documentation

Documentation, tutorials, challenges, and many more resources, visit: [docs.scaffoldeth.io](https://docs.scaffoldeth.io)
