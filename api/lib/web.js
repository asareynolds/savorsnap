const express = require('express')
var bodyParser = require('body-parser')
const cors = require('cors');
const user = require('./user.js');
const fs = require('fs');

const { rootOrgId,default_owner } = require('../config.json');

const app = express();
app.use(bodyParser.json())

app.use(cors());
app.listen(80, () => {
    console.log('Accepting requests on port 80');
});
app.set('trust proxy', true)

/*
Users
*/
//Run by user (self)
app.post('/user/register', async(req, res) => {
    const { client_id, client_ip } = authFromHeaders(req)
    const { user_email, user_pass, user_fname, user_lname } = req.body

    res.setHeader('Content-Type', 'application/json');

    try {
        const createUserResult = await user.create(user_email, user_pass, user_fname, user_lname);

        email.sendVerification(createUserResult);

        const createTokenResult = await token.generate("standard", createUserResult, client_id, client_ip);
        res.json({
            result: "success",
            id: createUserResult,
            token: createTokenResult
        });
    } catch (error) {
        res.json({
            result: "error",
            type: error
        });
    }
});