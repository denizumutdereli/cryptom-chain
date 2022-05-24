const uuid = require('uuid');

class Transaction {
    constructor({ senderWallet, recipient, amount, currency }) {
        this.ID = uuid.v1();
        this.outputMap = this.createOutputMap({ senderWallet, recipient, amount, currency });
        this.input = this.createInput({ senderWallet, outputMap: this.outputMap });
    }

    createOutputMap({ senderWallet, recipient, amount, currency }) {
        const outputMap = {};
        outputMap[recipient] = amount;
        outputMap[senderWallet.publicKey] = senderWallet.balance - amount;
        return outputMap;
    }

    createInput({ senderWallet, outputMap }) {
        return {
            timestamp: Date.now(),
            amount: senderWallet.balance,
            address: senderWallet.publicKey,
            signature: senderWallet.sign(outputMap)
        }
    }
}

module.exports = Transaction;