const { User, Message } = require('../../models')
const moment = require('moment')

module.exports = (io, socket) => {
  let onlineUsers = []
  socket.on('login', async data => {
    const userData = await User.findByPk(data.userId).toJSON()
    if (!userData) {
      io.sockets.emit('loginFail', { message: '輸入錯誤使用者Id，無法登入' })
    } else {
      // 登入成功後，加入的使用者資訊
      onlineUsers.push(userData)
      const newMessage = await Message.create({
        userId: userData.id,
        message: 'join'
      }).toJSON()

      // 登入成功後回傳給所有上線使用者
      io.sockets.emit('message', {
        message: 'join',
        source: 'server',
        userData: userData,
        createdAt: newMessage.createdAt

      })

      io.sockets.emit('userListUpdate', {
        onlineUsers,
        onlineUserNumber: onlineUsers.length
      })

      // 更新登入使用者歷史訊息
      const oleMessage = await Message.findAll({
        raw: true,
        nest: true,
        attributes: { exclude: ['updatedAt'] },
        include: [User]
      })

      socket.emit('loginSuccess', {
        message: '登入成功',
        loginUserId: userData.id,
        userName: userData.name,
        messageData: oleMessage,
        onlineUsers,
        onlineUserNumber: onlineUsers.length
      })
    }
  })

  /* 監聽登出事件 */
  socket.on('logout', data => {
    onlineUsers = onlineUsers.filter(i => i !== data.userId)
    io.sockets.emit('message', {
      message: `${data.userName}離開聊天室`,
      source: 'server',
      userData: data,
      createdAt: moment().format(),
      action: 'leave'
    })
    io.sockets.emit('userListUpdate', {
      onlineUsers,
      onlineUserNumber: onlineUsers.length
    })
  })

  /* 接收訊息 */
  socket.on('message', data => {
    Message.create({
      userId: data.userData.id,
      message: data.message
    })
      .then(message => io.sockets.emit('message', message))
  })
}
