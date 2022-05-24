const uuid = require('uuid');
const { verifySignature } = require('../utilities/ec');

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
        //outputMap[currency] = amount;
        return outputMap;
    }

    createInput({ senderWallet, outputMap }) {
        return {
            timestamp: Date.now(),
            amount: senderWallet.balance,
            //currency: senderWallet.currency,
            address: senderWallet.publicKey,
            signature: senderWallet.sign(outputMap)
        }
    }

    update({senderWallet, recipient, amount, currency}){


       if(amount > this.outputMap[senderWallet.publicKey]) {
            throw new Error('Amount exceeds the balance');
       }

       if(!this.outputMap[recipient]) {
           this.outputMap[recipient] = amount;
       } else {
           this.outputMap[recipient] += amount;
       }

       //this.outputMap[recipient] = amount;
       this.outputMap[senderWallet.publicKey] -= amount;
       this.input = this.createInput({senderWallet, outputMap: this.outputMap}); //referenced objs are the still the same
    }

    static validTransaction(transaction) {
        const { input: { address, amount, currency, signature }, outputMap } = transaction;

        const outputTotal = Object.values(outputMap)
            .reduce((total, outputAmount) => total + outputAmount);

        if (amount !== outputTotal) {
            console.error(`Invalid transaction from ${address}`);
            return false
        };

        if(!verifySignature({publicKey: address, data: outputMap, signature})){
            console.error(`Invalid signature from ${address}`);
            return false;
        }

        return true;
    }
}

module.exports = Transaction;