import Image from 'next/image'
import { Button } from './ui/button'
import { useEffect, useState } from 'react'
import { publicAuctionAbi } from '@/constants'
import { formatEther } from 'viem'
import { useReadContract } from 'wagmi'
import BidModal from './BidModal'

interface Auction {
	address: string
	title: string
	imageUrl: string
	highestBid: string
	cooldownTime: number
}

interface AuctionCardProps {
	auctionAddress: any
}

const AuctionCard: React.FC<AuctionCardProps> = ({ auctionAddress }) => {
	// State to hold the auction object
	const [auction, setAuction] = useState({
		address: auctionAddress,
		title: '',
		imageUrl: '',
		highestBid: '0',
		cooldownTime: 0,
	})

	const { data: titleData } = useReadContract({
		abi: publicAuctionAbi,
		address: auctionAddress,
		functionName: 'title',
	})

	const { data: imageUrlData } = useReadContract({
		abi: publicAuctionAbi,
		address: auctionAddress,
		functionName: 'imageUrl',
	})

	const { data: highestBidData } = useReadContract({
		abi: publicAuctionAbi,
		address: auctionAddress,
		functionName: 'highestBid',
	})

	const { data: cooldownTimeData } = useReadContract({
		abi: publicAuctionAbi,
		address: auctionAddress,
		functionName: 'cooldownTime',
	})

	// useEffect to update the auction object when any data changes
	useEffect(() => {
		setAuction({
			address: auctionAddress,
			title: (titleData as string) || '', // Ensure it's a string
			imageUrl: (imageUrlData as string) || '', // Ensure it's a string
			highestBid:
				highestBidData && typeof highestBidData !== 'object' // Ensure it's not an object
					? formatEther(highestBidData as bigint) // Cast to bigint if necessary
					: '0', // Convert to ETH amount
			cooldownTime: cooldownTimeData ? Number(cooldownTimeData) : 0, // Convert to number
		})
	}, [
		auctionAddress,
		titleData,
		imageUrlData,
		highestBidData,
		cooldownTimeData,
	])

	// console.log(auctionAddress)

	return (
		<div className=" w-96 text-black rounded overflow-hidden shadow-lg bg-white flex-shrink-0">
			<Image
				width={600}
				height={400}
				className="w-full h-48 object-cover"
				src={auction.imageUrl}
				alt="auction"
			/>
			<div className="px-6 mt-6">
				<div
					className="font-bold text-xl mb-8 overflow-hidden h-16 line-clamp-2"
					style={{
						display: '-webkit-box',
						WebkitBoxOrient: 'vertical',
						overflow: 'hidden',
						WebkitLineClamp: 2,
					}}
				>
					{auction.title}
				</div>
				<div className="text-gray-700 font-medium text-base ml-4 mb-2">
					Current Highest Bid: {auction.highestBid} ETH
				</div>
				<div className="text-gray-700 font-medium text-base ml-4 mb-2">
					Bid Cooldown Time: {auction.cooldownTime} seconds
				</div>
				<div className="text-gray-700 font-medium text-base ml-4 mb-8">
					Bid End Time: 2024 Nov 7, 20:30
				</div>

				<div className="flex justify-center mb-6">
					<BidModal auction={auction}>
						<Button
							size="lg"
							className="items-center bg-slate-600 text-white hover:bg-blue-900"
						>
							Bid
						</Button>
					</BidModal>
				</div>
			</div>
		</div>
	)
}

export default AuctionCard
