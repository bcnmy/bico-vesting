# UI for Biconomy Token Vesting

- Prod: https://investor.biconomy.io
- Staging: https://investor.staging.biconomy.io

## Running it locally

### Create a wallet connect project
Head over [WalletConnect cloud](https://cloud.walletconnect.com/app) and generate a project ID. Create an `.env.local` file with the following content:
```env
VITE_WALLET_CONNECT_ID="<YOUR_PROJECT_ID>"
```

### Install dependencies
```bash
yarn
```

### Run dev server
```bash
yarn dev
```

### Build the app
```bash
yarn build
```

### Preview the built app
```bash
yarn preview
```
