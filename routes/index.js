var express = require('express');
var router = express.Router();
const { ensureAuth, ensureGuest } = require('../middleware/auth');
const User = require('../models/User');
const async = require('async')
const Post = require('../models/Post')
// require Luxon DateTime
const { DateTime } = require('luxon');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login', { title: 'Express' });
});

// Homepage
router.get('/homepage', async function(req, res, next) {
  try {
    const posts = await Post.find()
    .populate('comments')
    .populate('likes')
    .populate('user')
    .sort({createdAt: 'desc'})
    .lean();
    res.render('homepage', {
      posts: posts,
      user: req.user,
      createdAt: DateTime.fromJSDate(posts.createdAt).toFormat('dd LLL yyyy')
    });

  } catch (error) {
    console.error(error);
    res.render('error/500');
  }
  
  

}
);

// Search GET
router.get('/search', ensureAuth, function(req, res, next) {
  var sent = []
  var received = []
  var friends = []

  sent = req.user.sentRequests
  received = req.user.receivedRequests
  friends = req.user.friends


  User.find({firstName: {$ne: req.user.firstName}}, function(err, users) {
    if (err) {
      console.log(err);
    } else {
  res.render('users/search', { title: 'Express',
  result: users,
  sent: sent,
  received: received,
  friends: friends, });
    }}
  )}
);

// Search POST
router.post('/search', ensureAuth, function(req, res, next) {
  var searchfriend = req.body.searchfriend;
  if (searchfriend) {
    var mssg = '';
    if (searchfriend == req.user.firstName) {
    searchfriend = null;
  }
  User.find({firstName: searchfriend}, function(err, users) {
    if (err) {
      console.log(err);
    } 
    console.log(users);
    res.render('users/search', { title: 'Express',
    result: users,
    mssg: mssg });
    });
  }


  async.parallel([
    function(callback) {
      if(req.body.receiverName) {
        User.updateOne({
          'firstName': req.body.receiverName,
          'friendRequests.userId':{$ne:req.user._id},
          'friends.friendId':{$ne:req.user._id}
        },
        {
          $push: {
            friendRequests: {
              userId: req.user._id,
              displayName: req.user.displayName
            }
          },
          $inc: {receivedRequests: 1}
        }, (err, count) => {
          console.log(err);
          callback(err, count);
        })
      }
    },
    function(callback) {
      if(req.body.receiverName) {
        User.updateOne({
          'firstName': req.user.firstName,
          'sentRequests.displayName':{$ne: req.body.receiverName}
        },
        {
          $push:{sentRequest: {
            displayName: req.body.receiverName
          }}
        }, (err, count) => {
          callback(err, count);
        })
      }
    }
  ], (err, results) => {
    if(err) {
      console.log(err);
    }
    res.redirect('/search', {results: results});
  });

  async.parallel([
    function(callback) {
      if(req.body.senderId) {
        User.updateOne({
          '_id': req.user._id,
          'friends.friendId':{$ne:req.body.senderId}
        },
        {
          $push: {
            friends: {
              friendId: req.body.senderId,
              friendName: req.body.senderName
            }
          },
          $pull: {
            friendRequests: {
              userId: req.body.senderId,
              displayName: req.body.senderName
            }
          },
          $inc: {'receivedRequests': -1}
        }, (err, count) => {
          console.log(err);
          callback(err, count);
        });
      }
    },

    function(callback) {
      if(req.body.senderId) {
      User.updateOne({
        '_id': req.body.senderId,
        'friends.friendId':{$ne:req.user._id}
      },
      {
        $push: {
          friends: {
            friendId: req.user._id,
            friendName: req.user.displayName
          }
        },
        $pull: {
          sentRequests: {
            displayName: req.user.displayName
          }}
        }, (err, count) => {
          callback(err, count);
        }
      );
      }
    },
    function(callback) {
      if(req.body.user_Id) {
        User.updateOne({
          '_id': req.user._id,
          'friendRequests.userId':{$eq:req.body.user_Id}
        },
        {
          $pull: {
            friendRequests: {
              userId: req.body.user_Id,
            }
          },
          $inc: {'receivedRequests': -1}
        }, (err, count) => {
          callback(err, count);
        }
      );
      }
    },
    function(callback) {
      if(req.body.user_Id) {
        User.updateOne({
          '_id': req.body.user_Id,
          'sentRequests.displayName':{$eq: req.user.displayName}
        },
        {
          $pull: {
            sentRequests: {
              displayName: req.user.displayName,
            }
          }
        }, (err, count) => {
          callback(err, count);
        }
      );
      }
    }

  ], (err, results) => {
    if(err) {
      console.log(err);
    }
    res.redirect('/search', {results: results});
    })
  });




module.exports = router;
