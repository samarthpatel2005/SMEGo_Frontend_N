// Request queue manager to prevent too many simultaneous requests
class RequestQueue {
  private queue: Array<() => Promise<any>> = []
  private running = 0
  private maxConcurrent = 3

  async add<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          this.running++
          const result = await requestFn()
          resolve(result)
        } catch (error) {
          reject(error)
        } finally {
          this.running--
          this.processNext()
        }
      })
      
      this.processNext()
    })
  }

  private processNext() {
    if (this.running < this.maxConcurrent && this.queue.length > 0) {
      const nextRequest = this.queue.shift()
      if (nextRequest) {
        nextRequest()
      }
    }
  }
}

export const requestQueue = new RequestQueue()
