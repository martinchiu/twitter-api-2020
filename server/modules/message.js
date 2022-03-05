const { User, Message } = require('../../models')
const moment = require('moment')

module.exports = (io, socket) => {
  let onlineUsers = []
  socket.on('login', data => {
    User.findByPk(data.userId, { raw: true })
      .then(user => {
        delete user.password
        if (!user) {
          io.sockets.emit('fail', { message: '輸入錯誤使用者Id，無法登入' })
        } else {
          // 登入成功後，加入的使用者資訊
          onlineUsers.push(user)
          Message.create({
            userId: user.id,
            message: 'join'
          })
            .then(message => {
              // 登入成功後回傳給所有上線使用者
              io.sockets.emit('message', {
                message: 'join',
                source: 'server',
                userData: user,
                createdAt: message.dataValues.createdAt
              })

              // 更新上線使用者清單
              io.sockets.emit('userListUpdate', {
                onlineUsers,
                onlineUserNumber: onlineUsers.length
              })
            })

          // 更新登入使用者歷史訊息
          Message.findAll({
            raw: true,
            nest: true,
            attributes: { exclude: ['updatedAt'] },
            include: [User]
          })
            .then(message => {
              socket.emit('loginSuccess', {
                message: '登入成功',
                loginUserId: user.id,
                userName: user.name,
                messageData: message.map(i => ({ ...i, source: 'user' })),
                onlineUsers,
                onlineUserNumber: onlineUsers.length
              })
            })
        }
      })
  })

  /* 監聽登出事件 */
  socket.on('logout', data => {
    onlineUsers = onlineUsers.filter(i => i.id !== data.userId)
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
    User.findByPk(data.userId)
      .then(user => {
        if (!user) {
          io.sockets.emit('fail', { message: '輸入錯誤使用者Id，無法新增訊息' })
        } else {
          Message.create({
            userId: data.userId,
            message: data.message
          })
            .then(message => {
              const messageData = message.toJSON()
              const data = {
                ...messageData,
                source: 'user',
                userData: user.toJSON()
              }
              io.sockets.emit('message', data)
            })
        }
      })
  })
}
