const { rabbitMQ } = require('@afs/common');

const database_orders = {
    orders: {
        // transaction_id: 
    }
}
function throwErrorFake() {
    throw Error('err');
}

(async () => {

    const routing_key = 'payment.received';
    const exchange_name = 'purchase_channel';
    const order_queue_name = 'order_queue';

    let channel = await rabbitMQ.create_channel(exchange_name);

    await rabbitMQ.receive_message(
        exchange_name, 
        routing_key, 
        order_queue_name, 
        channel, 
        async (msgObj) => {
            console.log(`Received message with content: ${msg.content.toString()}`)
            // Giả lập order thành công

            try {
                database_orders.orders[msgObj.transaction_id] = 'ordered';
                throwErrorFake(); // giả lập lỗi
                return await rabbitMQ.send_message(
                    exchange_name,
                    msgObj,
                    'order.created',
                    channel
                )
            } catch (error) {
                console.log(error);
                return await rabbitMQ.send_message(
                    exchange_name,
                    msgObj,
                    'rollback',
                    channel
                )
            }
    })
})();
