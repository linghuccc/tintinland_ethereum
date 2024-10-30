import { getImageByCategory, getCategoryLabel } from '@/constants'
import { formatEther } from 'viem'
import BookRoomModal from './BookRoomModal'
import AddReviewModal from './AddReviewModal'

interface RoomCardProps {
	room: any
}

const RoomCard: React.FC<RoomCardProps> = ({ room }) => {
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
						Price per Night: {formatEther(room.pricePerNight)} MHT
					</p>
					<p className="text-sm">Room ID: {room.id?.toString()}</p>
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
							<BookRoomModal room={room}>
								<button className="bg-green-600 text-white p-2 mt-2">
									Book Room
								</button>
							</BookRoomModal>
						)}

						<AddReviewModal roomId={room.id}>
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
