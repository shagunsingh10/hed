import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next'

export type IHttpMethodHandler = {
  GET?: NextApiHandler
  POST?: NextApiHandler
  PUT?: NextApiHandler
  DELETE?: NextApiHandler
  PATCH?: NextApiHandler
  OPTIONS?: NextApiHandler
  TRACE?: NextApiHandler
  CONNECT?: NextApiHandler
  HEAD?: NextApiHandler
}

const ApiRouteHandler = (handlers: IHttpMethodHandler) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const method = req.method as keyof IHttpMethodHandler
    const handler = handlers[method]

    if (!handler) {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed',
      })
    }

    try {
      return await handler(req, res)
    } catch (error) {
      console.error('INTERNAL SERVER ERROR:', error)
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
      })
    }
  }
}

export default ApiRouteHandler
