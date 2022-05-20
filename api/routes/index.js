const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const { verifySignUp } = require("../middleware");
const controller = require("../controllers/auth.controller");

const AccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // Limit each IP to 1 create account requests per `window` (here, per hour)
  message: {
    status: false,
    message: "Too many conections by same IP, please follow-up x-limits and try again after an hour later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @api {post} /user /register Create user
 * @apiName Create new users
 * @apiPermission Registration
 * @apiGroup User
 *
 * @apiParam  {String} [userName] username unique
 * @apiParam  {String} [email] password
 * @apiParam  {String} [role] enum [seller, buyer] from Schema
 * 
 * @rateLimit 1 Hour Window (IP) / Request limit:100 JWT 12 minutes
 * 
 * @apiSuccess (200) {Object} mixed `User` object -> @apiHiddenParam {String} password
 * @apiError (200) {Object} {status: false, message: message}
 **/

router.post(['/user', '/register'], AccountLimiter, [
  verifySignUp.checkDuplicateUsernameOrEmail,
  verifySignUp.checkRolesExisted
],
  controller.signup);

/**
 * @api {post} /auth Auth user
 * @apiName Auth users
 * @apiPermission JWT / 720 seconds / Active Session - no paralel use
 * @apiGroup User
 *
 * @apiParam  {String} [userName] username
 * @apiParam  {String} [email] password
 * 
 * @rateLimit 1 Hour Window (IP) / Request limit:100 JWT 12 minutes
 * 
 * @apiSuccess (200) {Object} mixed `JWT token` object
 * @apiError (401) {Object} {status: false, message: message}
 **/

router.post("/auth", AccountLimiter, controller.signin);
/**
 * @api {post} /auth/refreshToken Auth user
 * @apiName Auth RefreshToken users
 * @apiPermission JWT / 720 seconds / Active Session - no paralel use
 * @apiGroup User
 *
 * @apiParam  {String} [userName] username
 * @apiParam  {String} [email] password
 * 
 * @rateLimit 1 Hour Window (IP) / Request limit:100 JWT 12 minutes
 * 
 * @apiSuccess (200) {Object} mixed `JWT token` object
 * @apiError (401) {Object} {status: false, message: message}
 **/

router.post("/auth/refresh", AccountLimiter, controller.refreshToken);
/**
 * @api {all} / Default Welcome
 * @apiName Welcome
 * @apiPermission Guests
 * @apiGroup User
 * 
 * @rateLimit 1 Windwos (IP) / Request limit:100 - Default Limit app.js
 * 
 * @apiSuccess (200) {Object} mixed object
 * @apiError (404) {Object} {status: true, message: message}
 **/

router.all("/", (req, res, next) => {
  res.json({ status: true, server: "Up", data: "welcome to the Cryptom-Chain Rest Api" });
});

module.exports = router;
