const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const LocalStrategy = require('passport-local');
const User = require('../models/users');

// Serialize user for the session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id).select('_id username email');
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// Local Strategy
passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
}, async (username, password, done) => {
    try {
        const user = await User.findOne({ username });
        
        if (!user) {
            return done(null, false, { message: 'Incorrect username or password' });
        }
        
        const isMatch = await user.authenticate(password);
        
        if (!isMatch) {
            return done(null, false, { message: 'Incorrect username or password' });
        }
        
        return done(null, user);
    } catch (err) {
        return done(err);
    }
}));

// Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/google/callback',
        scope: ['profile', 'email']
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user already exists
            let user = await User.findOne({ googleId: profile.id });
            
            if (user) {
                return done(null, user);
            }
            
            // Check if user exists with the same email
            const existingUser = await User.findOne({ email: profile.emails[0].value });
            
            if (existingUser) {
                // Update existing user with Google ID
                existingUser.googleId = profile.id;
                await existingUser.save();
                return done(null, existingUser);
            }
            
            // Create new user
            user = await User.create({
                username: profile.displayName.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000),
                email: profile.emails[0].value,
                googleId: profile.id,
                profileImage: profile.photos[0].value
            });
            
            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    }));
}

// Facebook Strategy
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: '/facebook/callback',
        profileFields: ['id', 'displayName', 'photos', 'email']
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user already exists
            let user = await User.findOne({ facebookId: profile.id });
            
            if (user) {
                return done(null, user);
            }
            
            // Check if user exists with the same email
            const email = profile.emails ? profile.emails[0].value : null;
            if (email) {
                const existingUser = await User.findOne({ email });
                
                if (existingUser) {
                    // Update existing user with Facebook ID
                    existingUser.facebookId = profile.id;
                    await existingUser.save();
                    return done(null, existingUser);
                }
            }
            
            // Create new user
            user = await User.create({
                username: profile.displayName.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000),
                email: email || `${profile.id}@facebook.com`,
                facebookId: profile.id,
                profileImage: profile.photos ? profile.photos[0].value : null
            });
            
            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    }));
}

module.exports = passport; 