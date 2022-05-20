// module.exports = (req, res, next) => { 
//     const token = req.body.token || req.query.token || req.headers['x-access-token'];

//     if (token) {
//         jwt.verify(token, req.app.get('api_secret_key'), (err, decoded) => {

//             if (err) res.status(401).json({ status: false, error: 'Auth failed!' });
//             else {
//                 req.decoded = decoded;
//                 next();
//             }
//         });

//     } else {
//         res.status(401).json({ status: false, error: 'No token provided!' });
//     }
// };

const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");

const { TokenExpiredError } = jwt;
const catchError = (err, res) => {
    if (err instanceof TokenExpiredError) {
        return res.status(401).send({ message: "Unauthorized! Access Token was expired!" });
    }
    return res.sendStatus(401).send({ message: "Unauthorized!" });
}
const verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"];
    if (!token) {
        return res.status(403).send({ message: "No token provided!" });
    }
    jwt.verify(token, config.api_secret_key, (err, decoded) => {
        if (err) {
            return catchError(err, res);
        }
        req.userId = decoded.id;
        next();
    });
};