const { STARTING_BALANCE } = require('../blockchain/chain-config');
const { ec } = require('../utilities/ec');
const cryptoHash = require('../utilities/crypto-hash');

class Wallet {

    constructor() {
        this.balance = STARTING_BALANCE;

        this.keyPair = ec.genKeyPair();
        this.publicKey = this.keyPair.getPublic().encode('hex');

        //console.log(this.publicKey); 
    }

    sign(data) {
        return this.keyPair.sign(cryptoHash(data));
    }

}

module.exports = Wallet;