const crypto = require('crypto')
const knex = require('knex')(require('./knexfile'))

module.exports = {
  createUser ({ username, password }) {
    console.log(`Add user ${username}`)
    const { salt, hash } = saltHashPassword({ password })
    return knex('user').insert({
      salt,
      encrypted_password: hash,
      username
    })
  },
  authenticate ({ username, password }) {
    console.log(`Authenticating user ${username}`)
    return knex('user').where({ username })
      .then(([user]) => {
        if (!user) return { success: false }
        const { hash } = saltHashPassword({
          password,
          salt: user.salt
        })
        return { success: hash === user.encrypted_password }
      })
  },
  populateUser () {
    console.log(`Populate User`)
    knex.select("*").from("user").then(function (values) {
      // No need to check err object as this function will 
      // only be executed only when it is a success.
      console.log(values);
    }).catch(function (err) {
      // All the error can be checked in this piece of code
      console.log(err);
    }).finally(function () {
      // To close the connection pool
      knex.destroy();
    });
  }
}

function saltHashPassword ({
  password,
  salt = randomString()
}) {
  const hash = crypto
    .createHmac('sha512', salt)
    .update(password)
  return {
    salt,
    hash: hash.digest('hex')
  }
}

function randomString () {
  return crypto.randomBytes(4).toString('hex')
}