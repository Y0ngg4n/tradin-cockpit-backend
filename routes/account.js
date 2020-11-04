const express = require('express');
const router = express.Router();

const accounts = require("../models/account");
const auth = require("../middleware/auth");

router.post('/accounts/register', async (req, res) => {
    // Create a new user
    try {
        const {email, password} = req.body;
        const token = await accounts.generateAuthToken(email);
        await accounts.register(email, password, token).then(value => {
            if (value instanceof Error) {
                return res.status(401).send({error: value.message});
            } else {
                return res.status(201).send({token});
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(400).send(error);
    }
});


router.post('/accounts/login', async (req, res) => {
    try {
        const {email, password} = req.body;
        const token = await accounts.generateAuthToken(email);
        await accounts.login(email, password, token).then(userAccount => {
            if (userAccount instanceof Error) {
                return res.status(401).send({error: userAccount.message});
            } else {
                return res.status(200).send(getUserData(userAccount, token));
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(400).send(error);
    }
});

router.get('/accounts/me', auth, async (req, res) => {
    try {
        if (req.user instanceof Error) {
            throw req.user;
        } else {
            return res.status(200).send(getUserData(req.user, req.token));
        }
    } catch (error) {
        console.log(error);
        return res.status(400).send(error);
    }
});

router.post('/accounts/update/apikey', auth, async (req, res) => {
    try {
        const {apikey} = req.body;
        if (req.user instanceof Error) {
            throw req.user;
        } else {
            await accounts.updateApiKey(req.user.email, apikey).then(value => {
                return res.status(200).send();
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(400).send(error);
    }
});


const getUserData = (userAccount, token, apikey) => {
    return {
        uuid: userAccount.uuid,
        email: userAccount.email,
        nickname: userAccount.nickname,
        token: token,
        apikey: userAccount.apikey
    };
};


module.exports = router;