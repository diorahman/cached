const redis = require('redis')
const hash = require('string-hash')
const { promisifyAll } = require('bluebird')

promisifyAll(redis.RedisClient.prototype)
promisifyAll(redis.Multi.prototype)

const connections = new Map()

function create (config, key) {
  const connection = redis.createClient(config)
  connections.set(key, connection)
  return connection
}

function get (config) {
  const key = hash(JSON.stringify(config))
  return connections.get(key) || create(config, key)
}

module.exports = get
