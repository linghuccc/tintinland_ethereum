import Image from 'next/image'
import { Button } from './ui/button'
import BidModal from './BidModal'

interface AuctionCardProps {
	auction: any
}

const AuctionCard: React.FC<AuctionCardProps> = ({ auction }) => {
	return (
		<div className=" w-96 text-black rounded overflow-hidden shadow-lg bg-white flex-shrink-0">
			<Image
				width={600}
				height={400}
				className="w-full h-48 object-cover"
				src={
					'https://img.freepik.com/free-photo/house-isolated-field_1303-23773.jpg'
				}
				alt="auction"
			/>
			<div className="px-6 mt-6">
				<div className="font-bold text-xl mb-8">
					A Beautiful House in Rural Spain
				</div>
				<div className="text-gray-700 font-medium text-base ml-4 mb-2">
					Current Highest Bid: 0 ETH
				</div>
				<div className="text-gray-700 font-medium text-base ml-4 mb-2">
					Bid Cooldown Time: 30 seconds
				</div>
				<div className="text-gray-700 font-medium text-base ml-4 mb-8">
					Bid End Time: 2024 Nov 7, 20:30
				</div>

				<div className="flex justify-center mb-6">
					<BidModal
						auctionAddress={
							'0x71356af980E735DDeA8BAB512521016D77fCDfAA'
						}
					>
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
