//* The passport config file
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

function initialize(passport, getUserByEmail, getUserById){
    //? Authenticates users
    const authenticateUsers = async (email, password, done) => {
        //? Get users by email
        const user = getUserByEmail(email);
        //! Errors if no account has the email
        if (user == null){
            return done(null, false, {message: "Password or email incorrect"});
        }
        try {
            if (await bcrypt.compare(password, user.password)){
                return done(null, user);
            }
            else {
                return done(null, false, {message: "Password or email incorrect"})
            }
        } 
        catch (e) {
            console.log(e);
            return done(e); 
        }
    };
    passport.use(new LocalStrategy({usernameField: 'email'}, authenticateUsers));
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => {
        return done(null, getUserById(id));
    })
}

module.exports = initialize;