const accessRights = require("../../models/AccessRights");

const addAccessMiddleware = (requiredAccessType) => async (req, res, next) => {
  try {
    console.log(requiredAccessType);
    if (req.session.username !== undefined) {
      if (req.session.admin_access === 1) {
        console.log("admin", req.session.admin_access);
        return next();
      } else {
        const query = { "rolename": req.session.role_slug };
        const result = await accessRights.findOne(query);
        console.log("result", result);
        console.log('url', req.url);
        console.log('add', result.access_type[requiredAccessType].add);
        console.log('update', result.access_type[requiredAccessType].update);

        // Check if the URL has an ID at the end
        const hasId =/\/[a-f\d]{24}$/i.test(req.url);

        if (hasId) {
          if (
            result &&
            result.access_type &&
            result.access_type[requiredAccessType] &&
            result.access_type[requiredAccessType].update !== undefined
          ) {
            console.log("access rights found for update")
            return next();
          } else {
            res.redirect('/dashboard');
            console.log("no rights found for update!");
          }
        } else {
          if (
            result &&
            result.access_type &&
            result.access_type[requiredAccessType] &&
            result.access_type[requiredAccessType].add !== undefined
          ) {
            console.log("access rights found for add")
            return next();
          } else {
            res.redirect('/dashboard');
            console.log("no rights found for add!");
          }
        }
      }
    } else {
      res.redirect('/');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = addAccessMiddleware;
