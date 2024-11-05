const { providers, Wallet } = require('ethers')
const { BigNumber } = require('@ethersproject/bignumber')
const hre = require('hardhat')
const ethers = require('ethers')
const {
  L1ToL2MessageGasEstimator,
} = require('@arbitrum/sdk/dist/lib/message/L1ToL2MessageGasEstimator')
const { arbLog, requireEnvVariables } = require('arb-shared-dependencies')
const {
  L1TransactionReceipt,
  L1ToL2MessageStatus,
} = require('@arbitrum/sdk')
const { getBaseFee } = require('@arbitrum/sdk/dist/lib/utils/lib')
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
  await arbLog('Cross-chain Retryable Ticket Demo')

  const l1Contract = await hre.ethers.getContractAt('RetryableTicketL1', l1ContractAddress, l1Wallet);
  console.log('Getting L1 Retryable Ticket Contract 👋')

  const l2Contract = await hre.ethers.getContractAt('RetryableTicketL2', l2ContractAddress, l2Wallet);
  console.log('Getting L2 Retryable Ticket Contract 👋')

  /**
   * Let's log the L2 values
   */
  const [currentL2Bool, currentL2Uint, currentL2Address, currentL2String] = await l2Contract.showValues()
  console.log(`Current L2 boolean value: "${currentL2Bool}"`)
  console.log(`Current L2 uint256 value: "${currentL2Uint}"`)
  console.log(`Current L2 address value: "${currentL2Address}"`)
  console.log(`Current L2 string value: "${currentL2String}"`)
  console.log()

  console.log('Updating Values from L1 to L2:')

  /**
   * Here we have a new greeting message that we want to set as the L2 greeting; we'll be setting it by sending it as a message from layer 1!!!
   */
  const newBool = true
  const newUint = 666666
  const newAddress = '0x6666666666666666666666666666666666666666'
  const newString = 'RetryableTicket from far, far away'

  /**
   * Now we can query the required gas params using the estimateAll method in Arbitrum SDK
   */
  const l1ToL2MessageGasEstimate = new L1ToL2MessageGasEstimator(l2Provider)

  /**
   * To be able to estimate the gas related params to our L1-L2 message, we need to know how many bytes of calldata out retryable ticket will require
   * i.e., we need to calculate the calldata for the function being called (setRetryableTicket())
   */
  const ABI = ['function setValues(bool _myBool, uint256 _myUint, address _myAddress, string _myString)']
  const iface = new ethers.utils.Interface(ABI)
  const calldata = iface.encodeFunctionData('setValues', [newBool, newUint, newAddress, newString])

  /**
   * Users can override the estimated gas params when sending an L1-L2 message
   * Note that this is totally optional
   * Here we include and example for how to provide these overriding values
   */

  const RetryablesGasOverrides = {
    gasLimit: {
      base: undefined, // when undefined, the value will be estimated from rpc
      min: BigNumber.from(10000), // set a minimum gas limit, using 10000 as an example
      percentIncrease: BigNumber.from(30), // how much to increase the base for buffer
    },
    maxSubmissionFee: {
      base: undefined,
      percentIncrease: BigNumber.from(30),
    },
    maxFeePerGas: {
      base: undefined,
      percentIncrease: BigNumber.from(30),
    },
  }

  /**
   * The estimateAll method gives us the following values for sending an L1->L2 message
   * (1) maxSubmissionCost: The maximum cost to be paid for submitting the transaction
   * (2) gasLimit: The L2 gas limit
   * (3) deposit: The total amount to deposit on L1 to cover L2 gas and L2 call value
   */
  const L1ToL2MessageGasParams = await l1ToL2MessageGasEstimate.estimateAll(
    {
      from: await l1Contract.address,
      to: await l2Contract.address,
      l2CallValue: 0,
      excessFeeRefundAddress: await l2Wallet.address,
      callValueRefundAddress: await l2Wallet.address,
      data: calldata,
    },
    await getBaseFee(l1Provider),
    l1Provider,
    RetryablesGasOverrides //if provided, it will override the estimated values. Note that providing "RetryablesGasOverrides" is totally optional.
  )
  console.log(
    `Current retryable base submission price is: ${L1ToL2MessageGasParams.maxSubmissionCost.toString()}`
  )

  /**
   * For the L2 gas price, we simply query it from the L2 provider, as we would when using L1
   */
  const gasPriceBid = await l2Provider.getGasPrice()
  console.log(`L2 gas price: ${gasPriceBid.toString()}`)

  console.log(
    `Sending to L2 with ${L1ToL2MessageGasParams.deposit.toString()} callValue for L2 fees:`
  )
  const setRetryableTicketTx = await l1Contract.setValuesInL2(
    newBool, newUint, newAddress, newString,
    L1ToL2MessageGasParams.maxSubmissionCost,
    L1ToL2MessageGasParams.gasLimit,
    gasPriceBid,
    {
      value: L1ToL2MessageGasParams.deposit,
    }
  )
  const setRetryableTicketRec = await setRetryableTicketTx.wait()

  console.log(
    `RetryableTicket txn confirmed on L1! 🙌 ${setRetryableTicketRec.transactionHash}`
  )

  const l1TxReceipt = new L1TransactionReceipt(setRetryableTicketRec)

  /**
   * In principle, a single L1 txn can trigger any number of L1-to-L2 messages (each with its own sequencer number).
   * In this case, we know our txn triggered only one
   * Here, We check if our L1 to L2 message is redeemed on L2
   */
  const messages = await l1TxReceipt.getL1ToL2Messages(l2Wallet)
  const message = messages[0]
  console.log('Waiting for the L2 execution of the transaction. This may take up to 10-15 minutes ⏰')
  const messageResult = await message.waitForStatus()
  const status = messageResult.status
  if (status === L1ToL2MessageStatus.REDEEMED) {
    console.log(
      `L2 retryable ticket is executed 🥳 ${messageResult.l2TxReceipt.transactionHash}`
    )
  } else {
    console.log(
      `L2 retryable ticket is failed with status ${L1ToL2MessageStatus[status]}`
    )
  }

  /**
   * Note that during L2 execution, a retryable's sender address is transformed to its L2 alias.
   * Thus, when RetryableTicketL2 checks that the message came from the L1, we check that the sender is this L2 Alias.
   * See setRetryableTicket in RetryableTicketL2.sol for this check.
   */

  /**
   * Now when we call greet again, we should see our new string on L2!
   */
  const [newL2Bool, newL2Uint, newL2Address, newL2String] = await l2Contract.showValues()
  console.log()
  console.log(`Updated L2 boolean value: "${newL2Bool}"`)
  console.log(`Updated L2 uint256 value: "${newL2Uint}"`)
  console.log(`Updated L2 address value: "${newL2Address}"`)
  console.log(`Updated L2 string value: "${newL2String}"`)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
