import axios from 'axios'

// ******************** Handle Events ******************* //
export const handleChatResponse = async (message: any) => {
  const data = {
    chunk: message.response,
    apiKey: 'RE8k4z6rpCVk9y2EmEWAFR0gf',
    chatId: message.chatId,
    user: message.user,
    complete: true,
    sources: [],
  }

  axios({
    url: `http://localhost:3000/api/webhooks/chat-response`,
    method: 'put',
    data: data,
  })
}
