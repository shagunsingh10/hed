import { connection } from '@/lib/redis/connection'
import { Worker } from 'bullmq'

new Worker(
  'importQueue',
  async (job) => {
    const data = job?.data
    console.log(data)
    console.log('Task 1x executed successfully')
  },
  {
    connection,
    concurrency: 5,
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
  }
)
