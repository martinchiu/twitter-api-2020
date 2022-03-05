const { User, Message } = require('../../models')
const moment = require('moment')

module.exports = (io, socket) => {
  let onlineUsers = []
  socket.on('login', loginUserId => {
    User.findByPk(loginUserId)
      .then(user => {
        if (!user) {
          io.sockets.emit('loginFail', { message: '輸入錯誤使用者Id，無法登入' })
        } else {
          onlineUsers.push(user.dataValues)
          io.sockets.emit('message', {
            message: `歡迎${user.dataValues.name}加入聊天室`,
            source: 'server',
            userData: user,
            createdAt: moment().format(),
            action: 'join'
          })
          io.sockets.emit('userListUpdate', {
            onlineUsers,
            onlineUserNumber: onlineUsers.length
          })
          Message.findAll({
            raw: true,
            nest: true,
            attributes: { exclude: ['updatedAt'] },
            include: [User]
          })
            .then(data => {
              const messageData = data.map(i => ({
                ...i,
                createdAt: moment(i.createdAt).fromNow()
              }))
              return socket.emit('loginSuccess', {
                message: '登入成功',
                loginUserId: user.dataValues.id,
                userName: user.dataValues.name,
                messageData,
                onlineUsers,
                onlineUserNumber: onlineUsers.length
              })
            })
        }
      })
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
