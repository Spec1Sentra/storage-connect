const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/./../../../.env' });

const User = mongoose.model('User');

module.exports = async (req, res, next) => {
    const { authorization } = req.headers;
    // authorization === 'Bearer laksjdflaksdjas'

    if (!authorization) {
        return res.status(401).send({ error: 'You must be logged in.' });
    }

    const token = authorization.replace('Bearer ', '');
    jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
        if (err) {
            return res.status(401).send({ error: 'You must be logged in.' });
        }

        const { id } = payload;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).send({ error: 'User not found.' });
        }

        req.user = user;
        next();
    });
};
