import amqp from 'amqplib';

let channel = null;

export const connectRabbitMQ = async () => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
        channel = await connection.createChannel();
        console.log("Connected to RabbitMQ in Cart Service");
        return channel;
    } catch (error) {
        console.error("RabbitMQ connection failed:", error);
    }
};

export const getChannel = () => {
    if (!channel) throw new Error("RabbitMQ channel not initialized!");
    return channel;
};
