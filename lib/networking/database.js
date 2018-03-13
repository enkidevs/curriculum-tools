const mongoose = require('mongoose')

const databaseUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017/insights'

mongoose.Promise = global.Promise

mongoose
.connect(databaseUrl, {})
.catch(() => {
    console.error('Failed to connect to mongodb. Exiting...')
    process.exit(1)
})

module.exports = mongoose
