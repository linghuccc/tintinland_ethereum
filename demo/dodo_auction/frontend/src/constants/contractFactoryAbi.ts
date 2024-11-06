export const contractFactoryAbi = [
	{
		type: 'function',
		name: 'auctions',
		inputs: [{ name: '', type: 'uint256', internalType: 'uint256' }],
		outputs: [
			{
				name: '',
				type: 'address',
				internalType: 'contract PublicAuction',
			},
		],
		stateMutability: 'view',
	},
	{
		type: 'function',
		name: 'createAuction',
		inputs: [
			{ name: '_beneficiary', type: 'address', internalType: 'address' },
			{ name: '_biddingTime', type: 'uint256', internalType: 'uint256' },
			{ name: '_cooldownTime', type: 'uint256', internalType: 'uint256' },
		],
		outputs: [
			{
				name: '',
				type: 'address',
				internalType: 'contract PublicAuction',
			},
		],
		stateMutability: 'nonpayable',
	},
	{
		type: 'function',
		name: 'getAuctions',
		inputs: [],
		outputs: [
			{
				name: '',
				type: 'address[]',
				internalType: 'contract PublicAuction[]',
			},
		],
		stateMutability: 'view',
	},
]
