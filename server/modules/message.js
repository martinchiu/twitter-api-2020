const { User, Message } = require('../../models')
let onlineUsers = []

module.exports = (io, socket) => {
  /* 監聽登入事件 */
  socket.on('login', data => {
    User.findByPk(data.userId, { raw: true })
      .then(user => {
        delete user.password
        if (!user) {
          io.sockets.emit('fail', { message: '輸入錯誤使用者Id，無法登入' })
        } else {
          // 登入成功後，加入的使用者資訊
          if (!onlineUsers.some(i => i.id === user.id)) {
            onlineUsers.push(user)
          }
          Message.create({
            userId: user.id,
            message: 'join',
            source: 'server'
          })
            .then(message => {
              // 登入成功後回傳給所有上線使用者
              io.sockets.emit('message', {
                ...message.toJSON(),
                userData: user
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
            where: { source: 'user' },
            attributes: { exclude: ['updatedAt'] },
            include: [{ model: User, as: 'userData' }]
          })
            .then(messageData => {
              socket.emit('loginSuccess', {
                message: '登入成功',
                loginUserId: user.id,
                userName: user.name,
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
    User.findByPk(data.userId, { raw: true })
      .then(user => {
        delete user.password
        if (!user) {
          io.sockets.emit('fail', { message: '輸入錯誤使用者Id，無法登出' })
        } else {
          onlineUsers = onlineUsers.filter(i => i.id !== data.userId)
          Message.create({
            userId: data.userId,
            message: 'logout',
            source: 'server'
          })
            .then(message => {
              io.sockets.emit('message', {
                ...message.toJSON(),
                userData: user
              })
              io.sockets.emit('userListUpdate', {
                onlineUsers,
                onlineUserNumber: onlineUsers.length
              })
            })
        }
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
            message: data.message,
            source: 'user'
          })
            .then(message => {
              io.sockets.emit('message', {
                ...message.toJSON(),
                userData: user.toJSON()
              })
            })
        }
      })
  })
}
