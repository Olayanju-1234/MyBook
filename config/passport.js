const FacebookStrategy = require('passport-facebook').Strategy;
const mongoose = require('mongoose');
const User = require('../models/User');



module.exports = function(passport) {
    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_SECRET_ID,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL,
        profileFields: ['id', 'displayName', 'first_name', 'last_name', 'picture.type(large)', 'gender']
    }, async function(accessToken, refreshToken, profile, done) {
        console.log(profile);
        const newUser = {
            facebookId : profile.id,
            displayName : profile.displayName,
            firstName : profile.name.givenName,
            lastName : profile.name.familyName,
            gender: profile.gender,
            image : profile.photos[0].value,
        }
        try {
            // Check if user exists
            const user = await User.findOne({ facebookId: profile.id });
            // If user exists, return user
            if (user) {
                return done(null, user);
            } else {
                // If user does not exist, create new user
                const user = await User.create(newUser);
                return done(null, user);
            }
            
        } catch (error) {
            console.log(error);
        }
        
    }
    ));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    }
    );

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        }
        );
    }
    );
}
