module.exports = exports = {};
const amqp = require('amqplib');

exports.create_channel =  async function create_channel(exchange_name, url = process.env.AMQP_URL) {

    return amqp.connect(url).then(conn => {

        return conn.createChannel();
    }).then(async channel => {

        let result_channel = await channel.assertExchange(exchange_name, 'topic', {
            durable: false
        });

        return channel;
    }).catch(error => {
        
        console.log(error);
    })
}

exports.send_message =  async function send_message(exchange_name, message, routing_key, channel) {
    if (typeof message !== 'object') {
        console.error('Message is a object');
        return;
    }
    const messageInString = JSON.stringify(message);

    return channel.publish(exchange_name, routing_key, Buffer.from(messageInString));
}

exports.receive_message =  async function receive_message(exchange_name, routing_key, queue_name, channel, callback) {

    return channel.assertQueue(queue_name, {durable: true}, async function (error, ok) {

        if (!error !== null) {
            console.log('Error assert queue');
            console.log(error);
        }  
    }).then(async ok => {
        await channel.bindQueue(ok.queue, exchange_name, routing_key);
        return ok.queue;  
    }).then(queue => {

        return channel.consume(
            queue, 
            (msg) => {
                const msgString = msg.content.toString();
                const msgObject = convertStringToObject(msgString);
                callback(msgObject)
            }, 
            { noAck: true }
        );
    });
}
function convertStringToObject(stringMsg) {
    return JSON.parse(stringMsg);
}

// (async () => {

//     const routing_key = 'order.created';
//     const exchange_name = 'purchase_channel';
//     const payment_queue_name = 'payment_queue';

//     let channel = await create_channel(exchange_name);
    
//     await send_message(exchange_name, 'purchase for order id is ABC', routing_key, channel);

//     await receive_message(exchange_name, routing_key, payment_queue_name, channel, (msg) => {
//         console.log(`Received message with content: ${msg.content.toString()}`);
//     })

//     console.log('Done');
// })();

