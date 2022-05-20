const { Kafka } = require('kafkajs');
const Blockchain = require('../blockchain/blockchain');

blockchain = new Blockchain();

async function Consumer(clientId, brokers, groupId, channels) {
    try {
        const kafka = new Kafka({
            clientId: clientId,
            brokers: brokers,
        });

        const consumer = kafka.consumer({
            groupId: groupId,
        });

        console.log("Signal consumer connecting..");
        await consumer.connect();
        console.log("Connected.");

        // Consumer Subscribe..
        Object.values(channels).forEach(channel => {
            
            consumer.subscribe({
                topic: channel,
                fromBeginning: true
            });
        });

        await consumer.run({
            eachMessage: async result => {
                console.log(`Message received: \n${JSON.parse(result.message.value)} on channel: ${result.topic}`);

                let parsedMessage = JSON.parse(result.message.value);
                if (result.topic === 'MAIN') {
                    blockchain.replaceChain(parsedMessage);
                }

            }
        });
    } catch (error) {
        console.log("Error", error);
    }
}

module.exports = Consumer;

