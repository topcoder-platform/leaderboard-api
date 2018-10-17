/**
 * Functions related to MongoDB instances
 */

// The mongoose instance.
const mongoose = require('mongoose')

// use bluebird promise library instead of mongoose default promise library
mongoose.Promise = global.Promise

// The database mapping.
const dbs = { }

/**
 * Gets a db connection for a URL.
 * @param {String} url MongoDB URL
 * @return {object} connection for the given URL
 */
const getDb = (url) => {
  if (!dbs[url]) {
    const db = mongoose.createConnection(url, {
      useNewUrlParser: true
    })
    dbs[url] = db
  }
  return dbs[url]
}

/**
 * Gets the mongoose.
 * @return    {Object}                the mongoose instance
 */
const getMongoose = () => {
  return mongoose
}

// exports the functions
module.exports = {
  getDb,
  getMongoose
}
