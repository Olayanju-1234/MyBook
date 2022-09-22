var express = require('express');
var router = express.Router();
// require USER
var User = require('../models/User')
const Post = require('../models/Post')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// User profile
router.get('/:id', async (req, res, next) => {
  try {
    // Find the user
    const users = await User.findById(req.params.id).lean();
    // Check if the user exists
    if (!users) {
      return res.render('error/404');
    }
    // Find the user's posts
    const posts = await Post.find({ user: req.params.id }).lean();
    // Render the profile page
    res.render('users/profile', {
      users,
      posts
    });
    
  } catch (error) {
    console.error(error);
    res.render('error/500');
  }

}
)

// Friend list
router.get('/:id/friends', async (req, res, next) => {
  try {
    // Find the user and populate friends
    User.findById(req.params.id).populate('friends').exec(function(err, user) {
      if (err) {
        console.log(err);
      } else {
        res.render('users/friends', {
          user
        });
      }
    }
    )
  } catch (error) {
    console.error(error);
    res.render('error/500');
  }  
}
)

// Add friend page GET
router.get('/:id/add-friend', (req, res, next) => {
  // Get all friend requests
  User.findById(req.params.id).populate('friendRequests').exec(function(err, user) {
    if (err) {
      console.log(err);
    } else {
      res.render('users/add-friend', {
        user
      });
    }
  }
  )

})

// send friend request friend POST
router.post('/:id/send-friend-request/:friendId', async (req, res, next) => {
  // Find user by Id and update friends array
  try {
    User.findByIdAndUpdate(req.params.id, { $addToSet: { sentRequests: [req.params.friendId] } }).exec(function(err, user) {
      if (err) {
        console.log(err);
      } 
      // If user already sent friend request, redirect to homepage
      else if (user.sentRequests.includes(req.params.friendId)) {
        res.redirect('/homepage');
      }
      else {
        // Add one to friends received requests
        User.findByIdAndUpdate(req.params.friendId, {$inc: {receivedRequests: 1}}, function(err, user) {
          if (err) {
            console.log(err);
          } else {
        // Update friends friends request array
        user.friendRequests.push(req.params.id);
        user.save();
        
        res.redirect('/users/' + req.params.id + '/friends');
      }})
    }

    }
    )
  } catch (error) {
    console.error(error);
    res.render('error/500');
  }
}
)

// Accept friend request POST
router.post('/:id/add-friend/:friendId', (req, res, next) => {
  // Accept friend request
  User.findByIdAndUpdate(req.params.id, { $addToSet: { friends: [req.params.friendId] } }).exec(function(err, user) {
    if (err) {
      console.log(err);
    } else {
      // Remove friend request from user
      User.findByIdAndUpdate(req.params.id, { $pull: { friendRequests: req.params.friendId } }).exec(function(err, user) {
        if (err) {
          console.log(err);
        } else {
          // Remove friend request from friend
          User.findByIdAndUpdate(req.params.friendId, { $pull: { sentRequests: req.params.id } }).exec(function(err, user) {
            if (err) {
              console.log(err);
            } else {
                  // Remove friend request from friend's received requests
                  User.findByIdAndUpdate(req.params.id, { $inc: { receivedRequests: -1 } }).exec(function(err, user) {
                    if (err) {
                      console.log(err);
                    } else {
                      res.redirect('/users/' + req.params.id + '/friends');
                    }
                  })
                }
              })
            }
          })
        }
      })

    }
  )

// Decline friend request POST
router.post('/:id/add-friend/:friendId/decline', (req, res, next) => {
  // Decline friend request
  User.findByIdAndUpdate(req.params.id, { $pull: { friendRequests: req.params.friendId } }).exec(function(err, user) {
    if (err) {
      console.log(err);
    } else {
      // Remove friend request from friend
      User.findByIdAndUpdate(req.params.friendId, { $pull: { sentRequests: req.params.id } }).exec(function(err, user) {
        if (err) {
          console.log(err);
        } else {
          // Remove friend request from friend's received requests
          User.findByIdAndUpdate(req.params.id, { $inc: { receivedRequests: -1 } }).exec(function(err, user) {
            if (err) {
              console.log(err);
            } else {
              res.redirect('/users/' + req.params.id + '/friends');
            }
          })
        }
      })
    }
  })
})


module.exports = router;
