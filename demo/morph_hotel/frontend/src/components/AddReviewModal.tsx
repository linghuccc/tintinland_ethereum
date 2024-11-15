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

interface AddReviewModalProps {
	children: React.ReactNode
	roomId: bigint
	onSuccess: () => void
}

const AddReviewModal: React.FC<AddReviewModalProps> = ({
	children,
	roomId,
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
		rating: z.any(),
		comment: z.string().min(1),
	})

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			rating: undefined,
			comment: undefined,
		},
	})

	const AddReview = async (data: z.infer<typeof formSchema>) => {
		// Convert rating from string to number
		const rating = Number(data.rating)
		const comment = data.comment

		// Validate the converted rating
		if (rating < 1) {
			toast.error('Rating can not be less than 1')
			return
		}
		if (rating > 5) {
			toast.error('Rating can not be more than 5')
			return
		}

		try {
			const addReviewTx = await writeContractAsync({
				abi: bookingAbi,
				address: bookingAddress,
				functionName: 'addReview',
				args: [roomId, rating, comment],
			})

			console.log('room transaction hash:', addReviewTx)
			onSuccess()
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
							<h1>Add Room Review</h1>
						</div>
					</AlertDialogTitle>
				</AlertDialogHeader>
				<div>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(AddReview)}
							className="space-y-8"
						>
							{/* Display roomId as a label only */}
							<FormLabel className="">
								<h1 className="text-[#32393A]">Room ID: {roomId.toString()}</h1>
							</FormLabel>
							<FormField
								control={form.control}
								name="rating"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="">
											<h1 className="text-[#32393A]">
												Rating
											</h1>
										</FormLabel>
										<FormControl>
											<div className="flex justify-between">
												{[1, 2, 3, 4, 5].map(
													(value) => (
														<label
															key={value}
															className="flex items-center"
														>
															<input
																type="radio"
																value={value}
																checked={
																	field.value ===
																	value.toString()
																}
																onChange={() =>
																	field.onChange(
																		value.toString()
																	)
																}
																className="mr-2"
															/>
															{value}{' '}
															{value === 1
																? 'star'
																: 'stars'}
														</label>
													)
												)}
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="comment"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="">
											<h1 className="text-[#32393A]">
												Comments
											</h1>
										</FormLabel>
										<FormControl>
											<Input
												className="rounded-full"
												placeholder="Please enter comment here"
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

export default AddReviewModal
