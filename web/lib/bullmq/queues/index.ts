import { connection } from '@/lib/redis/connection'
import { Queue } from 'bullmq'

export const importQueue = new Queue('importQueue', {
  connection,
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  },
})
