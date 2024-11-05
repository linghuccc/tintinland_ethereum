const { providers, Wallet } = require('ethers')
const hre = require('hardhat')
const ethers = require('ethers')
const { arbLog, requireEnvVariables } = require('arb-shared-dependencies')

requireEnvVariables(['PRIVATE_KEY', 'L1_SEPOLIA_RPC', 'L1_SEPOLIA_ETHERSCAN_KEY', 'L1_CONTRACT_ADDRESS', 'L2_CONTRACT_ADDRESS'])

/**
 * Set up: instantiate L1 / L2 wallets connected to providers
 */
const walletPrivateKey = process.env.PRIVATE_KEY

const l1ContractAddress = process.env.L1_CONTRACT_ADDRESS
const l2ContractAddress = process.env.L2_CONTRACT_ADDRESS

const l1Provider = new providers.JsonRpcProvider(process.env.L1_SEPOLIA_RPC)

const l1Wallet = new Wallet(walletPrivateKey, l1Provider)

const main = async () => {
  await arbLog('Update L2 Contract Address in L1 Contract')

  /**
   * We deploy L1 Greeter to L1, L2 greeter to L2, each with a different "greeting" message.
   * After deploying, save set each contract's counterparty's address to its state so that they can later talk to each other.
   */
  const l1Contract = await hre.ethers.getContractAt('RetryableTicketL1', l1ContractAddress, l1Wallet);
  console.log('Getting L1 Retryable Ticket Contract 👋')

  const updateL1Tx = await l1Contract.updateL2Target(l2ContractAddress)
  await updateL1Tx.wait()

  console.log('L2 Contract Address in L1 Contract successfully Updated 👍')
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
