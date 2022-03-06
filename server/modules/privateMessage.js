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
  socket.on('privateMessage', data => {
    /*
      前端，猜測用io.in(room).emit('Message', data)方式，另一人也收得到?
      要發送的形式 io.in(roomName).emit('privateMessage', data)
      要給的資料 data
      {
        sendUserId: 6,
        listenUserId: 8,
        message: 'socket好難，room是什麼鬼，能吃嗎?'
      }
    */
    // 儲存傳送的訊息
    PrivateMessage.create(data)
  })
}
