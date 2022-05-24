const redis = require('redis');

const CHANNELS = {
    TEST: 'TEST',
    MAIN: 'MAIN'
}

// const clientId = "kafka-client";
// const brokers = ["localhost:9092"];
// const groupId = 'miner' //1000+ Math.ceil(Math.random() *1000);

class VMNODE {
    constructor({ blockchain }) {
        this.blockchain = blockchain;

        this.producer = redis.createClient({url: 'redis://localhost:6379'});

        this.producer.on("error", function (error) {
            console.error(error);
        });

        //this.publisher.connect(); redis version ^4.0

        this.producer.on("connect", function (error) {
            console.info('publisher connected');
        });

        this.connsumer = redis.createClient({url: 'redis://localhost:6379'});
        //this.connsumer.connect(); redis version ^4.0

        this.connsumer.on("error", function (err) {
            console.log("Error " + err);
        });

        this.connsumer.on("connect", function (error) {
            console.info('consumer connected');
        });

        // Consumer Subscribe to all channels
        Object.values(CHANNELS).forEach(channel => {
            this.connsumer.subscribe(channel);
        });

        this.connsumer.on('message', (channel, message) => this.handleMessage(channel, message));

    }

    handleMessage(channel, message) {
        async () => {
            let parsedMessage = JSON.parse(message);
            if (channel === 'MAIN') {
                this.blockchain.replaceChain(parsedMessage);
            }
            console.log(`Message received on channel: ${channel} the message: ${JSON.parse(message)}`);
        }
    }

    publish({ channel, message }) {

        const sequenceOfOperation = new Promise((resolve, reject) => {
            // this.consumer.quit();
            resolve(this.connsumer.unsubscribe());
        });
        sequenceOfOperation.then((c) => {
            this.producer.publish(channel, JSON.stringify(message));
        }).then(() => {
            this.connsumer.subscribe(channel);
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