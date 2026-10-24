export function validate(schemas = {}) {
  return function validationMiddleware(req, res, next) {
    try {
      const validated = {};

      if (schemas.params) {
        validated.params = schemas.params.parse(req.params);
      }

      if (schemas.query) {
        validated.query = schemas.query.parse(req.query);
      }

      if (schemas.body) {
        validated.body = schemas.body.parse(req.body);
      }

      req.validated = validated;
      return next();
    } catch (error) {
      return next(error);
    }
  };
}
