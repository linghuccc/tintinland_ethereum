'use client'
import { useEffect, useState } from 'react'
import { contractFactoryAbi, contractFactory } from '@/constants'
import { Button } from '@/components/ui/button'
import { useReadContract } from 'wagmi'
import AuctionCard from '@/components/AuctionCard'
import AddAuctionModal from '@/components/AddAuctionModal'

export default function Home() {
	const [auctionAddresses, setAuctionAddresses] = useState<any>([])

	const { data: auctionData } = useReadContract({
		abi: contractFactoryAbi,
		address: contractFactory,
		functionName: 'getAuctions',
	})

	useEffect(() => {
		if (auctionData) {
			setAuctionAddresses(auctionData)
		}
	}, [auctionData])

	return (
		<main>
			<section className="py-6 flex justify-between items-center text-center ">
				<h1 className="text-2xl font-bold">DoDo Public Auction</h1>

				<AddAuctionModal>
					<Button>Start a new Auction</Button>
				</AddAuctionModal>
			</section>

			<div className="container mx-auto py-4">
				<h1 className="text-2xl font-bold mb-6">Auctions</h1>
				<div className="flex gap-4 flex-wrap">
					{auctionAddresses.length > 0 ? (
						auctionAddresses
							.toReversed()
							.map((auctionAddress: any, index: number) => (
								<AuctionCard
									key={index}
									auctionAddress={auctionAddress}
								/>
							))
					) : (
						<div>
							<h1 className="text-2xl font-semibold">
								No auction available
							</h1>
						</div>
					)}
				</div>
			</div>
		</main>
	)
}
