"use client";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useEffect } from "react";
import { bookingAbi, bookingAddress } from "@/constants";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";

interface InvestModalProps {
  children: React.ReactNode;
}
const AddReviewModal = ({ children }: InvestModalProps) => {
  const {
    data: hash,
    error,
    isPending,
    writeContractAsync,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  useEffect(() => {
    if (isConfirming) {
      toast.loading("Transaction Pending");
    }
    if (isConfirmed) {
      toast.success("Transaction Successful", {
        action: {
          label: "View on Etherscan",
          onClick: () => {
            window.open(`https://explorer-holesky.morphl2.io/tx/${hash}`);
          },
        },
      });
    }
    if (error) {
      toast.error("Transaction Failed");
    }
  }, [isConfirming, isConfirmed, error, hash]);

  const formSchema = z.object({
    roomId: z.any(),
    rating: z.any(),
    comment: z.any(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomId: 0,
      rating: 0,
      comment: "",
    },
  });

  const AddReview = async (data: z.infer<typeof formSchema>) => {
    console.log(data);
    try {
      const addRoomTx = await writeContractAsync({
        abi: bookingAbi,
        address: bookingAddress,
        functionName: "addReview",
        args: [data.roomId, data.rating, data.comment],
      });

      console.log("room transaction hash:", addRoomTx);
    } catch (err: any) {
      toast.error("Transaction Failed: " + err.message);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <div className="flex items-center gap-6 justify-center">
              <AlertDialogCancel className="border-none">
                <MoveLeft size={24} />
              </AlertDialogCancel>
              <h1>Add a Room</h1>
            </div>
          </AlertDialogTitle>
        </AlertDialogHeader>
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(AddReview)} className="space-y-8">
              <FormField
                control={form.control}
                name="roomId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="">
                      <h1 className="text-[#32393A]">Room ID)</h1>
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
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="">
                      <h1 className="text-[#32393A]">Rating (1-5)</h1>
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
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="">
                      <h1 className="text-[#32393A]">Comments</h1>
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="rounded-full"
                        placeholder="Nice"
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
                {isPending ? "Loading" : "Submit"}
              </Button>
            </form>
          </Form>
        </div>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AddReviewModal;
