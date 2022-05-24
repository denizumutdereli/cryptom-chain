const Transaction = require('../transaction');
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

    createTransaction( {recipient, amount, currency}){
        if(amount > this.balance){
            throw new Error('Amount exceeds the balance');
        }
        return new Transaction( {senderWallet: this, recipient, amount, currency });
    }

}

module.exports = Wallet;