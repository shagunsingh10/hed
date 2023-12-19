type IRetryArgs = {
  callback: (...args: unknown[]) => Promise<unknown>
  args: unknown[]
  num_retries?: number
  retry_delay_in_ms?: number
}

const retryIfFail = async ({
  callback,
  args,
  num_retries = 0,
  retry_delay_in_ms = 100,
}: IRetryArgs) => {
  let retries = 0
  while (retries <= num_retries) {
    try {
      await callback(...args)
      return
    } catch (e) {
      retries += 1
      if (retries <= num_retries) {
        await new Promise((resolve) => setTimeout(resolve, retry_delay_in_ms))
      } else {
        return Promise.reject(e)
      }
    }
  }
}

export default retryIfFail
