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
import { contractFactoryAbi, contractFactory } from '@/constants'
import { toast } from 'sonner'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'

import {
	useAccount,
	useWaitForTransactionReceipt,
	useWriteContract,
} from 'wagmi'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface AddAuctionModalProps {
	children: React.ReactNode
}
const AddAuctionModal = ({ children }: AddAuctionModalProps) => {
	const { address } = useAccount()

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
		title: z.string().min(1),
		imageUrl: z.string().min(1),
		biddingTime: z.number(),
		cooldownTime: z.number(),
		beneficiary: z.string().min(1),
	})

	console.log('address is', address)
	console.log('address?.toString() is', address?.toString())
	console.log("address?.toString() || '' is", address?.toString() || '')

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			title: '',
			imageUrl:
				'https://img.freepik.com/premium-photo/home-architecture-design-colonial-style-with-center-entrance_31965-172913.jpg',
			biddingTime: 86400,
			cooldownTime: 30,
			beneficiary: address?.toString() || '',
		},
	})

	const AddAuction = async (data: z.infer<typeof formSchema>) => {
		console.log(data)
		try {
			const addAuctionTx = await writeContractAsync({
				address: contractFactory,
				abi: contractFactoryAbi,
				functionName: 'createAuction',
				args: [
					data.beneficiary,
					data.title,
					data.imageUrl,
					data.biddingTime,
					data.cooldownTime,
				],
			})

			console.log('New auction transaction hash:', addAuctionTx)
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
							<h1>Start a new Auction</h1>
						</div>
					</AlertDialogTitle>
				</AlertDialogHeader>
				<div>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(AddAuction)}
							className="space-y-8"
						>
							<FormField
								control={form.control}
								name="title"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="">
											<h1 className="text-[#32393A]">
												Auction title
											</h1>
										</FormLabel>
										<FormControl>
											<Input
												className="rounded-full"
												placeholder="Please enter title here"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="imageUrl"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="">
											<h1 className="text-[#32393A]">
												Image URL
											</h1>
										</FormLabel>
										<FormControl>
											<Input
												className="rounded-full"
												placeholder="Please enter image URL here"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="biddingTime"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="">
											<h1 className="text-[#32393A]">
												Bidding Time
											</h1>
										</FormLabel>
										<FormControl>
											<Input
												className="rounded-full"
												type="number"
												placeholder="Please enter bidding time (in secondes) here"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="cooldownTime"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="">
											<h1 className="text-[#32393A]">
												Cooldown Time
											</h1>
										</FormLabel>
										<FormControl>
											<Input
												className="rounded-full"
												type="number"
												placeholder="Please enter cooldown time (in secondes) here"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="beneficiary"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="">
											<h1 className="text-[#32393A]">
												Beneficiary
											</h1>
										</FormLabel>
										<FormControl>
											<Input
												className="rounded-full"
												placeholder="Please enter beneficiary address here"
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

export default AddAuctionModal
