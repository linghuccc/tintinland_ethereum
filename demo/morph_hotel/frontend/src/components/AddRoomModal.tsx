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
import { parseUnits } from 'viem'

interface AddRoomModalProps {
	children: React.ReactNode
	onSuccess: () => void
}
const AddRoomModal = ({ children, onSuccess }: AddRoomModalProps) => {
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
		category: z.any(),
		price: z.any(),
	})

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			category: undefined,
			price: undefined,
		},
	})

	const AddRoom = async (data: z.infer<typeof formSchema>) => {
		// console.log(data)
		try {
			const priceInWei = parseUnits(data.price.toString(), 18) // Token has 18 decimals

			const addRoomTx = await writeContractAsync({
				address: bookingAddress,
				abi: bookingAbi,

				functionName: 'addRoom',
				args: [data.category, priceInWei],
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
							<h1>Add a Room</h1>
						</div>
					</AlertDialogTitle>
				</AlertDialogHeader>
				<div className="px-6">
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(AddRoom)}
							className="space-y-8"
						>
							<FormField
								control={form.control}
								name="category"
								render={({ field }) => (
									<FormItem className="flex items-center">
										<FormLabel className="w-1/2">
											<h1 className="text-[#32393A]">
												Room Category
											</h1>
										</FormLabel>
										<FormControl className="w-1/2">
											<select
												{...field}
												className="border rounded-md"
												defaultValue="2"
											>
												<option value="0">
													Presidential
												</option>
												<option value="1">
													Deluxe
												</option>
												<option value="2">Suite</option>
											</select>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="price"
								render={({ field }) => (
									<FormItem className="flex items-center">
										<FormLabel className="w-1/2">
											<h1 className="text-[#32393A]">
												Price per Night (in MHT)
											</h1>
										</FormLabel>
										<FormControl className="w-1/2">
											<Input
												className="rounded-full"
												type="number"
												placeholder="Please enter price here"
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
								{isPending ? 'Pending' : isConfirming ? 'Waiting' : 'Submit'}
							</Button>
						</form>
					</Form>
				</div>
			</AlertDialogContent>
		</AlertDialog>
	)
}

export default AddRoomModal
