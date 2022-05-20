const Producer = require('./Producer');
const Consumer = require('./Consumer');

const CHANNELS = {
    TEST: 'TEST',
    MAIN: 'MAIN'
}

const clientId = "kafka-client";
const brokers = ["localhost:9092"];
const groupId = "miner";

class VMNODE{

    constructor({ blockchain }) {

        this.blockchain = blockchain;

        this.consumer = Consumer(clientId, brokers, groupId, CHANNELS);
    }

    publish({ channel, message }) {
        this.producer = Producer(clientId, brokers, channel, JSON.stringify(message));
    }

    broadCastChain() {
        this.publish({
            channel: CHANNELS.MAIN,
            message: JSON.stringify(this.blockchain.chain)
        });
    }

}


module.exports = VMNODE;