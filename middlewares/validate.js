import Joi from 'joi';

export const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return next({ statusCode: 400, message: error.details[0].message });
  }
  next();
};
