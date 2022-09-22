const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const router = require('.');
const {body, validationResult} = require('express-validator')
const {ensureAuth, ensureGuest} = require('../middleware/auth');
const { logger } = require('handlebars');

// GET a single post
router.get('/:id', (req, res, next) => {
    Post.findById(req.params.id)
        .populate('user')
        .populate('comments')
        .sort({comments: 'desc'})
        .populate('likes')
        .lean()
        .exec((err, post) => {
            if (err) {
                return next(err);
                }
                res.render('posts/show', {
                    post: post,
                    comment: post.comments,
                    likes: post.likes,
                    commentUser: post.comments.user,
                    
        })

                });
                }
                );

// Get list of all posts
router.get('/', (req, res, next) => {
    Post.find({})
        .populate('user')
        .populate('comments')
        .populate('likes')
        .exec((err, posts) => {
            if (err) {
                return next(err);
                }
                res.json(posts);
                });
                }
                );

// Create a new post GET
router.get('/:id/new', ensureAuth, (req, res, next) => {
    res.render('posts/new', { title: 'Express',
        post: {
            user: req.user
        }
         });
    }
    );

// Create a new post POST
router.post('/:id/new', ensureAuth, (req, res, next) => { 
    // Validate and sanitize fields
    body('content').trim().escape().isLength({min: 1}).withMessage('Content is required');

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('posts/new', {
            title: 'Express',
            errors: errors.array()
            });
    }
    else{
        const newPost = new Post({
        user: req.user._id || req.params.id,
        content: req.body.content,
        likes: [],
        comments: [],
        createdAt: Date.now()
    });
    newPost.save((err, post) => {
        if (err) {
            return next(err);
            }
            User.findById(req.user._id, (err, user) => {
                if (err) {
                    return next(err);
                    }
                    user.posts.push(newPost._id);
                    user.save((err, user) => {
                        if (err) {
                            return next(err);
                            }
                            }
                        )  // end user.save
                        }
                    )  // end User.findById
            res.redirect('/homepage');
            } 
        )  // end newPost.save
        // Add post to user's posts
      
                
        }


    }
)

// Update a post GET
router.get('/:id/edit', ensureAuth, async (req, res, next) => {
    try {
        const post = await Post.findOne({ _id: req.params.id }).lean();
        
        // Check if the post exists
        if (!post) {
            return res.render('error/404');
        }
        // Check if the user is the owner of the post
        if (post.user != req.user.id) {
            res.redirect('/posts');
        } else {
            res.render('posts/edit', {
                post
            });
        }
    } catch (error) {
        console.error(error);
        res.render('error/500');
    }
    }
    );


// Update a post POST
router.put('/:id/edit', ensureAuth, async (req, res, next) => {
    try {
        let post = await Post.findById({ _id: req.params.id }).lean();
        // Check if the post exists
        if (!post) {
            return res.render('error/404');
        }
        // Check if the user is the owner of the post
        if (post.user != req.user.id) {
            res.redirect('/posts');
        } else {
            post = await Post.findOneAndUpdate({ _id: req.params.id }, req.body, {
                new: true,
                runValidators: true
            });
            res.redirect('/homepage');
        }
    } catch (error) {
        console.error(error);
        res.render('error/500');
    }
    })

// Delete a post
router.delete('/:id/delete', ensureAuth, async (req, res, next) => {
    try {
        let post = await Post.findById({ _id: req.params.id }).lean();
        // Check if the post exists
        if (!post) {
            return res.render('error/404');       
        }
        // Check if the user is the owner of the post
        if (post.user != req.user.id) {
            res.redirect('/posts');
        } else {
            await Post.findOneAndDelete({ _id: req.params.id });
            res.redirect('/homepage');
        }
    }
    catch (error) {
        console.error(error);
        res.render('error/500');
    }
    });

// Like a post
router.put('/:id/like', ensureAuth, async (req, res, next) => {
    Post.findById(req.params.id, (err, post) => {
        if(err) {
            return next(err);
        }
        let alreadyLiked = post.likes.includes(req.user._id);
        if (alreadyLiked) {
            Post.findByIdAndUpdate(req.params.id, {
                $pull: {likes: req.user._id}
            }).exec(err => {
                if (err) {
                    return next(err);
                }
            })
            // render homepage
            res.redirect('/posts/' + req.params.id)
        } else {
            Post.findByIdAndUpdate(req.params.id, {$addToSet: {likes: req.user._id}})
            .exec(err => {
              if (err) {
                return next(err);
              }});
            res.redirect('/posts/' + req.params.id)
          } 
        }
    )
})


// Create a new comment GET
router.get('/:id/comments/new', ensureAuth, (req, res, next) => {
    Post.findById(req.params.id)
        .populate('user')
        .populate('comments')
        .populate('likes')
        .exec((err, post) => {
            if (err) {
                return next(err);
                }
                res.render('posts/show', {
                    post: post,
                    user: req.user
        })
                });
    }
);

// Create a new comment POST
router.post('/:id/comments/new', ensureAuth, (req, res, next)=> {
    // Validate comment field and sanitize
    body('comment').isLength({min : 1}).withMessage('Comment too short')
    .trim()
    .escape()

    // Validation result
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('posts/show', {
            title: 'Express',
            errors: errors.array()
            });
    }
    else{
        const newComment = new Comment({
            user: req.user._id,
            comment: req.body.comment,
            likes: [],
            createdAt: Date.now(),
            post: req.params.id
        });
        newComment.save((err, comment) => {
            if (err) {
                return next(err)
            }
            // Add comment to post
            Post.findById(req.params.id, (err, post) => {
                if(err) {
                    return next(err)
                }
                post.comments.push(newComment._id);
                post.save((err, post) => {
                    if(err) {
                        return next(err);
                    }
                })
            })
            res.redirect('/posts/' + req.params.id);
        })
    }



})

// Like a comment
router.put('/:id/comments/:commentId/like', ensureAuth, async (req, res, next) => {
    Comment.findById(req.params.commentId, (err, comment) => {
        console.log(comment);
        if(err) {
            console.log(comment);
            return next(err);
        }
        let alreadyLiked = comment.likes.includes(req.user._id);
        
        if (alreadyLiked) {
            Comment.findByIdAndUpdate(req.params.commentId, {
                $pull: {likes: req.user._id}
            }).exec(err => {
                if (err) {
                    console.log(comment);
                    return next(err);
                }
            })
            // render homepage
            res.redirect('/homepage')
        } else {
            Comment.findByIdAndUpdate(req.params.commentId, {$addToSet: {likes: req.user._id}})
            .exec(err => {
              if (err) {
                return next(err);
              }});;
              
              
            res.redirect('/posts/' + req.params.id)
          } 
        }
    )
})






module.exports = router;