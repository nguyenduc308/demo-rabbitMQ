const express = require('express');
const bodyParser = require('body-parser');
const { rabbitMQ } =  require('@afs/common');
const app = express();

app.use(bodyParser.json());

app.post('/purchase', (req, res) => {
    
    const routing_key = 'order.created';
    const exchange_name = 'purchase_channel';
    const payment_queue_name = 'payment_queue';

    let channel = await rabbitMQ.create_channel(exchange_name);
    
    await rabbitMQ.send_message(
                exchange_name, 
                req.body,
                routing_key, 
                channel
            );

    await receive_message(exchange_name, routing_key, payment_queue_name, channel, (msg) => {
        console.log(`Received message with content: ${msg.content.toString()}`);
    })


    return res.status(200).send(req.body.transaction_id)
});

app.listen(5000, ()=> {
    console.log('runningg');
})