const { User, Message } = require('../../models')
const moment = require('moment')

module.exports = (io, socket) => {
  let userData = []

  socket.on('login', loginUserId => {
    User.findByPk(loginUserId)
      .then(user => {
        if (!user) {
          io.sockets.emit('loginFail', { message: '輸入錯誤使用者Id，無法登入' })
        } else {
          userData.push(user.dataValues.id)
          const message = {
            message: `歡迎${user.dataValues.name}加入聊天室`,
            userNumber: userData.length
          }
          io.sockets.emit('addUser', message)
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
              return socket.emit('loginSuccess', { loginUserId: user.dataValues.id, userName: user.dataValues.name, messageData })
            })
        }
      })
  })

  /* 監聽登出事件 */
  socket.on('logout', logoutUserId => {
    userData = userData.filter(i => i !== logoutUserId)
    const message = {
      message: `${logoutUserId}離開聊天室`,
      userNumber: userData.length
    }
    io.sockets.emit('leave', message)
  })

  /* 接收訊息 */
  socket.on('sendMessage', data => {
    Message.create(data)
      .then(() => io.sockets.emit('receiveMessage', data))
  })
}
