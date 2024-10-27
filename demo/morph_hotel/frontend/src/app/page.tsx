"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

import { bookingAbi, bookingAddress } from "@/constants";

import { useReadContract } from "wagmi";
import RoomCard from "@/components/RoomCard";
import AddRoomModal from "@/components/AddRoomModal";

export default function Home() {
  const [rooms, setRooms] = useState<any>([]);

  const { data: roomData } = useReadContract({
    abi: bookingAbi,
    address: bookingAddress,
    functionName: "getAllRooms",
  });

  useEffect(() => {
    if (roomData) {
      setRooms(roomData);
    }
  }, [roomData]);

  return (
    <main>
      <section className="py-12 flex  items-center justify-between ">
        <h1 className="text-lg font-bold">Owner actions</h1>
        <div className="flex items-center gap-2">
          <AddRoomModal>
            <Button>Add room</Button>
          </AddRoomModal>

          <Button>Set availability</Button>
        </div>
      </section>

      <div>
        {rooms.length > 0 ? (
          rooms?.map((room: any) => (
            <>
              {console.log(room)}
              <RoomCard key={room.id} room={room} />
            </>
          ))
        ) : (
          <div>
            <h1 className="text-2xl font-semibold">No rooms available</h1>
          </div>
        )}
      </div>
    </main>
  );
}
