// req.params || req.query || req.body
const joiValidate = (schema, property = "body") => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], { abortEarly: false });
    if (error) {
      return res.status(400).json({
        errors: error.details.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    next();
  };
};

module.exports = joiValidate;
