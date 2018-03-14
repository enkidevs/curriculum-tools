const databaseUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017/insights'
const db = require('monk')(databaseUrl)

module.exports = db
