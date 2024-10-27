import { useWriteContract } from 'wagmi'
import { bookingAbi, bookingAddress } from '@/constants'
import { toast } from 'sonner'
import AddReviewModal from './AddReviewModal'

interface RoomCardProps {
	room: any
}

const RoomCard: React.FC<RoomCardProps> = ({ room }) => {
	const { data: hash, isPending, writeContractAsync } = useWriteContract()

	const getImageByCategory = (category: string) => {
		switch (category) {
			case 'Presidential':
				return '/presidential.jpg'
			case 'Deluxe':
				return '/deluxe.jpg'
			case 'Suite':
				return '/suite.jpg'
			default:
				return '/suite.jpg'
		}
	}

	const getCategoryLabel = (category: number) => {
		switch (category) {
			case 0:
				return 'Presidential'
			case 1:
				return 'Deluxe'
			case 2:
				return 'Suite'
			default:
				return ''
		}
	}

	const handleBookRoom = async () => {
		try {
			const bookRoomTx = await writeContractAsync({
				abi: bookingAbi,
				address: bookingAddress,
				functionName: 'bookRoomByCategory',
				args: [room.category, 224, 2244],
			})

			console.log('room booking hash:', bookRoomTx)
		} catch (err: any) {
			toast.error('Transaction Failed: ' + err.message)
		}
	}

	return (
		<div className="border p-4 m-4">
			<img
				src={getImageByCategory(getCategoryLabel(room.category))}
				alt="Room"
				className="w-full h-100 object-cover mb-4"
			/>

			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-3xl font-bold">
						{getCategoryLabel(room.category)}
					</h3>
					<p className="text-md">
						Price per Night: {room.pricePerNight?.toString()}
					</p>
					<p className="text-sm">
						Availability:{' '}
						{room.isAvailable ? 'Available' : 'Unavailable'}
					</p>
				</div>

				<div>
					<h4 className="text-lg font-semibold mt-2">Reviews:</h4>
					{room.reviews?.length > 0 ? (
						room.reviews.map((review: any, index: any) => (
							<div className="text-sm" key={index}>
								<p className="">
									{review.comment} - {review.rating} stars
								</p>
							</div>
						))
					) : (
						<p>No reviews yet.</p>
					)}

					<div className="flex gap-3">
						{room.isAvailable && (
							<button
								onClick={handleBookRoom}
								disabled={isPending}
								className="bg-green-600 text-white p-2 mt-2"
							>
								{isPending ? 'Loading' : 'Book Room'}
							</button>
						)}

						<AddReviewModal>
							<button className="bg-gray-600 text-white p-2 mt-2">
								Add Review
							</button>
						</AddReviewModal>
					</div>
				</div>
			</div>
		</div>
	)
}

export default RoomCard
