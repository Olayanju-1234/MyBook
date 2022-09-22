const mongoose = require('mongoose')
const Schema = mongoose.Schema;

// User Schema
const UserSchema = new Schema({
    facebookId: {
        type: String,
        required: true
    },
    displayName: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    gender: {
        type: String
    },
    image: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    // post
    posts : [
        {
            type: Schema.Types.ObjectId,
            ref: 'Post'
        }
    ],
    // friends
    friends : [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
        
    ],
    // sent requests
    sentRequests : [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }   
    ],
    // friend requests
    friendRequests : [{
        
            type: Schema.Types.ObjectId,
            ref: 'User'
        }

    ],
    // received requests
    receivedRequests : {
        type: Number,
        default: 0
    }

}
);

// exports the User model
module.exports = mongoose.model('User', UserSchema);
