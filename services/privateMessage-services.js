const { User, Relationship } = require('../models')

const privateMessagepServices = {
  userList: async (userId, cb) => {
    try {
      const listenUser = await Relationship.findAll({
        group: 'sendUserId',
        raw: true,
        nest: true,
        where: { listenUserId: userId },
        attributes: [],
        include: [
          { model: User, as: 'sendUser', attributes: ['id', 'name', 'account', 'avatar'] }
        ]
      })
      const sendUser = await Relationship.findAll({
        group: 'listenUserId',
        raw: true,
        nest: true,
        where: { sendUserId: userId },
        attributes: [],
        include: [
          { model: User, as: 'listenUser', attributes: ['id', 'name', 'account', 'avatar'] }
        ]
      })

      const data = [
        ...listenUser.map(i => ({ ...i.sendUser })),
        ...sendUser.map(i => ({ ...i.listenUser }))
      ]
      return cb(null, [...new Set(data)])
    } catch (err) {
      return cb(err, null)
    }
  }
}

module.exports = privateMessagepServices
