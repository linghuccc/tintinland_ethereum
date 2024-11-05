const { providers, Wallet } = require('ethers')
const hre = require('hardhat')
const ethers = require('ethers')
const { arbLog, requireEnvVariables } = require('arb-shared-dependencies')
requireEnvVariables(['PRIVATE_KEY', 'L1_SEPOLIA_RPC', 'L2_ARB_SEPOLIA_RPC', 'L1_CONTRACT_ADDRESS', 'L2_CONTRACT_ADDRESS'])

/**
 * Set up: instantiate L1 / L2 wallets connected to providers
 */
const walletPrivateKey = process.env.PRIVATE_KEY

const l1ContractAddress = process.env.L1_CONTRACT_ADDRESS
const l2ContractAddress = process.env.L2_CONTRACT_ADDRESS

const l1Provider = new providers.JsonRpcProvider(process.env.L1_SEPOLIA_RPC)
const l2Provider = new providers.JsonRpcProvider(process.env.L2_ARB_SEPOLIA_RPC)

const l1Wallet = new Wallet(walletPrivateKey, l1Provider)
const l2Wallet = new Wallet(walletPrivateKey, l2Provider)

const main = async () => {
  await arbLog('Show Values')

  const l1Contract = await hre.ethers.getContractAt('RetryableTicketL1', l1ContractAddress, l1Wallet);
  console.log('Getting L1 RetryableTicket Contract 👋')

  /**
   * Let's log the L1 values
   */
  const [currentL1Bool, currentL1Uint, currentL1Address, currentL1String] = await l1Contract.showValues()
  console.log(`Current L1 boolean value: "${currentL1Bool}"`)
  console.log(`Current L1 uint256 value: "${currentL1Uint}"`)
  console.log(`Current L1 address value: "${currentL1Address}"`)
  console.log(`Current L1 string value: "${currentL1String}"`)
  console.log()

  const l2Contract = await hre.ethers.getContractAt('RetryableTicketL2', l2ContractAddress, l2Wallet);
  console.log('Getting L2 RetryableTicket Contract 👋')

  /**
   * Let's log the L2 values
   */
  const [currentL2Bool, currentL2Uint, currentL2Address, currentL2String] = await l2Contract.showValues()
  console.log(`Current L2 boolean value: "${currentL2Bool}"`)
  console.log(`Current L2 uint256 value: "${currentL2Uint}"`)
  console.log(`Current L2 address value: "${currentL2Address}"`)
  console.log(`Current L2 string value: "${currentL2String}"`)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
