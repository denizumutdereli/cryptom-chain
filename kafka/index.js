const Producer = require('./Producer');
const Consumer = require('./Consumer');

const CHANNELS = {
    TEST: 'TEST',
    MAIN: 'MAIN'
}

const clientId = "kafka-client";
const brokers = ["localhost:9092"];
const groupId = 'miner' //1000+ Math.ceil(Math.random() *1000);

class VMNODE {
    constructor({ blockchain }) {

        this.blockchain = blockchain;

        this.consumer = Consumer(clientId, brokers, groupId, CHANNELS);
    }

    publish({ channel, message }) {

        const sequenceOfOperation = new Promise((resolve, reject) => {
            resolve(this.consumer = Consumer(clientId, brokers, groupId, CHANNELS, false));
        });
        sequenceOfOperation.then(() => {
            this.producer = Producer(clientId, brokers, channel, JSON.stringify(message));
        }).then(() => {
            this.consumer = Consumer(clientId, brokers, groupId, CHANNELS);
        })
    }

    broadCastChain() {
        this.publish({
            channel: CHANNELS.MAIN,
            message: JSON.stringify(this.blockchain.chain)
        });
    }

}

module.exports = VMNODE;