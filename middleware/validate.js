export const sanitizeData = (req, res, next) => {
  const clean = (obj) => {
    for (let key in obj) {
      if (key.includes('$') || key.includes('__proto__')) {
        delete obj[key];
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        clean(obj[key]);
      }
    }
  };

  if (req.body) {
    clean(req.body);
    // Prevent Mass Assignment Privilege Escalation
    delete req.body.role;
    delete req.body.isAdmin;
    delete req.body.isSuperAdmin;
  }
  if (req.query) clean(req.query);
  if (req.params) clean(req.params);

  next();
};
