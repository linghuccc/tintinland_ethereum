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
import { publicAuctionAbi } from '@/constants'
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

interface BidModalProps {
	children: React.ReactNode
	auction: any
}
const BidModal = ({ children, auction }: BidModalProps) => {
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
		myOffer: z.number(),
	})

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			myOffer: Number(auction.highestBid) || 0,
		},
	})

	const BuyShares = async (data: z.infer<typeof formSchema>) => {
		console.log(data)
		try {
			const offerInWei = parseUnits(data.myOffer.toString(), 18) // ETH has 18 decimals

			// const approveSharesTx = await writeContractAsync({
			// 	address: okidoToken,
			// 	abi: OkidoTokenAbi,
			// 	functionName: 'approve',
			// 	args: [okidoFinance, parseUnits('100000000', 18)],
			// })

			// console.log('property transaction hash:', approveSharesTx)

			const bidTx = await writeContractAsync({
				address: auction.address,
				abi: publicAuctionAbi,
				functionName: 'bid',
				value: offerInWei,
			})

			console.log('Bid transaction hash:', bidTx)
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
							<h1>Bid</h1>
						</div>
					</AlertDialogTitle>
				</AlertDialogHeader>
				<div>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(BuyShares)}
							className="space-y-8 px-8"
						>
							<div className="font-bold text-xl my-8">
								{auction.title}
							</div>
							<div className="text-gray-700  font-medium  text-base ml-4 mb-2">
								Current Highest Bid: {auction.highestBid} ETH
							</div>
							<div className="text-gray-700  font-medium  text-base ml-4 mb-2">
								Bid Cooldown Time: {auction.cooldownTime}{' '}
								seconds
							</div>
							<div className="text-gray-700  font-medium  text-base ml-4 mb-8">
								Bid End Time: 2024 Nov 7, 20:30
							</div>

							<FormField
								control={form.control}
								name="myOffer"
								render={({ field }) => (
									<FormItem>
										<div className="flex items-center justify-center">
											<FormLabel className="mr-4">
												<h1 className="font-bold text-xl text-[#32393A]">
													I offer:
												</h1>
											</FormLabel>
											<FormControl>
												<Input
													className="rounded-full w-40 font-bold text-xl text-[#32393A] text-center"
													type="number"
													placeholder={
														auction.highestBid
													}
													{...field}
												/>
											</FormControl>
											<FormLabel className="ml-4">
												<h1 className="font-bold text-xl text-[#32393A]">
													ETH
												</h1>
											</FormLabel>
										</div>
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

export default BidModal
