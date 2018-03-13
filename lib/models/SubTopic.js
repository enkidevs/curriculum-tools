const mongoose = require('mongoose')

const { ObjectId } = mongoose.Schema

const SubTopic = new mongoose.Schema(
  {
    name: { type: String },
    slug: { type: String },
    description: { type: String },
    notes: { type: String },
    topic: { type: ObjectId, ref: 'Topic' },
    topicName: { type: String }, // used in fixtures only
    createdAt: { type: Date },
    updatedAt: { type: Date },
    order: { type: Number },
    deprecated: { type: Boolean, default: false },
    core: { type: Boolean, default: false },
    special: { type: Boolean, default: false },
    premium: { type: Boolean },
    topicSection: { type: Number },
    sections: [
      {
        _id: false,
        name: { type: String },
        workoutIds: [{ type: ObjectId, ref: 'NewWorkout' }]
      }
    ],
    icon: { type: String },
    prerequisites: [{ type: ObjectId, ref: 'SubTopic' }],
    next: [{ type: ObjectId, ref: 'SubTopic' }]
  },
  {
    strict: 'throw'
  }
)

module.exports = mongoose.model('SubTopic', SubTopic)
