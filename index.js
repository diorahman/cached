const EXPIRY = process.env.DEFAULT_CACHE_EXPIRY

const Promise = require('bluebird')
const storage = require('./storage')

module.exports = class Cache {
  constructor (namespace) {
    this.namespace = namespace || '->:cache'
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

  set (key, val, expiry = EXPIRY || 300) {
    if (!this.validKeyVal(key, val)) {
      return Promise.resolve(null)
    }

    return storage.setexAsync(this.prefixed(key), expiry, typeof val === 'string' ? val : JSON.stringify(val))
      .catch(() => null)
  }

  get (key, expiry = EXPIRY || 300) {
    if (!this.validKey(key)) {
      return Promise.resolve(null)
    }

    return storage.getAsync(this.prefixed(key))
      .then((val) => { return JSON.parse(val) })
      .catch(() => null)
  }

  del (key) {
    if (!this.validKey(key)) {
      return Promise.resolve(null)
    }

    return storage.setexAsync(this.prefixed(key))
      .catch(() => null)
  }

  sadd (key, member) {
    if (!this.validKeyVal(key, member)) {
      return Promise.resolve(null)
    }

    return storage.saddAsync(this.prefixed(key), typeof val === 'string' ? member : JSON.stringify(member))
      .catch(() => null)
  }

  smembers (key) {
    if (!this.validKey(key)) {
      return Promise.resolve(null)
    }

    return storage.smembersAsync(this.prefixed(key))
      .catch(() => null)
  }
}
