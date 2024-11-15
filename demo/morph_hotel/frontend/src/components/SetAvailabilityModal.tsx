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
import { bookingAbi, bookingAddress } from '@/constants'
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

interface SetAvailabilityModalProps {
	children: React.ReactNode
	onSuccess: () => void
}
const SetAvailabilityModal = ({
	children,
	onSuccess,
}: SetAvailabilityModalProps) => {
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
		roomId: z.any(),
		availability: z.any(),
	})

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			roomId: undefined,
			availability: undefined,
		},
	})

	const SetAvailability = async (data: z.infer<typeof formSchema>) => {
		// console.log(data)
		try {
			const room_id = Number(data.roomId)
			const availability = data.availability === 'true'

			const addRoomTx = await writeContractAsync({
				address: bookingAddress,
				abi: bookingAbi,
				functionName: 'setRoomAvailability',
				args: [room_id, availability],
			})

			console.log('room transaction hash:', addRoomTx)
			onSuccess()
		} catch (err: any) {
			toast.error('Transaction Failed: ' + err.message)
			console.log('Transaction Failed: ' + err.message)
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
							<h1>Set Room Availability</h1>
						</div>
					</AlertDialogTitle>
				</AlertDialogHeader>
				<div className="px-6">
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(SetAvailability)}
							className="space-y-8"
						>
							<FormField
								control={form.control}
								name="roomId"
								render={({ field }) => (
									<FormItem className="flex items-center">
										<FormLabel className="w-1/3">
											<h1 className="text-[#32393A]">
												Room ID
											</h1>
										</FormLabel>
										<FormControl className="w-2/3">
											<Input
												className="rounded-full"
												type="number"
												placeholder="Please enter Room ID here"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="availability"
								render={({ field }) => (
									<FormItem className="flex items-center">
										<FormLabel className="w-1/3">
											<h1 className="text-[#32393A]">
												Room Availability
											</h1>
										</FormLabel>
										<FormControl>
											<div className="flex w-2/3 justify-between px-6">
												<label className="flex items-center">
													<input
														type="radio"
														value="true" // Represents Available
														checked={
															field.value ===
															'true'
														}
														onChange={() =>
															field.onChange(
																'true'
															)
														} // Set to true
														className="mr-2"
													/>
													Available
												</label>
												<label className="flex items-center">
													<input
														type="radio"
														value="false" // Represents Not Available
														checked={
															field.value ===
															'false'
														}
														onChange={() =>
															field.onChange(
																'false'
															)
														} // Set to false
														className="mr-2"
													/>
													Not Available
												</label>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="h-2"></div>
							<Button
								className="bg-[#007A86] self-center rounded-full w-full"
								size="lg"
							    disabled={isPending || isConfirming}
								type="submit"
							>
								{isPending ? 'Pending' : isConfirming ? 'Waiting' : 'Submit'}
							</Button>
						</form>
					</Form>
				</div>
			</AlertDialogContent>
		</AlertDialog>
	)
}

export default SetAvailabilityModal
