const { Kafka } = require('kafkajs');

async function Producer(clientId, brokers, channel) {
    try {
        const kafka = new Kafka({
            clientId: clientId,
            brokers: brokers,
        });

        const producer = kafka.producer();
        //console.log("Producer connecting..");
        await producer.connect();
        //console.log("Connected.");
 
        const message_result = await producer.send({
            topic: channel,
            messages: [
                {
                    value: "Sample signal request." + Math.floor(Math.random() * 10000),
                    partition: 0
                }
            ]
        });

        console.log("Produced!", JSON.stringify(message_result));
        //await producer.disconnect();
    } catch (error) {
        console.log("Error", error);
    }
}

module.exports = Producer;