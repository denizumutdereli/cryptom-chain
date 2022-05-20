const { Kafka } = require('kafkajs');

async function Consumer(clientId, brokers, groupId, channel) {
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
        await consumer.subscribe({
            topic: channel,
            fromBeginning: true
        });

        await consumer.run({
            eachMessage: async result => {
                console.log(`Message received: \n${result.message.value} on channel: ${channel}`);
            }
        });
    } catch (error) {
        console.log("Error", error);
    }
}

module.exports = Consumer;

