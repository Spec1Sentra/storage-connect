const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
require('dotenv').config({ path: __dirname + '/./../.env' });


// require passport setup
require('./config/passport-setup');

// require routes
const authRoutes = require('./api/auth');
const choreRoutes = require('./api/chores');
const userRoutes = require('./api/users');

const app = express();

// Body parser middleware to handle request bodies
app.use(express.json());

// initialize passport
app.use(passport.initialize());

// set up routes
app.use('/api/auth', authRoutes);
app.use('/api/chores', choreRoutes);
app.use('/api/users', userRoutes);

// connect to mongodb
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected...'))
.catch(err => console.log(err));

const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('ChoreSwap API is running...');
});

app.listen(port, () => console.log(`Server started on port ${port}`));
