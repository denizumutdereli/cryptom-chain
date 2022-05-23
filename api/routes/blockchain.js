const express = require("express");
const router = express.Router();

const rateLimit = require("express-rate-limit");
const Blockchain = require("../../blockchain/blockchain");
const VMNODE = require("../../redis");


const blockchain = new Blockchain(); //temporary initial
const vmnode = new VMNODE({ blockchain });

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
 * @api {get} /blocks
 * @apiName Get Blocks
 * @apiPermission JWT / 720 seconds / Active Session - no paralel use
 * @apiGroup User
 *
 * @rateLimit 1 Hour Window (IP) / Request limit:100 JWT 12 minutes
 * 
 * @apiSuccess (200) {Object} mixed `JWT token` object
 * @apiError (401) {Object} {status: false, message: message}
 * 
 * @refreshToken to be implemented!
 **/

router.get("/blocks", AccountLimiter, (req, res, next) => {
    res.json(blockchain.chain);
});

/**
 * @api {post} /mine
 * @apiName create blocks
 * @apiPermission JWT / 720 seconds / Active Session - no paralel use
 * @apiGroup User
 *
 * @rateLimit 1 Hour Window (IP) / Request limit:100 JWT 12 minutes
 * 
 * @apiSuccess (200) {Object} mixed `JWT token` object
 * @apiError (401) {Object} {status: false, message: message}
 * 
 * @refreshToken to be implemented!
 **/

router.post("/mine", AccountLimiter, (req, res, next) => {
    const { data } = req.body

    blockchain.addBlock({ data });

    //vmnode.broadCastChain();

    res.redirect('/blocks');
});

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
