import { saveSocketClientId } from "@/lib/socket/handler";
import type { Server as HTTPServer } from "http";
import type { Socket as NetSocket } from "net";
import type { NextApiRequest, NextApiResponse } from "next";
import type { Server as IOServer } from "socket.io";
import { Server } from "socket.io";

export const config = {
  api: {
    bodyParser: false,
  },
};

interface SocketServer extends HTTPServer {
  io?: IOServer | undefined;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

export interface NextApiResponseWithSocket<Data = any>
  extends NextApiResponse<Data> {
  socket: SocketWithIO;
}

const ioHandler = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (!res.socket.server.io) {
    console.log("*Starting Socket.IO server");

    const io = new Server(res.socket.server);

    io.on("connection", (socket: any) => {
      socket.on("connection-request", ({ userId }: { userId: string }) => {
        saveSocketClientId(userId, socket.id);
      });

      socket.on("disconnect", () => {
        // remove user from redis
      });
    });

    res.socket.server.io = io;
  } else {
    console.log("socket.io already running");
  }
  res.end();
};

export default ioHandler;
