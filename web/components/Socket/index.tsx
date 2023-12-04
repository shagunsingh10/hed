import {
  ASSET_DELETE_FAILED,
  ASSET_DELETING,
  ASSET_INGESTING,
  ASSET_INGESTION_FAILED,
  ASSET_INGESTION_SUCCESS,
} from '@/constants'
import useStore from '@/store'
import { message } from 'antd'
import { Session } from 'next-auth'
import { useSession } from 'next-auth/react'
import { useCallback, useEffect } from 'react'
import io from 'socket.io-client'

const SocketConnector = () => {
  const { data: session } = useSession()
  const socket = useStore((state) => state.socket)
  const setSocket = useStore((state) => state.setSocket)
  const updateAssetStatus = useStore((state) => state.updateAssetStatus)
  const deleteAsset = useStore((state) => state.deleteAsset)
  const addMessage = useStore((state) => state.addMessage)
  const activeChat = useStore((state) => state.activeChat)

  const connectSocket = useCallback(
    async (session: Session) => {
      const res = await fetch('/api/socket')

      if (!res.ok) {
        console.error('WebSocket server not running...')
        return
      }

      const socket = io({
        retries: 10,
        ackTimeout: 10000,
      })

      socket.on('connect', () => {
        console.log('socket connected')
        socket.emit('connection-request', { userId: session?.user?.email })
      })

      socket.on('disconnect', () => {
        console.log('disconnect')
      })

      socket.on('update-asset-status', ({ assetId, status }) => {
        if (status) {
          if (status === ASSET_INGESTION_SUCCESS) {
            message.success('Asset ingested successfully!')
          } else if (status === ASSET_INGESTION_FAILED) {
            message.error('Asset ingestion failed!')
          } else if (status === ASSET_INGESTING) {
            message.info('Asset ingestion started!')
          } else if (status === 'deleted') {
            message.success('Asset deleted successfully!')
          } else if (status === ASSET_DELETING) {
            message.info('Asset deletion started!')
          } else if (status === ASSET_DELETE_FAILED) {
            message.error('Asset deletion failed!')
          } else {
            return
          }

          status === 'deleted'
            ? deleteAsset(assetId)
            : updateAssetStatus(assetId, status)
        }
      })

      socket.on(
        'chat-response',
        ({ chatId, messageId, timestamp, response, complete, sources }) => {
          addMessage({
            chatId: chatId,
            id: messageId,
            timestamp: timestamp || new Date(),
            content: response,
            isResponse: true,
            complete: complete,
            sources: sources,
          })
        }
      )

      setSocket(socket)
    },
    [addMessage, updateAssetStatus, activeChat?.id]
  )

  useEffect(() => {
    if (!socket && session) connectSocket(session)
  }, [session])

  return null
}

export default SocketConnector
