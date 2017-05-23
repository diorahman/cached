const redis = require('redis')
const { promisifyAll } = require('bluebird')

promisifyAll(redis.RedisClient.prototype)
promisifyAll(redis.Multi.prototype)

function create (config) {
  return redis.createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD
  })
}

module.exports = create
