const crypto = require('crypto');
//const hexToBinary = require('hex-to-binary');

const cryptoHash = (...args) => {
    const hash = crypto.createHash('sha256');

    hash.update(args.map( arg => JSON.stringify(arg) ).sort().join(' '));
 
    //return hexToBinary(hash.digest('hex'));
    return hash.digest('hex');
};

module.exports = cryptoHash;