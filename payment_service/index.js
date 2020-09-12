const { rabbitMQ } = require('@afs/common');

const database_payment =  {
    customer_id: 1,
    customer_balance: 1000,
    payment_transactions: {
        // transaction_id: {payment_amount}
    }
}

(async () => {

    const routing_key = 'payment.request';
    const exchange_name = 'purchase_channel';
    const payment_queue_name = 'payment_queue';

    let channel = await rabbitMQ.create_channel(exchange_name);
    await rabbitMQ.receive_message(
        exchange_name,
        routing_key, 
        payment_queue_name, 
        channel, 
        (msgObject) => {
            console.log(`Received message with content: ${msgObject}`);
            const { amount, product_amount } = msgObject;
            
            const remainBalance = database_payment.customer_balance - amount;
            database_payment.customer_balance = remainBalance;

            database_payment.payment_transactions[transaction_id] = {
                payment_amount: product_amount
            }

            console.log(database_payment);

            await rabbitMQ.send_message(exchange_name, msgObject, 'payment.received', channel)
        })
})();