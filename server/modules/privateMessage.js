const { User, PrivateMessage } = require('../../models')
const createRoomName = require('../../utils/roomName')

module.exports = (io, socket) => {
  socket.on('createRoom', data => {
    const roomName = createRoomName(...data)
    socket.join(roomName)
  })
  socket.on('privateMessage', async data => {
    // 預設前端回傳的格式：
    // data {
    //   sendUserId: 1,
    //   listenUserId: 2,
    //    message: '又要變天了...'
    // }
    const roomName = createRoomName(...data)
    const privateMessage = await PrivateMessage.create({
      sendUserId: data.sendUserId,
      listenUserId: data.listenUserId,
      message: data.message
    })
    io.to(roomName).emit('message', { privateMessage: privateMessage.dataValues })
    // 回傳前端的格式：
    // privateMessage {
    //   sendUserId: 1,
    //   listenUserId: 2,
    //   message: '又要變天了...',
    //   createdAt: 2022 - 03 - 05 07: 03: 30
    // }
  })
}
