const Joi = require('joi');

class AuthValidations {
    static signUpValidation(req, res, next) {
        const schema = Joi.object({
            name: Joi.string().min(3).max(100).required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(6).max(100).required(), 
        });
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: "Bad Request", error: error.details[0].message });
        }
        next();
    }

    static loginValidation(req, res, next) {
        const schema = Joi.object({
            email: Joi.string().email().required(),
            password: Joi.string().required(),
        });
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: "Bad Request", error: error.details[0].message });
        }
        next();
    }
}

module.exports = AuthValidations;