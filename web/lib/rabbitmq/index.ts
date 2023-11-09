import amqplib from "amqplib";
import { config } from "config";

export const sendMessageToPythonService = async (message: string) => {
  const queue = config.pythonServiceQueue;
  const conn = await amqplib.connect(config.rabbitMqHost);
  const ch = await conn.createChannel();
  ch.sendToQueue(queue, Buffer.from(message));
};
