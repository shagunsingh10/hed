import { getSocketClientId } from '../socket/handler'

const sendAssetStatusNotification = async (
  io: any,
  user: string,
  assetId: string,
  status: string
) => {
  const socketId = await getSocketClientId(user)
  if (socketId) {
    io.to(socketId).emit('update-asset-status', {
      assetId: assetId,
      status: status,
    })
  }
}

export { sendAssetStatusNotification }
