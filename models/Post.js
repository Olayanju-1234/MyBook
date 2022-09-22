const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// Require luxon date time
const { DateTime } = require('luxon');


const PostSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    // image
    // imageUrl: {
    //     type: String
    // },
    // comments
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Comment'
        }
    ],
    // likes
    likes: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
}
);

// Create virtual for date of post using luxon


PostSchema
.virtual('createdAtNew')
.get(function () {
  return DateTime.fromJSDate(this.createdAt).toLocaleString(DateTime.DATE_MED);
});


module.exports = mongoose.model('Post', PostSchema);