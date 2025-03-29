const Joi = require('joi');

class ValidationMiddleware {
  // User registration validation
  static validateUser(req, res, next) {
    const schema = Joi.object({
      username: Joi.string()
        .alphanum()
        .min(3)
        .max(20)
        .required(),
      email: Joi.string()
        .email()
        .required(),
      password: Joi.string()
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'))
        .message('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character')
        .required()
    });

    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: 'Validation Error',
        details: error.details.map(detail => detail.message)
      });
    }

    next();
  }

  // Game creation validation
  static validateGameCreation(req, res, next) {
    const schema = Joi.object({
      rounds: Joi.number()
        .integer()
        .min(1)
        .max(10)
        .optional(),
      timeLimit: Joi.number()
        .integer()
        .min(30)
        .max(180)
        .optional()
    });

    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: 'Validation Error',
        details: error.details.map(detail => detail.message)
      });
    }

    next();
  }

  // Guess submission validation
  static validateGuess(req, res, next) {
    const schema = Joi.object({
      guess: Joi.string()
        .trim()
        .min(1)
        .max(50)
        .required()
    });

    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: 'Validation Error',
        details: error.details.map(detail => detail.message)
      });
    }

    next();
  }
}

module.exports = ValidationMiddleware;
