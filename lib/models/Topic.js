const mongoose = require('mongoose')

const Topic = new mongoose.Schema(
  {
    name: { type: String, unique: true },
    slug: { type: String, unique: true },
    description: { type: String },
    language: { type: String },
    color: { type: String },
    subtopics: [{ type: mongoose.Schema.ObjectId, ref: 'SubTopic' }],
    published: { type: Boolean, default: false },
    admin: { type: Boolean, default: false },
    gradient: { type: String },
    levelRequests: [
      {
        _id: false,
        userId: { type: mongoose.Schema.ObjectId, ref: 'User' },
        levelId: { type: mongoose.Schema.ObjectId, ref: 'Level' }
      }
    ],
    team: { type: mongoose.Schema.ObjectId, ref: 'Organization' },
    icon: { type: String },
    sections: [{ type: String }],
    createdAt: { type: Date },
    updatedAt: { type: Date }
  }
)

module.exports = mongoose.model('Topic', Topic)
