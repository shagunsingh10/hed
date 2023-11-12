import { Socket } from "socket.io-client";
import { Session } from "next-auth";

export type SocketSlice = {
  socket: Socket | null;
  setSocket: (socket: Socket) => void;
};
