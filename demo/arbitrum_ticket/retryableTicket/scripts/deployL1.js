const { providers, Wallet } = require('ethers')
const hre = require('hardhat')
const ethers = require('ethers')
const { arbLog, requireEnvVariables } = require('arb-shared-dependencies')
const {
  EthBridger,
  getL2Network,
} = require('@arbitrum/sdk')
requireEnvVariables(['PRIVATE_KEY', 'L1_SEPOLIA_RPC', 'L2_ARB_SEPOLIA_RPC', 'L1_SEPOLIA_ETHERSCAN_KEY'])

/**
 * Set up: instantiate L1 / L2 wallets connected to providers
 */
const walletPrivateKey = process.env.PRIVATE_KEY

const l1Provider = new providers.JsonRpcProvider(process.env.L1_SEPOLIA_RPC)
const l2Provider = new providers.JsonRpcProvider(process.env.L2_ARB_SEPOLIA_RPC)

const l1EtherscanKey = process.env.L1_SEPOLIA_ETHERSCAN_KEY

const l1Wallet = new Wallet(walletPrivateKey, l1Provider)

const main = async () => {
  await arbLog('Deploy L1 Contract and Verify')

  /**
   * Use l2Network to create an Arbitrum SDK EthBridger instance
   * We'll use EthBridger to retrieve the Inbox address
   */

  const l2Network = await getL2Network(l2Provider)
  const ethBridger = new EthBridger(l2Network)
  const inboxAddress = ethBridger.l2Network.ethBridge.inbox

  /**
   * We deploy L1 Greeter to L1, L2 greeter to L2, each with a different "greeting" message.
   * After deploying, save set each contract's counterparty's address to its state so that they can later talk to each other.
   */
  const L1Contract = await (
    await hre.ethers.getContractFactory('RetryableTicketL1')
  ).connect(l1Wallet) //
  console.log('Deploying L1 Retryable Ticket Contract👋')

  const boolValue = false
  const uintValue = 111111
  const addressValue = '0x1111111111111111111111111111111111111111'
  const stringValue = 'Hello world in L1'

  const l1Contract = await L1Contract.deploy(
    boolValue,
    uintValue,
    addressValue,
    stringValue,
    ethers.constants.AddressZero, // temp l2 addr
    inboxAddress
  )
  await l1Contract.deployed()
  console.log(`Deployed to ${l1Contract.address}`)

  // Verify L1 contracts
  await hre.run('verify:verify', {
    address: l1Contract.address,
    constructorArguments: [
      boolValue,
      uintValue,
      addressValue,
      stringValue,
      ethers.constants.AddressZero,
      inboxAddress,
    ],
  });
  console.log('L1 Contract Verified on Etherscan!');
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
