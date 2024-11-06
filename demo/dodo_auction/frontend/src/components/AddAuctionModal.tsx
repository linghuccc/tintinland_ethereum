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

import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface AddAuctionModalProps {
	children: React.ReactNode
}
const AddAuctionModal = ({ children }: AddAuctionModalProps) => {
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
		beneficiary: z.any(),
		biddingTime: z.any(),
		cooldownTime: z.any(),
	})

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			beneficiary: '',
			biddingTime: 0,
			cooldownTime: 0,
		},
	})

	const AddAuction = async (data: z.infer<typeof formSchema>) => {
		console.log(data)
		try {
			const addAuctionTx = await writeContractAsync({
				address: contractFactory,
				abi: contractFactoryAbi,
				functionName: 'createAuction',
				args: [data.beneficiary, data.biddingTime, data.cooldownTime],
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
								name="beneficiary"
								render={({ field }) => (
									<FormItem>
										<FormLabel className="">
											<h1 className="text-[#32393A]">
												Property beneficiary
											</h1>
										</FormLabel>
										<FormControl>
											<Input
												className="rounded-full"
												placeholder="0x7E60F5E4544F8817A1D49bD3bB14c1EE2E7537cC"
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
												placeholder="180"
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
												placeholder="30"
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
