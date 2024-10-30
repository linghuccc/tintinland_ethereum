'use client'

import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useEffect } from 'react'
import {
	tokenAbi,
	tokenAddress,
	bookingAbi,
	bookingAddress,
	getCategoryLabel,
} from '@/constants'
import { toast } from 'sonner'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'

import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface BookRoomModalProps {
	children: React.ReactNode
	room: any
}

const BookRoomModal: React.FC<BookRoomModalProps> = ({ children, room }) => {
	const {
		data: hash,
		error,
		isPending,
		writeContractAsync,
	} = useWriteContract()

	const { isLoading: isConfirming, isSuccess: isConfirmed } =
		useWaitForTransactionReceipt({
			hash,
		})

	useEffect(() => {
		if (isConfirming) {
			toast.loading('Transaction Pending')
		}
		if (isConfirmed) {
			toast.success('Transaction Successful', {
				action: {
					label: 'View on Etherscan',
					onClick: () => {
						window.open(
							`https://explorer-holesky.morphl2.io/tx/${hash}`
						)
					},
				},
			})
		}
		if (error) {
			toast.error('Transaction Failed')
		}
	}, [isConfirming, isConfirmed, error, hash])

	const formSchema = z.object({
		checkInDate: z.string().min(1),
		duration: z.any(),
	})

	// Get today's date formatted as YYYY-MM-DD
	const today = new Date()
	const formattedToday = today.toISOString().split('T')[0]

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			checkInDate: formattedToday,
			duration: 3,
		},
	})

	const BookRoom = async (data: z.infer<typeof formSchema>) => {
		// console.log(data.checkInDate)
		// console.log(data.duration)
		// Convert duration from string to number
		const duration = Number(data.duration)
		// Validate the converted duration
		if (duration < 1) {
			toast.error('Duration can not be less than 1')
			return
		}
		if (duration > 100) {
			toast.error('Duration can not be more than 100')
			return
		}

		try {
			// const tokenApprovalTx = await writeContractAsync({
			// 	abi: tokenAbi,
			// 	address: tokenAddress,
			// 	functionName: 'approve',
			// 	args: [bookingAddress, room.pricePerNight * BigInt(duration)],
			// })

			// console.log('token approval hash:', tokenApprovalTx)

			// Wait for the token approval transaction to be confirmed
			// const provider = new ethers.providers.Web3Provider(window.ethereum)
			// const receipt = await provider.waitForTransaction(tokenApprovalTx)

			// if (receipt.status === 1) {
			// 	console.log('Token approval transaction confirmed')

			// Proceed with booking the room only after successful token approval
			const bookRoomTx = await writeContractAsync({
				abi: bookingAbi,
				address: bookingAddress,
				functionName: 'bookRoomByRoomId',
				args: [room.id, data.checkInDate, duration],
			})

			console.log('room booking hash:', bookRoomTx)
			// } else {
			// 	console.error('Token approval transaction failed')
			// }
		} catch (err: any) {
			toast.error('Transaction Failed: ' + err.message)
		}
	}

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						<div className="flex items-center gap-6 justify-end h-8">
							<AlertDialogCancel className="text-gray-600 hover:text-gray-900 border-none">
								&times; {/* Close symbol */}
							</AlertDialogCancel>
						</div>
						<div className="flex items-center gap-6 justify-center">
							<h1>Book Room</h1>
						</div>
					</AlertDialogTitle>
				</AlertDialogHeader>
				<div>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(BookRoom)}
							className="space-y-8"
						>
							<div>
								<FormLabel className="">
									<h1 className="text-[#32393A]">
										Room Category:{' '}
										{getCategoryLabel(room.category)}
									</h1>
								</FormLabel>
							</div>

							<div>
								<FormLabel className="">
									<h1 className="text-[#32393A]">
										Room ID: {room.id.toString()}
									</h1>
								</FormLabel>
							</div>

							<FormField
								control={form.control}
								name="checkInDate"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="">
											<h1 className="text-[#32393A]">
												Check-In Date
											</h1>
										</FormLabel>
										<FormControl>
											<Input
												className="rounded-full"
												type="date"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="duration"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="">
											<h1 className="text-[#32393A]">
												Duration (Days)
											</h1>
										</FormLabel>
										<FormControl>
											<Input
												className="rounded-full"
												type="number"
												placeholder="3"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<Button
								className="bg-[#007A86] self-center my-8 rounded-full w-full"
								size="lg"
								disabled={isPending}
								type="submit"
							>
								{isPending ? 'Loading' : 'Submit'}
							</Button>
						</form>
					</Form>
				</div>
			</AlertDialogContent>
		</AlertDialog>
	)
}

export default BookRoomModal
