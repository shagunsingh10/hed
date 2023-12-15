import { importQueue } from '@/lib/bullmq/queues'
import { NextApiRequest, NextApiResponse } from 'next'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const data = {
    message: 'This is a sample job ',
  }

  await importQueue.add('someJob', data)
  res.status(200).json({ status: 'Message added to the queue' })
}

export default handler
