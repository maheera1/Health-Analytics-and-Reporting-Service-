export const validateRequest = (schema) => (req, _res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      const message = error.details.map(detail => detail.message).join(', ');
      return next(createError(400, message));
    }
    next();
  };