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

interface BidModalProps {
	children: React.ReactNode
	auctionAddress: any
}
const BidModal = ({ children, auctionAddress }: BidModalProps) => {
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
		// ensure to enforce validation regarding symbol and others
		myOffer: z.any(),
	})

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			myOffer: 0,
		},
	})

	const BuyShares = async (data: z.infer<typeof formSchema>) => {
		console.log(data)
		try {
			// const approveSharesTx = await writeContractAsync({
			// 	address: okidoToken,
			// 	abi: OkidoTokenAbi,
			// 	functionName: 'approve',
			// 	args: [okidoFinance, parseUnits('100000000', 18)],
			// })

			// console.log('property transaction hash:', approveSharesTx)

			const bidTx = await writeContractAsync({
				address: auctionAddress,
				abi: publicAuctionAbi,
				functionName: 'bid',
				args: [data.myOffer],
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
								A Beautiful House in Rural Spain
							</div>
							<div className="text-gray-700  font-medium  text-base ml-4 mb-2">
								Current Highest Bid: 0 ETH
							</div>
							<div className="text-gray-700  font-medium  text-base ml-4 mb-2">
								Bid Cooldown Time: 30 seconds
							</div>
							<div className="text-gray-700  font-medium  text-base ml-4 mb-8">
								Bid End Time: 2024 Nov 7, 20:30
							</div>

							<FormField
								control={form.control}
								name="myOffer"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="">
											<h1 className="text-[#32393A]">
												My Offer (ETH)
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
