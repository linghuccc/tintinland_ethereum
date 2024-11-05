const { providers, Wallet } = require('ethers')
const hre = require('hardhat')
const ethers = require('ethers')
const { arbLog, requireEnvVariables } = require('arb-shared-dependencies')
requireEnvVariables(['PRIVATE_KEY', 'L1_CONTRACT_ADDRESS', 'L2_ARB_SEPOLIA_RPC', 'L2_ARB_SEPOLIA_ETHERSCAN_KEY'])

/**
 * Set up: instantiate L1 / L2 wallets connected to providers
 */
const walletPrivateKey = process.env.PRIVATE_KEY

const l1ContractAddress = process.env.L1_CONTRACT_ADDRESS

const l2Provider = new providers.JsonRpcProvider(process.env.L2_ARB_SEPOLIA_RPC)

const l2EtherscanKey = process.env.L2_ARB_SEPOLIA_ETHERSCAN_KEY

const l2Wallet = new Wallet(walletPrivateKey, l2Provider)

const main = async () => {
  await arbLog('Deploy L2 Contract and Verify')

  const L2Contract = await (
    await hre.ethers.getContractFactory('RetryableTicketL2')
  ).connect(l2Wallet)

  console.log('Deploying L2 Retryable Ticket Contract 👋👋')

  const boolValue = false
  const uintValue = 222222
  const addressValue = '0x2222222222222222222222222222222222222222'
  const stringValue = 'Hello world in L2'

  const l2Contract = await L2Contract.deploy(
    boolValue,
    uintValue,
    addressValue,
    stringValue,
    l1ContractAddress
  )
  await l2Contract.deployed()
  console.log(`Deployed to ${l2Contract.address}`)

  // Verify L2 contracts
  await hre.run('verify:verify', {
    address: l2Contract.address,
    constructorArguments: [
      boolValue,
      uintValue,
      addressValue,
      stringValue,
      l1ContractAddress,
    ],
  });
  console.log('L2 Contract Verified on Etherscan!');
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
