if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}


//* Module variables
const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const passport = require("passport");
const initializePassport = require("./passport-conf");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const { MongoClient } = require('mongodb');

//? Initialize
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
);

async function dbInit() {
    //? Connecting to mongodb
    const uri = "mongodb+srv://admin:shanshan2014@nodelogincluster.n1zawsj.mongodb.net/sample_airbnb?retryWrites=true&w=majority"
    const client = new MongoClient(uri);
    try {
        await client.connect();
        await listDatabases(client);
    } catch (e) {
        console.log(e)
    }
    finally {
        await client.close();
    }
};

async function listDatabases(client){
    databasesList = await client.db().admin().listDatabases();

    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};

dbInit().catch(console.error);

const users = [];

app.use(express.urlencoded({extended: false}));
app.use(flash());
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false, //* If nothing changed, we won't resave the session variable
    saveUninitialized: false
}))
app.use(passport.initialize()) 
app.use(passport.session())
app.use(methodOverride("_method"))

//? Configuring the login post functionality
app.post("/login", checkNotAuthenticated, passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}))

//? Configuring the register post functionality
app.post("/register", checkNotAuthenticated, async (req, res) => {

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(), 
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
        })
        console.log(users); //? Display newly registered users in the console
        res.redirect("/login")
        
    } catch (e) {
        //! Catch errors
        console.log(e);
        res.redirect("/register")
    }
})


//* Routes
app.get('/', checkAuthenticated, (req, res) => {
    res.render("index.ejs", {name: req.user.name})
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render("login.ejs")
})

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render("register.ejs")
})

//* Makes the user logout if they click logout
app.delete("/logout", (req, res) => {
    req.logout(req.user, err => {
        if (err) return next(err)
        res.redirect("/")
    })
})

//* Functions that check if the person is authenticated
function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect("/login")
}

function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect("/")
    }
    next()
}

//? Starts the server on port 3000
app.listen(3000);