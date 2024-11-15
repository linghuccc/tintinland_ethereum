'use client'

import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useState, useEffect } from 'react'
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
	onSuccess: () => void
}

const BookRoomModal: React.FC<BookRoomModalProps> = ({
	children,
	room,
	onSuccess,
}) => {
	const [isOpen, setIsOpen] = useState(false)

	// const handleOpen = () => setIsOpen(true)
	const handleClose = () => setIsOpen(false)

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
		let loadingToast: string | undefined // Declare the type of loadingToast

		if (isConfirming) {
			loadingToast = toast.loading('Transaction Pending') as string // Use type assertion
		}

		if (isConfirmed) {
			if (loadingToast) {
				toast.dismiss(loadingToast) // Dismiss the loading toast
			}
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
			setIsOpen(false)
		}
		if (error) {
			if (loadingToast) {
				toast.dismiss(loadingToast) // Dismiss the loading toast
			}
			toast.error('Transaction Failed')
		}

		// Cleanup function to dismiss the loading toast if the component unmounts
		return () => {
			if (loadingToast) {
				toast.dismiss(loadingToast)
			}
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
		console.log(room.id)
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
			const tokenApprovalTx = await writeContractAsync({
				abi: tokenAbi,
				address: tokenAddress,
				functionName: 'approve',
				args: [bookingAddress, room.pricePerNight * BigInt(duration)],
			})

			console.log('token approval hash:', tokenApprovalTx)

			// Proceed with booking the room only after successful token approval
			const bookRoomTx = await writeContractAsync({
				abi: bookingAbi,
				address: bookingAddress,
				functionName: 'bookRoomByRoomId',
				args: [room.id, data.checkInDate, duration],
			})

			console.log('room booking hash:', bookRoomTx)
		} catch (err: any) {
			toast.error('Transaction Failed: ' + err.message)
		}
	}
	return (
		<AlertDialog open={isOpen} onOpenChange={setIsOpen}>
			<AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						<div className="flex items-center gap-6 justify-end h-8">
							<AlertDialogCancel
								onClick={handleClose}
								className="text-gray-600 hover:text-gray-900 border-none"
							>
								&times; {/* Close symbol */}
							</AlertDialogCancel>
						</div>
						<div className="flex items-center gap-6 justify-center mb-8">
							<h1>Book Room</h1>
						</div>
					</AlertDialogTitle>
				</AlertDialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(BookRoom)} className="">
						<div className="flex items-center mb-8">
							<FormLabel className="w-1/2">
								<h1 className="text-[#32393A]">
									Room Category
								</h1>
							</FormLabel>
							<FormLabel className="w-1/2">
								<h1 className="text-[#32393A]">
									{getCategoryLabel(room.category)}
								</h1>
							</FormLabel>
						</div>

						<div className="flex items-center mb-4">
							<FormLabel className="w-1/2">
								<h1 className="text-[#32393A]">Room ID</h1>
							</FormLabel>
							<FormLabel className="w-1/2">
								<h1 className="text-[#32393A]">
									{room.id.toString()}
								</h1>
							</FormLabel>
						</div>

						<FormField
							control={form.control}
							name="checkInDate"
							render={({ field }) => (
								<FormItem className="flex items-center space-y-2">
									<FormLabel className="w-1/2">
										<h1 className="text-[#32393A]">
											Check-In Date
										</h1>
									</FormLabel>
									<FormControl className="w-1/2">
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
								<FormItem className="flex items-center space-y-2">
									<FormLabel className="w-1/2">
										<h1 className="text-[#32393A]">
											Duration (Days)
										</h1>
									</FormLabel>
									<FormControl className="w-1/2">
										<Input
											className="rounded-full"
											type="number"
											placeholder="Please enter duration here"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="h-2"></div>
						<Button
							className="bg-[#007A86] self-center my-8 rounded-full w-full"
							size="lg"
							disabled={isPending || isConfirming}
							type="submit"
						>
							{isPending
								? 'Pending'
								: isConfirming
								? 'Waiting'
								: 'Submit'}
						</Button>
					</form>
				</Form>
			</AlertDialogContent>
		</AlertDialog>
	)
}

export default BookRoomModal
