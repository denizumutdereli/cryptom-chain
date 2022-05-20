const { Kafka,Partitioners  } = require('kafkajs');

async function Producer(clientId, brokers, channel, message) {
    try {
        const kafka = new Kafka({
            clientId: clientId,
            brokers: brokers,
        });

        const producer = kafka.producer({ createPartitioner: Partitioners.DefaultPartitioner })
        //console.log("Producer connecting..");
        await producer.connect();
        //console.log("Connected.");
 
        const message_result = await producer.send({
            topic: channel,
            messages: [
                {
                    value: message,
                    partition: 0
                }
            ]
        });

        console.log("Produced!", JSON.stringify(message_result));
        await producer.disconnect();
    } catch (error) {
        console.log("Error", error);
    }
}

module.exports = Producer;