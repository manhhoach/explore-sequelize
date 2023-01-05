const userService = require('./../services/userService')
const jwt_token = require('./../middlewares/jwt_token');
const { responseSuccess, responseWithError } = require('./../utils/response')
const bcryptjs = require('bcryptjs');



module.exports.getMe = async (req, res, next) => {
    try {
        res.json(responseSuccess(req.user))
    }
    catch (err) {
        res.json(responseWithError(err))
    }
}

module.exports.register = async (req, res, next) => {
    try {
        let user = { ...req.body };
        let data = await userService.create(user);
        delete data.dataValues.password;
        res.json(responseSuccess(data.dataValues));

    }
    catch (err) {
        res.json(responseWithError(err))
    }
}

module.exports.login = async (req, res, next) => {
    try {
        let user = await userService.findOne({ email: req.body.email }, true);

        if (user) {
            user = user.dataValues;
            let checkPassword = bcryptjs.compareSync(req.body.password, user.password);
            if (checkPassword) {
                let token = jwt_token.signToken({
                    id: user.id
                })
                delete user.password;
                res.json(responseSuccess({ ...user, token }))
            }
            else {
                res.json(responseWithError("PASSWORD IS INVALID"))
            }
        }
        else {
            res.json(responseWithError("USER IS NOT EXIST"))
        }

    }
    catch (err) {
        res.json(responseWithError(err))
    }
}
