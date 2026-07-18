import { getChannel } from '../utils/rabbitmq.js';
import { Cart } from '../models/cartModel.js';

export const consumeOrderEvents = async () => {
    try {
        const channel = getChannel();
        const exchange = 'order_exchange';
        
        await channel.assertExchange(exchange, 'topic', { durable: true });
        
        const q = await channel.assertQueue('cart_order_events_queue', { durable: true });
        
        await channel.bindQueue(q.queue, exchange, 'order.payment.successful');

        console.log("Cart Service is waiting for order events...");

        channel.consume(q.queue, async (msg) => {
            if (msg !== null) {
                const event = JSON.parse(msg.content.toString());
                const routingKey = msg.fields.routingKey;

                if (routingKey === 'order.payment.successful') {
                    const { userId } = event;
                    try {
                        await Cart.findOneAndUpdate({ userId }, { $set: { items: [], totalPrice: 0 } });
                        console.log(`Successfully cleared cart for user: ${userId}`);
                    } catch (err) {
                        console.error("Error clearing cart:", err);
                    }
                }
                channel.ack(msg);
            }
        });
    } catch (err) {
        console.error("Failed to setup order events consumer:", err);
    }
};
