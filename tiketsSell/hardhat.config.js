/** @type import('hardhat/config').HardhatUserConfig */
require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("dotenv").config();

const SEPOLIA_URL = process.env.SEPOLIA_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports = {
  solidity: "0.8.18",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    sepolia: {
      url: SEPOLIA_URL,
      accounts: [PRIVATE_KEY],
    },
  },
};
