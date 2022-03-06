const { User, PrivateMessage, Relationship } = require('../../models')
const createRoomName = require('../../utils/roomName')
const { userList } = require('../../services/privateMessage-services')

module.exports = (io, socket) => {
  /* 建立私訊關係 */
  socket.on('createRoom', data => {
    // 建立私訊關係與 room
    Relationship.findOrCreate({ where: data })
    const roomName = createRoomName(data.sendUserId, data.listenUserId)
    socket.join(roomName)

    // 回傳 listenUser 給前端
    User.findByPk(data.listenUserId,
      { raw: true, attributes: ['id', 'name', 'account', 'avatar'] })
      .then(user => {
        io.in(roomName).emit('listenUserData', user)
      })

    // 回傳訊息列表給前端
    userList(data.sendUserId, (err, data) => {
      if (err) io.in(roomName).emit('fail', err)
      io.in(roomName).emit('userList', data)
    })
  })

  /* 回傳私訊列表 */
  socket.on('userList', data => {
    userList(data.userId, (err, data) => {
      if (err) io.sockets.emit('fail', err)
      io.sockets.emit('userList', data)
    })
  })

  /* 傳遞私訊內容 */
  socket.on('privateMessage', async data => {
    /*
    預設前端回傳的格式：
    data {
      sendUserId: 1,
      listenUserId: 2,
      message: '又要變天了...'
    }
    */
    const sendUser = await User.findByPk(data.sendUserId)
    const listenUser = await User.findByPk(data.listenUserId)
    if (!sendUser) {
      io.sockets.emit('fail', { message: '輸入錯誤使用者Id，無法發送訊息' })
    } else if (!listenUser) {
      io.sockets.emit('fail', { message: '輸入錯誤使用者Id，無法接收訊息' })
    } else {
      const roomName = createRoomName(...data)
      const privateMessage = await PrivateMessage.create({
        sendUserId: data.sendUserId,
        listenUserId: data.listenUserId,
        message: data.message
      })
      io.to(roomName).emit('message', { privateMessage: privateMessage.dataValues })
    /*
      回傳前端的格式：
      privateMessage {
        sendUserId: 1,
        listenUserId: 2,
        message: '又要變天了...',
        createdAt: 2022 - 03 - 05 07: 03: 30
      }
    */
    }
  })
}
