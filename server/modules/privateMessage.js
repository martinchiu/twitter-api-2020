const { User, PrivateMessage, Relationship } = require('../../models')
const createRoomName = require('../../utils/roomName')

module.exports = (io, socket) => {
  socket.on('createRoom', data => {
    /* 前端給的 data 格式
      {
        sendUserId: 6,
        listenUserId: 8
      }
    */

    // 建立私訊關係與 room
    Relationship.findOrCreate({ where: data })
    const roomName = createRoomName(...data)
    socket.join(roomName)

    // 回傳 listenUser 給前端
    User.findByPk(data.listenUserId,
      { raw: true, attributes: ['id', 'name', 'account', 'avatar'] })
      .then(user => {
        io.in(roomName).emit('listenUserData', user)
      })

    /* 回傳給前端資料格式，通道 listenUserData
      {
        id: 8,
        name: 章魚燒,
        account: fghstdh,
        avatar: https://google.com
      }
    */
  })
  socket.on('privateMessage', async data => {
    // 預設前端回傳的格式：
    // data {
    //   sendUserId: 1,
    //   listenUserId: 2,
    //    message: '又要變天了...'
    // }
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
    // 回傳前端的格式：
    // privateMessage {
    //   sendUserId: 1,
    //   listenUserId: 2,
    //   message: '又要變天了...',
    //   createdAt: 2022 - 03 - 05 07: 03: 30
    // }
    }
  })
}
