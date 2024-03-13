const passport = require('passport');
const CONFIG = require('../../config/config.js');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GitHubStrategy = require('passport-github2').Strategy


passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
 passport.deserializeUser((user,done)=>{
    done(null,user)
 })

passport.use(new GoogleStrategy({
    clientID:CONFIG.GOOGLE_CLIENT_ID,
    clientSecret:CONFIG.GOOGLE_CLIENT_SECRET,
    callbackURL: CONFIG.CALL_BACK_URL,
    passReqToCallback: true,
  },
  (request,accessToken, refreshToken, profile, done) =>{
    done(null,profile)
  }
));


passport.use(new FacebookStrategy({
    clientID: CONFIG.FACEBOOK_CLINT_ID,
    clientSecret: CONFIG.FACEBOOK_CLINT_SECRET,
    callbackURL: CONFIG.FACEBOOK_CALLBACK_URL,
    passReqToCallback : true,
    profileFields: ['id', 'emails', 'name'] //This
  },
  (request,accessToken, refreshToken, profile, done) =>{
    console.log(profile);
    done(null,profile)
  }
));



passport.use(new GitHubStrategy({
    clientID: CONFIG.GITHUB_CLINT_ID,
    clientSecret: CONFIG.GITHUB_CLINT_SECRET,
    callbackURL: CONFIG.GITHUB_CALLBACK_URL,
  },
  (request,accessToken, refreshToken, profile, done) =>{
    console.log(profile);
    done(null,profile)
  }
));