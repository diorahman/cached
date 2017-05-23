const EXPIRY = process.env.DEFAULT_CACHE_EXPIRY || 300
const CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD
}

const Promise = require('bluebird')
const storage = require('./storage')

module.exports = class Cache {
  constructor (namespace, config = CONFIG) {
    this.namespace = namespace || '->:cache'
    this.storage = storage(config)
  }

  prefixed (key) {
    return `${this.namespace}:${key}`
  }

  validKeyVal (key, val) {
    return typeof key === 'string' && (typeof val === 'string' || typeof val === 'object')
  }

  validKey (key) {
    return typeof key === 'string'
  }

  set (key, val, expiry = EXPIRY) {
    if (!this.validKeyVal(key, val)) {
      return Promise.resolve(null)
    }

    return this.storage.setexAsync(this.prefixed(key), expiry, typeof val === 'string' ? val : JSON.stringify(val))
      .catch(() => null)
  }

  get (key, parseResult = true) {
    if (!this.validKey(key)) {
      return Promise.resolve(null)
    }

    return this.storage.getAsync(this.prefixed(key))
      .then((val) => parseResult && typeof val === 'string' ? JSON.parse(val) : val)
      .catch(() => null)
  }

  del (key) {
    if (!this.validKey(key)) {
      return Promise.resolve(null)
    }

    return this.storage.delAsync(this.prefixed(key))
      .catch(() => null)
  }

  sadd (key, member) {
    if (!this.validKeyVal(key, member)) {
      return Promise.resolve(null)
    }

    return this.storage.saddAsync(this.prefixed(key), typeof member === 'string' ? member : JSON.stringify(member))
      .catch(() => null)
  }

  srem (key, member) {
    if (!this.validKeyVal(key, member)) {
      return Promise.resolve(null)
    }

    return this.storage.sremAsync(this.prefixed(key), member)
      .catch(() => null)
  }

  smembers (key, parseMember = true) {
    if (!this.validKey(key)) {
      return Promise.resolve(null)
    }

    return this.storage.smembersAsync(this.prefixed(key))
      .then((members) => {
        return parseMember ? members.map(member => typeof member === 'string' ? JSON.parse(member) : member) : members
      })
      .catch(() => null)
  }
}
