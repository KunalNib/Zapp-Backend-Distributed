import amqp from 'amqplib';

let channel = null;

export const connectRabbitMQ = async (retries = 5) => {
    while (retries > 0) {
        try {
            const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
            channel = await connection.createChannel();
            console.log("Connected to RabbitMQ in Cart Service");
            
            connection.on("error", (err) => {
                console.error("RabbitMQ Connection Error:", err);
            });
            
            connection.on("close", () => {
                console.log("RabbitMQ Connection Closed, retrying...");
                channel = null;
                setTimeout(connectRabbitMQ, 5000);
            });

            return channel;
        } catch (error) {
            retries -= 1;
            console.error(`RabbitMQ connection failed, retries left: ${retries}`, error);
            if (retries === 0) {
                console.error("Could not connect to RabbitMQ in Cart Service.");
            } else {
                await new Promise(res => setTimeout(res, 5000));
            }
        }
    }
};

export const getChannel = () => {
    if (!channel) throw new Error("RabbitMQ channel not initialized!");
    return channel;
};
