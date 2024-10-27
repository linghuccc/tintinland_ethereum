export const bookingAbi = [
  {
    type: "constructor",
    inputs: [{ name: "_token", type: "address", internalType: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "addReview",
    inputs: [
      { name: "roomId", type: "uint256", internalType: "uint256" },
      { name: "rating", type: "uint8", internalType: "uint8" },
      { name: "comment", type: "string", internalType: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "addRoom",
    inputs: [
      {
        name: "category",
        type: "uint8",
        internalType: "enum HotelBooking.RoomCategory",
      },
      {
        name: "pricePerNight",
        type: "uint256",
        internalType: "uint256",
      },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "bookRoomByCategory",
    inputs: [
      {
        name: "category",
        type: "uint8",
        internalType: "enum HotelBooking.RoomCategory",
      },
      { name: "checkInDate", type: "uint256", internalType: "uint256" },
      { name: "checkOutDate", type: "uint256", internalType: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getAllRooms",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct HotelBooking.Room[]",
        components: [
          { name: "id", type: "uint256", internalType: "uint256" },
          {
            name: "category",
            type: "uint8",
            internalType: "enum HotelBooking.RoomCategory",
          },
          {
            name: "pricePerNight",
            type: "uint256",
            internalType: "uint256",
          },
          { name: "isAvailable", type: "bool", internalType: "bool" },
          {
            name: "reviews",
            type: "tuple[]",
            internalType: "struct HotelBooking.Review[]",
            components: [
              {
                name: "guest",
                type: "address",
                internalType: "address",
              },
              { name: "rating", type: "uint8", internalType: "uint8" },
              {
                name: "comment",
                type: "string",
                internalType: "string",
              },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getBookingDetails",
    inputs: [{ name: "roomId", type: "uint256", internalType: "uint256" }],
    outputs: [
      { name: "guest", type: "address", internalType: "address" },
      { name: "checkInDate", type: "uint256", internalType: "uint256" },
      {
        name: "checkOutDate",
        type: "uint256",
        internalType: "uint256",
      },
      { name: "category", type: "string", internalType: "string" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRoomDetails",
    inputs: [{ name: "roomId", type: "uint256", internalType: "uint256" }],
    outputs: [
      { name: "category", type: "string", internalType: "string" },
      {
        name: "pricePerNight",
        type: "uint256",
        internalType: "uint256",
      },
      { name: "isAvailable", type: "bool", internalType: "bool" },
      {
        name: "reviews",
        type: "tuple[]",
        internalType: "struct HotelBooking.Review[]",
        components: [
          { name: "guest", type: "address", internalType: "address" },
          { name: "rating", type: "uint8", internalType: "uint8" },
          { name: "comment", type: "string", internalType: "string" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "owner",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "roomBookings",
    inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    outputs: [
      { name: "guest", type: "address", internalType: "address" },
      { name: "roomId", type: "uint256", internalType: "uint256" },
      { name: "checkInDate", type: "uint256", internalType: "uint256" },
      { name: "checkOutDate", type: "uint256", internalType: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "roomCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "rooms",
    inputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    outputs: [
      { name: "id", type: "uint256", internalType: "uint256" },
      {
        name: "category",
        type: "uint8",
        internalType: "enum HotelBooking.RoomCategory",
      },
      {
        name: "pricePerNight",
        type: "uint256",
        internalType: "uint256",
      },
      { name: "isAvailable", type: "bool", internalType: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "setRoomAvailability",
    inputs: [
      { name: "roomId", type: "uint256", internalType: "uint256" },
      { name: "isAvailable", type: "bool", internalType: "bool" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "token",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "contract IERC20" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "withdrawTokens",
    inputs: [{ name: "amount", type: "uint256", internalType: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "ReviewAdded",
    inputs: [
      {
        name: "roomId",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "guest",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "rating",
        type: "uint8",
        indexed: false,
        internalType: "uint8",
      },
      {
        name: "comment",
        type: "string",
        indexed: false,
        internalType: "string",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "RoomAdded",
    inputs: [
      {
        name: "roomId",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "category",
        type: "string",
        indexed: false,
        internalType: "string",
      },
      {
        name: "pricePerNight",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "RoomAvailabilityChanged",
    inputs: [
      {
        name: "roomId",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "isAvailable",
        type: "bool",
        indexed: false,
        internalType: "bool",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "RoomBooked",
    inputs: [
      {
        name: "roomId",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "guest",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "checkInDate",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "checkOutDate",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "TokensWithdrawn",
    inputs: [
      {
        name: "owner",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
];
