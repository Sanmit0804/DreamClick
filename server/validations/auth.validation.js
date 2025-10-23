const Joi = require('joi');

class AuthValidations {
    static signUpValidation(req, res, next) {
        const schema = Joi.object({
            name: Joi.string().min(3).max(100).required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(6).max(100).required(),
            confirmPassword: Joi.any().valid(Joi.ref('password')).required().messages({
                'any.only': '"confirmPassword" must match "password"',
            }),
            role: Joi.string().valid('user', 'admin', 'content_creator', 'manager').required(),
            phone: Joi.string()
                .pattern(/^[0-9]{10}$/)
                .message('Phone number must be a valid 10-digit number')
                .optional(),

            billingAddress: Joi.object({
                street: Joi.string().allow('').optional(),
                city: Joi.string().allow('').optional(),
                state: Joi.string().allow('').optional(),
                zipCode: Joi.string().allow('').optional(),
            }).optional(),

            creatorProfile: Joi.object({
                bio: Joi.string().allow('').optional(),
                website: Joi.string().uri().allow('').optional(),
                socialLinks: Joi.object({
                    youtube: Joi.string().uri().allow('').optional(),
                    instagram: Joi.string().uri().allow('').optional(),
                    twitter: Joi.string().uri().allow('').optional(),
                }).optional(),
            }).optional(),
        }).options({ stripUnknown: true });
        const { error, value } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            return res
                .status(400)
                .json({ message: 'Bad Request', error: error.details[0].message });
        }

        req.body = value;

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