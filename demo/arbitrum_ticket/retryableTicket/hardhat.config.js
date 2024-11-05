require('@nomiclabs/hardhat-ethers');
require('@nomicfoundation/hardhat-verify');
const { hardhatConfig } = require('arb-shared-dependencies')

const networks = {
    sepolia: {
        url: process.env.L1_SEPOLIA_RPC,
        accounts: [process.env.PRIVATE_KEY],
    },
    arbitrumSepolia: {
        url: process.env.L2_ARB_SEPOLIA_RPC,
        accounts: [process.env.PRIVATE_KEY],
    },
};

const etherscan = {
    apiKey: {
        sepolia: process.env.L1_SEPOLIA_ETHERSCAN_KEY,
        arbitrumSepolia: process.env.L2_ARB_SEPOLIA_ETHERSCAN_KEY,
    }
}
module.exports = {
    ...hardhatConfig,
    networks,
    etherscan,
};
