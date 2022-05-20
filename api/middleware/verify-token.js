const jwt = require("jsonwebtoken");
module.exports = (req, res, next) => {
  let token =
    req.body.token ||
    req.query.token ||
    req.headers["x-access-token"] ||
    req.headers.authorization;

  if (req.headers.authorization) {
    token = req.headers.authorization.split("Bearer ")[1];
  }

  if (token) {
    jwt.verify(token, req.app.get("api_secret_key"), (err, decoded) => {
      if (err) res.status(401).json({ status: false, error: "Auth failed!" });
      else {
        req.decoded = decoded;
        next();
      }
    });
  } else {
    res.status(401).json({ status: false, error: "No token provided!" });
  }
};