import type { NextApiRequest } from "next";
import type { NextApiResponseWithSocket } from "./socket";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket<boolean>
) {
  res.status(200).send(true);
}
