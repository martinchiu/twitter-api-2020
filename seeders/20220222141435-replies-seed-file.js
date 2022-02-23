/* eslint-disable indent */
/* eslint-disable padded-blocks */
'use strict'
const faker = require('faker')
const db = require('../models')
const User = db.User
const Tweet = db.Tweet

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const userData = await User.findAll({
      raw: true,
      nest: true,
      where: { role: 'user' },
      attributes: ['id']
    })

    const tweetData = await Tweet.findAll({
      raw: true,
      nest: true,
      attributes: ['id']
    })

      await queryInterface.bulkInsert('Replies', Array.from({ length: 150 }).map((d, i) => {
        let a = 0
        for (let b = i; b / 3 >= 1; b = b - 3) {
          a++
        }
        const tweet = {
          tweetId: tweetData[a].id,
          userId: userData[Math.floor(Math.random() * userData.length)].id,
          comment: faker.lorem.text(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
        return tweet
      }), {})
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Replies', null, {})
  }
}