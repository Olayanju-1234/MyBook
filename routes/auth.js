const express = require('express');
const router = express.Router();
const passport = require('passport');

// Facebook login   
router.get('/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile'] })); 

// Facebook callback
router.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), (req, res) => {
    res.redirect('/homepage');
}
);

// Logout
router.get('/logout', (req, res) => {
    req.logOut((err) => {
        if (err) {
            console.log(err);
        }
        res.redirect('/')
    })
})

module.exports = router;