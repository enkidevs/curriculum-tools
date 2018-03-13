const mongoose = require('mongoose')

const { ObjectId } = mongoose.Schema

const Standard = new mongoose.Schema({
  text: { type: String, required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true },
  description: { type: String, required: true },
  topic: { type: ObjectId, ref: 'Topic' },
  subtopic: { type: ObjectId, ref: 'SubTopic' },
  objectives: [
    {
      slug: { type: String, required: true },
      text: { type: String, required: true }
    }
  ]
})
// Pointedly didn't throw an error on extra fields

module.exports = mongoose.model('Standard', Standard)
