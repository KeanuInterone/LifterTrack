const passport = require('passport')
const passportLocal = require('passport-local')
const passportJWT = require('passport-jwt')
const bcrypt = require('bcrypt')
const User = require('../models/User')


function setUp(app) {
    // PASSPORT SET UP //
    app.use(passport.initialize())
    var opts = {}
    opts.jwtFromRequest = passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken()
    opts.secretOrKey = process.env.JWT_SECRET;
    // JWT Authentication
    passport.use(new passportJWT.Strategy(opts, function (jwt_payload, done) {
        User.findById(jwt_payload.id, function (err, user) {
            if (err) {
                return done(err, false);
            }
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        });
    }));
    // Email and password Authentication
    passport.use(new passportLocal.Strategy({ usernameField: 'email' },
        function (email, password, done) {
            User.findOne({ email: email }, async function (err, user) {
                if (err) { return done(err); }
                if (!user) { return done(null, false); }
                let validPassword = await comparePassword(password, user.password)
                if (!validPassword) { return done(null, false); }
                return done(null, user);
            });
        }
    ));
}


function comparePassword(password, hash) {
    return new Promise(resolve => {
        bcrypt.compare(password, hash, function (err, result) {
            if (err) {
                console.log(err)
            } else {
                resolve(result)
            }
        });
    })
}

module.exports = { setUp }