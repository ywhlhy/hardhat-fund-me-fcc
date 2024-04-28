require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("@nomicfoundation/hardhat-verify");
// require("./tasks/block-number");
require("hardhat-gas-reporter");
// require("@nomiclabs/hardhat-waffle")
require("hardhat-deploy");
require("@nomicfoundation/hardhat-chai-matchers");
// require("@nomiclabs/hardhat-ethers")

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
      gasPrice: 130000000000,
      // blockGasLimit: 5000000000
    },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
      blockConfirmations: 2,
      gasPrice: 20000000000,
      gas: 6000000,
      allowUnlimitedContractSize: true,
      gasLimit: 5000000000,
      timeout: 20000000000,
      blockGasLimit: 50000000000,
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337,
    },
  },
  // solidity: "0.8.24",
  solidity: {
    compilers: [{ version: "0.8.24" }, { version: "0.6.6" }],
  },
  mocha: {
    timeout: 10000000000,
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: false,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    coinmarketcap: COINMARKETCAP_API_KEY,
    token: "ETH",
  },
  namedAccounts: {
    deployer: {
      default: 0, //accounts中的第0个就是deployer,
      1: 0,
    },
    user: {
      default: 1,
    },
  },
};
