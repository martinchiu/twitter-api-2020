const { User, Relationship } = require('../models')

const privateMessagepServices = {
  userList: (userId, cb) => {
    return Promise.all([
      Relationship.findAll({
        group: 'sendUserId',
        raw: true,
        nest: true,
        where: { listenUserId: userId },
        attributes: [],
        include: [
          { model: User, as: 'sendUser', attributes: ['id', 'name', 'account', 'avatar'] }
        ]
      }),
      Relationship.findAll({
        group: 'listenUserId',
        raw: true,
        nest: true,
        where: { sendUserId: userId },
        attributes: [],
        include: [
          { model: User, as: 'listenUser', attributes: ['id', 'name', 'account', 'avatar'] }
        ]
      })])
      .then(([data1, data2]) => {
        const listenUser = data1.map(i => ({ ...i.sendUser }))
        const sendUser = data2.map(i => ({ ...i.listenUser }))
        const data = [
          ...listenUser,
          ...sendUser
        ]
        const userData = [...new Set(data)]
        return cb(null, userData)
      })
      .catch(err => cb(err, null))
  }
}

module.exports = privateMessagepServices
