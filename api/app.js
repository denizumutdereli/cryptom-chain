const createError = require('http-errors');
const compression = require('compression');
const express = require('express');
const helmet = require('helmet');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const env = require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` })



const rateLimit = require('express-rate-limit')
var cors = require('cors');

// config
const config = require('./config/auth.config');

const indexRouter = require('./routes/index');
const userRouter = require('./routes/users');

const app = express();

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

//environment
app.set('env', env);
app.set('api_secret_key', config.api_secret_key);

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})
  

// midlleware
const verifyToken = require('./middleware/verify-token');

/* DB Connection */
const db = require('./config/db.config')();

app.use(limiter)
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression()); //Compress all routes

app.use(helmet());

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors()); 

app.use('/', indexRouter);
app.use('/api', verifyToken);
app.use('/api/user', userRouter);
 
// catch 404 and forward to error handler

app.use((req, res, next) => {
 // next(createError(404));
 res.status(404).json('Method or function not found!');
});

// error handler

app.use((err, req, res, next)=>{
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.status(400).json({errror: err.message, code:err.code});
});

module.exports = app;
