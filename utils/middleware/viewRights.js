const AccessRights = require("../../models/AccessRights");  

const viewAccessMiddleware = (requiredAccessType) => async (req, res, next) => {
    try {
      if (req.session.username !== undefined) {
        if (req.session.admin_access === 1) {
          return next();
        } else {
          const query = { "rolename": req.session.role_slug };
          const result = await AccessRights.findOne(query);
  
          if (result && result.access_type && result.access_type[requiredAccessType] && result.access_type[requiredAccessType].view !== undefined) {
            return next();
          } else {
            res.redirect('/dashboard');
          }
        }
      } else {
        res.redirect('/');
      }
    } catch (error) {
      console.error(error);
      res.redirect('/dashboard');
    }
  };
  module.exports = viewAccessMiddleware;