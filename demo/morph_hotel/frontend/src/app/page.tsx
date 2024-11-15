'use client'

import { useAccount } from 'wagmi'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

import { adminAddress, bookingAbi, bookingAddress } from '@/constants'

import { useReadContract } from 'wagmi'
import RoomCard from '@/components/RoomCard'
import AddRoomModal from '@/components/AddRoomModal'
import SetAvailabilityModal from '@/components/SetAvailabilityModal'

export default function Home() {
	const [rooms, setRooms] = useState<any>([])
	const { address } = useAccount()

	const { data: roomData, refetch } = useReadContract({
		abi: bookingAbi,
		address: bookingAddress,
		functionName: 'getAllRooms',
	})

	useEffect(() => {
		if (roomData) {
			setRooms(roomData)
		}
	}, [roomData])

	const refreshRooms = async () => {
		const newRoomData = await refetch()
		setRooms(newRoomData)
	}

	return (
		<main>
			{address === adminAddress && (
				<section className="py-12 flex items-center justify-between">
					<h1 className="text-lg font-bold">Owner actions</h1>
					<div className="flex items-center gap-2">
						<AddRoomModal onSuccess={refreshRooms}>
							<Button>Add room</Button>
						</AddRoomModal>

						<SetAvailabilityModal onSuccess={refreshRooms}>
							<Button>Set availability</Button>
						</SetAvailabilityModal>
					</div>
				</section>
			)}

			<div>
				{rooms.length > 0 ? (
					rooms?.map((room: any) => (
						<>
							{/* {console.log(room)} */}
							<RoomCard
								key={room.id}
								room={room}
								onSuccess={refreshRooms}
							/>
						</>
					))
				) : (
					<div>
						<h1 className="text-2xl font-semibold">
							No rooms available
						</h1>
					</div>
				)}
			</div>
		</main>
	)
}
