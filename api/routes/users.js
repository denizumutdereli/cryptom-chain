const express = require("express");
const User = require("../models/User");
const router = express.Router();
const bcrypt = require("bcryptjs");
 //caution not the C version. pure node! 
const rateLimit = require("express-rate-limit");

const UserLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 1 create account requests per `window` (here, per hour)
  message: {
    status: false,
    message:
      "Too many conections by same IP, please follow-up x-limits and try again after an hour later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @api {get} /users /users/account /users/profile
 * @apiName Show Profile - if user.role == admin, list all;
 * @apiPermission JWT Token
 * @apiGroup User
 *
 * @apiParam  {String} [token] token
 * @apiHiddenParam {String} password
 *
 * @rateLimit 1 Hour Window (IP) / Request limit:10 / JWT 12 minutes
 *
 * @apiSuccess (200) {Object} mixed `User` object(s) -> user.role == admin, list all
 * @apiError (200) {Object} {status: false, message: message} //code:0 for I/O signals
 **/

router.get(["/", "/account", "/profile"], UserLimiter, (req, res, next) => {
  let userid = req.decoded.username; //default parameters from JWT token. partial-stateless
  let userRole = req.decoded.role;
  let param = { username: userid };

  userRole == "admin" ? (param = {}) : null; //admin can list all users
  const promise = User.find(param, { password: 0 }).sort({ type: -1 });

  promise
    .then((data) => {
      !data
        ? next({ message: "No user found!", code: 0 })
        : res.json({ status: true, data: data });
    })
    .catch((e) => {
      return res.status(400).json({ status: false, error: e.message });
    });
});

/**
 * @api {put} /users/update:user_id
 * @apiName Update user - if user.role == admin, possible to update all;
 * @apiPermission JWT Token
 * @apiGroup User
 *
 * @apiParam  {String} [token] token
 * @apiParam  {String} [password] password - auto hash when update
 * @apiImmutableParam  {String} [role] enum [user, admin] from Schema immutable:true/false
 * @apiImmutableParam {String} [username] username from Schema immutable:true/false
 *
 * @rateLimit 1 Hour Window (IP) / Request limit:10 / JWT 12 minutes
 *
 * @apiFixing if user_id is different then the authenticated user's id,
 * ignoring the user_id parameter and continue with user own id.{userid = username from JWTtoken}
 *
 * @apiSuccess (200) {Object} mixed `User` object
 * @apiError (200) {Object} {status: false, message: message} //code:0 for I/O signals
 **/

router.put("/update/:user_id", UserLimiter, (req, res, next) => {
  if (req.params.user_id.match(/^[0-9a-fA-F]{24}$/) || !req.body) {
    let userid = req.decoded.username;
    let userRole = req.decoded.role;
    let param = { username: userid };

    userRole == "admin" ? (param = { _id: req.params.user_id }) : null;

    let { password, role } = req.body;

    const promise = new Promise((resolve, reject) => {
      //async password hashing.
      password
        ? bcrypt.hash(password, 10).then((hash) => resolve(hash))
        : resolve(null);
    });

    promise.then((hash) => {
      hash ? (password = hash) : null;

      User.findOneAndUpdate(
        param,
        { password, role },
        { new: true, runValidators: true }
      )
        .select({ password: 0, __v: 0 })
        .then((data) => {
          !data
            ? next({ message: "User not found!", code: 0 })
            : res.json({ status: true, data: data });
        })
        .catch((e) => {
          return res.status(400).json({ status: false, error: e.message });
        }); //admin can update anyone
    });
  } else return res.status(400).json({ status: false, message: "invalid id or empty data" });
});

/**
 * @api {delete} /users/delete:user_id
 * @apiName Delete User - if user.role == admin, possible to reset all + relations with schema mognoose 4.13 to all users;
 * @apiPermission JWT Token and only user.role == admin
 * @apiGroup Admin
 *
 * @apiParam  {String} [token] token
 *
 * @rateLimit 1 Hour Window (IP) / Request limit:100 / JWT 12 minutes  (UserLimiter not in charge)
 *
 * @apiFixing I let admins to be able to delete their own accounts. Suppose there would be a backend.
 *
 * @apiSuccess (200) {Object} {status: true, message: message}
 * @apiError (200) {Object} {status: false, message: message} //code:0 for I/O signals for demo purpose
 **/

router.delete("/delete/:user_id", (req, res, next) => {
  if (req.params.user_id.match(/^[0-9a-fA-F]{24}$/) || !req.body) {
    let userid = req.decoded.username;
    let userRole = req.decoded.role;

    if (userRole != "admin")
      next({ status: false, message: "You are not allowed to this action" });
    else {
      // @ts-ignore
      const promise = User.findOneAndRemove(req.params.user_id); //Iam letting admins to delete their own accounts :)
      promise
        .then((data) => {
          !data
            ? next({ message: "Not found!", code: 0 })
            : res.json({ status: true, message: "User deleted!" });
        })
        .catch((e) => {
          return res.status(400).json({ status: false, error: e.message });
        });
    }
  } else return res.status(400).json("invalid id or empty data");
});

module.exports = router;
