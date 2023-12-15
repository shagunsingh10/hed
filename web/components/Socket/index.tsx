import {
  ASSET_DELETE_FAILED,
  ASSET_DELETING,
  ASSET_INGESTING,
  ASSET_INGESTION_FAILED,
  ASSET_INGESTION_SUCCESS,
} from '@/constants'
import useStore from '@/store'
import { showNotification } from '@mantine/notifications'
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
            showNotification({
              message: 'Asset ingested successfully!',
              color: 'green',
            })
          } else if (status === ASSET_INGESTION_FAILED) {
            showNotification({
              message: 'Asset ingestion failed!',
              color: 'red',
            })
          } else if (status === ASSET_INGESTING) {
            showNotification({
              message: 'Asset ingestion started!',
              color: 'blue',
            })
          } else if (status === 'deleted') {
            showNotification({
              message: 'Asset deleted successfully!',
              color: 'green',
            })
          } else if (status === ASSET_DELETING) {
            showNotification({
              message: 'Asset deletion started!',
              color: 'info',
            })
          } else if (status === ASSET_DELETE_FAILED) {
            showNotification({
              message: 'Asset deletion failed!',
              color: 'red',
            })
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
