// import { FileStore } from '@tus/file-store'
// import { Server } from '@tus/server'
import type { NextApiRequest, NextApiResponse } from 'next'

export const config = {
  api: {
    bodyParser: false,
  },
}

// const tusServer = new Server({
//   // `path` needs to match the route declared by the next file router
//   // ie /api/upload
//   path: '/api/upload',
//   datastore: new FileStore({ directory: './tusd' }),
// })

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // return tusServer.handle(req, res)
  return { req, res }
}
