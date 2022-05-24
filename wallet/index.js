const { STARTING_BALANCE } = require('../blockchain/chain-config');
const { ec, cryptoHash } = require('../utilities/ec');

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