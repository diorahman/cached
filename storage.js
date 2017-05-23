const redis = require('redis')
const hash = require('string-hash')
const { promisifyAll } = require('bluebird')

promisifyAll(redis.RedisClient.prototype)
promisifyAll(redis.Multi.prototype)

const connections = new Map()

function create (config) {
  const connection = redis.createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD
  })

  connections.set(hash(JSON.stringify(config)), connection)
  return connection
}

function get (config) {
  const key = hash(JSON.stringify(config))
  return connections.get(key) || create(key)
}

module.exports = get
