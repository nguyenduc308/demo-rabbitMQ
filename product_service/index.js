const { rabbitMQ } = require('@afs/common');

const database_products = {
    products: {
        // product_id: 11 So luong sp da ban
    }
}

(async () => {

    const routing_key = 'order.created';
    const exchange_name = 'purchase_channel';
    const product_queue_name = 'product_queue';

    let channel = await rabbitMQ.create_channel(exchange_name);

    await rabbitMQ.receive_message(
        exchange_name, 
        routing_key, 
        product_queue_name, 
        channel, 
        async (msgObj) => {
            console.log(`Received message with content: ${msg.content.toString()}`)
            database_products.products[msgObj.product_id] = (database_products.products[msgObj.product_id] && database_products.products[msgObj.product_id] + 1) || 0;
            return await rabbitMQ.send_message(
                exchange_name,
                msgObj,
                'product.resered',
                channel
            )

    })

    console.log('Done');
})();
