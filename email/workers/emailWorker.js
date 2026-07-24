import amqp from 'amqplib';
import { sendEmailVerification, sendOTP, sendOrderCreated, sendPaymentDone } from '../utils/emailService.js';

export const startEmailWorker = async (retries = 5) => {
    while (retries > 0) {
        try {
            const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
            const channel = await connection.createChannel();
            
            connection.on("error", (err) => {
                console.error("RabbitMQ Connection Error in Email Worker:", err);
            });
            
            connection.on("close", () => {
                console.log("RabbitMQ Connection Closed in Email Worker, retrying...");
                setTimeout(startEmailWorker, 5000);
            });


        const userExchange = 'user_exchange';
        const orderExchange = 'order_exchange';

        await channel.assertExchange(userExchange, 'topic', { durable: true });
        await channel.assertExchange(orderExchange, 'topic', { durable: true });

        // Setup DLQ
        const dlx = 'email_dlx';
        const dlq = 'email_dlq';
        await channel.assertExchange(dlx, 'topic', { durable: true });
        await channel.assertQueue(dlq, { durable: true });
        await channel.bindQueue(dlq, dlx, '#'); // Bind all dead letters to dlq

        const emailQueue = await channel.assertQueue('email_queue', { 
            durable: true,
            arguments: {
                'x-dead-letter-exchange': dlx
            }
        });

        // Bind queue to different events
        await channel.bindQueue(emailQueue.queue, userExchange, 'user.registered');
        await channel.bindQueue(emailQueue.queue, userExchange, 'user.forgot_password');
        await channel.bindQueue(emailQueue.queue, orderExchange, 'order.created');
        await channel.bindQueue(emailQueue.queue, orderExchange, 'order.payment.successful');

        channel.prefetch(1);
        console.log("Email Worker is listening for messages...");

        channel.consume(emailQueue.queue, async (msg) => {
            if (msg !== null) {
                const event = msg.fields.routingKey;
                const payload = JSON.parse(msg.content.toString());
                
                console.log(`Received event: ${event} with payload:`, payload);

                try {
                    if (!payload || !payload.email) {
                        throw new Error("Missing recipient email in payload");
                    }

                    switch (event) {
                        case 'user.registered':
                            await sendEmailVerification(payload.email, payload.token);
                            break;
                        case 'user.forgot_password':
                            await sendOTP(payload.email, payload.otp);
                            break;
                        case 'order.created':
                            await sendOrderCreated(payload.email, payload.orderDetails);
                            break;
                        case 'order.payment.successful':
                            await sendPaymentDone(payload.email, payload.orderDetails);
                            break;
                        default:
                            console.log(`Unknown event: ${event}`);
                    }
                    channel.ack(msg);
                } catch (error) {
                    console.error("Error processing email event", error);
                    // Nacking with requeue=false pushes it to the Dead Letter Exchange
                    channel.nack(msg, false, false);
                }
            }
        });
        return;
    } catch (error) {
        retries -= 1;
        console.error(`Failed to start Email Worker, retries left: ${retries}`, error);
        if (retries === 0) {
            console.error("Could not connect to RabbitMQ in Email Worker.");
        } else {
            await new Promise(res => setTimeout(res, 5000));
        }
    }
}

}