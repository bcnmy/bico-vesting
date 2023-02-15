# Welcome to Biconomy investor dashboard contributing guide

The [investor dashboard](https://investor.biconomy.io/) allows investors to claim BICO tokens in lieu of their investments, which were provided at the time of the token launch.

## Getting started

This UI interacts with the vesting smart contract (see [mainnet](https://etherscan.io/address/0xeE3593817fB142BFBEA560fcF47b3f354f519D33) and [testnet](https://goerli.etherscan.io/address/0x483C9102a938D3d1f0bc4dc73bea831A2048D55b)) and allows investors to claim their BICO tokens. The UI uses [Web3Modal](https://web3modal.com) and [Wagmi](https://wagmi.sh) for interacting with wallets and the vesting smart contract.

### Issues

#### Create a new issue

If you spot a problem, search if an issue already exists. If a related issue doesn't exist, please open a new issue.

#### Solve an issue

Scan through our existing issues to find one that interests you. You can narrow down the search using `labels` as filters. If you find an issue to work on, you are welcome to open a PR with a fix.

### Make Changes

#### Make changes locally

1. Fork the repository.
- Using GitHub Desktop:
  - [Getting started with GitHub Desktop](https://docs.github.com/en/desktop/installing-and-configuring-github-desktop/getting-started-with-github-desktop) will guide you through setting up Desktop.
  - Once Desktop is set up, you can use it to [fork the repo](https://docs.github.com/en/desktop/contributing-and-collaborating-using-github-desktop/cloning-and-forking-repositories-from-github-desktop)!

- Using the command line:
  - [Fork the repo](https://docs.github.com/en/github/getting-started-with-github/fork-a-repo#fork-an-example-repository) so that you can make your changes without affecting the original project until you're ready to merge them.

2. Install or update to **Node.js**, at the version specified in `.node-version`. For more information, see [the development guide](contributing/development.md).

3. Create a working branch and start with your changes!

### Commit your update

Commit the changes once you are happy with them.

### Pull Request

When you're finished with the changes, go ahead and make a pull request.
