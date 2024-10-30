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
}
const SetAvailabilityModal = ({ children }: SetAvailabilityModalProps) => {
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
		roomId: z.any(),
		availability: z.any(),
	})

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			roomId: 0,
			availability: undefined,
		},
	})

	const SetAvailability = async (data: z.infer<typeof formSchema>) => {
		console.log(data)
		try {
			const availability = data.availability === 'true'

			const addRoomTx = await writeContractAsync({
				address: bookingAddress,
				abi: bookingAbi,

				functionName: 'setRoomAvailability',
				args: [data.roomId, availability],
			})

			console.log('room transaction hash:', addRoomTx)
		} catch (err: any) {
			toast.error('Transaction Failed: ' + err.message)
			console.log('Transaction Failed: ' + err.message)
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
							<h1>Set Room Availability</h1>
						</div>
					</AlertDialogTitle>
				</AlertDialogHeader>
				<div>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(SetAvailability)}
							className="space-y-8"
						>
							<FormField
								control={form.control}
								name="roomId"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="">
											<h1 className="text-[#32393A]">
												Room ID
											</h1>
										</FormLabel>
										<FormControl>
											<Input
												className="rounded-full"
												type="number"
												placeholder="0"
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
									<FormItem>
										<FormLabel className="">
											<h1 className="text-[#32393A]">
												Room Availability
											</h1>
										</FormLabel>
										<FormControl>
											<div className="flex justify-between">
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

export default SetAvailabilityModal
