import { type Server } from 'socket.io'
import { ASSET_STATUS_EVENT } from './events'
import { emitSocketEventToUser } from './utils'

type IAssetStatusNotification = {
  assetId: string
  status: string
}

export const sendAssetStatusNotification = async (
  io: Server,
  userId: string,
  payload: IAssetStatusNotification
) => {
  emitSocketEventToUser<IAssetStatusNotification>(
    io,
    userId,
    ASSET_STATUS_EVENT,
    payload
  )
}
