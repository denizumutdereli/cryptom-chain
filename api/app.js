const createError = require('http-errors');
const compression = require('compression');
const express = require('express');
const request = require('request');
const helmet = require('helmet');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');
//const VMNODE = require('../kafka');
const VMNODE = require('../redis');
const Blockchain = require('../blockchain');
const Network = require('../transaction/network');
const Wallet = require('../wallet');

const env = require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` })

const rateLimit = require('express-rate-limit')
var cors = require('cors');

// config
const config = require('./config/auth.config');


//peer config
const DEFAULT_PORT = parseInt(process.env.PORT);
let PEER_PORT;

if (process.env.GENERATE_PEER_PORT === 'true') {
  PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
  console.log("PEER_PORT: " + PEER_PORT)
}
process.env.PORT = PEER_PORT || DEFAULT_PORT;

const isDevelopment = process.env.ENV === 'development';

const REDIS_URL = isDevelopment ?
  'redis://127.0.0.1:6379' :
  'redis://h:p05f9a274bd0e2414e52cb9516f8cbcead154d7d61502d32d9750180836a7cc05@ec2-34-225-229-4.compute-1.amazonaws.com:19289'

const VM_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;

//.ends


// const indexRouter = require('./routes/index');
// const userRouter = require('./routes/users');
// const blockchainRouter = require('./routes/blockchain');

const app = express();

//environment
app.set('env', env);
app.set('api_secret_key', config.api_secret_key);

//**** VM-NODES AND BLOCKCHAIN****
const blockchain = new Blockchain();
const network = new Network();
const wallet = new Wallet();
const wmnode = new VMNODE({ blockchain, network, REDIS_URL });


// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));


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
//app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));


app.use(cookieParser());
app.use(compression()); //Compress all routes

app.use(helmet());

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

// app.use('/', indexRouter);
// app.use('/api', verifyToken);
// app.use('/api/chain/', blockchainRouter);
// app.use('/api/user', userRouter);

//Routes
app.get('/blocks', limiter, (req, res) => {
  res.json(blockchain.chain);
});

app.get('/blocks/length', limiter, (req, res) => {
  res.json(blockchain.chain.length);
});

app.get('/blocks/:id', limiter, (req, res) => {
  const { id } = req.params;
  const { length } = blockchain.chain;

  const blocksReversed = blockchain.chain.slice().reverse();

  let startIndex = (id - 1) * 5;
  let endIndex = id * 5;

  startIndex = startIndex < length ? startIndex : length;
  endIndex = endIndex < length ? endIndex : length;

  res.json(blocksReversed.slice(startIndex, endIndex));
});

app.post('/mine', limiter, (req, res) => {
  const { data } = req.body;

  blockchain.addBlock({ data });

  wmnode.broadcastChain();

  res.redirect('/blocks');
});


app.post("/transaction", limiter, (req, res, next) => {
  const { amount, recipient } = req.body;

  let transaction = network.existingTransaction({ inputAddress: wallet.publicKey });

  try {
    if (transaction) {
      transaction.update({ senderWallet: wallet, recipient, amount });
    } else {
      transaction = wallet.createTransaction({
        recipient,
        amount,
        chain: blockchain.chain
      });
    }
  } catch (error) {
    return res.status(400).json({ type: 'error', message: error.message });
  }

  network.setTransaction(transaction);

  wmnode.broadcastTransaction(transaction);

  res.json({ type: 'success', transaction });
});

app.get("/network", limiter, (req, res, next) => {
  console.log('network:', network);
  res.json(network.transactionMap);
});


//.ends

const syncWithRootState = () => {
  request({ url: `${VM_NODE_ADDRESS}/blocks` }, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const rootChain = JSON.parse(response.body);
      console.log('replace chain on a sync with,', rootChain);
      blockchain.replaceChain(rootChain);
    }
  });

  request({url: `${VM_NODE_ADDRESS}/network`}, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      const rootNetwork = JSON.parse(body);
      console.log('replace network pool map on a sync with', rootNetwork);
      network.setMap(rootNetwork);
    }
  });

}

setTimeout(() => wmnode.broadcastChain(), 1000);
//**** VM-NODES */


// catch 404 and forward to error handler

app.use((req, res, next) => {
  // next(createError(404));
  res.status(404).json('Method or function not found!');
});

// error handler

app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.status(400).json({ status: false, errror: err.message, code: err.code });
});

if (DEFAULT_PORT !== process.env.PORT) {
  syncWithRootState();
}

console.log(DEFAULT_PORT, PEER_PORT, '*')


module.exports = app;
