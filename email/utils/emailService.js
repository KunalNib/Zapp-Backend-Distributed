import nodemailer from "nodemailer";
import "dotenv/config";

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

export const sendEmailVerification = async (email, token) => {
    const mailConfiguration = {
        from: process.env.MAIL_USER,
        to: email,
        subject: "Email Verification",
        text: `Please follow this link to verify your email\nhttp://localhost:5173/verify/${token}`
    };
    return transporter.sendMail(mailConfiguration);
};

export const sendOTP = async (email, otp) => {
    const mailConfiguration = {
        from: process.env.MAIL_USER,
        to: email,
        subject: "Password Reset OTP",
        text: `Your OTP for password reset is: ${otp}`
    };
    return transporter.sendMail(mailConfiguration);
};

export const sendOrderCreated = async (email, orderDetails) => {
    const mailConfiguration = {
        from: process.env.MAIL_USER,
        to: email,
        subject: "Order Created Successfully",
        text: `Your order has been created!\nAmount: ${orderDetails.amount} ${orderDetails.currency}`
    };
    return transporter.sendMail(mailConfiguration);
};

export const sendPaymentDone = async (email, orderDetails) => {
    const mailConfiguration = {
        from: process.env.MAIL_USER,
        to: email,
        subject: "Payment Successful",
        text: `We have received your payment for order ID: ${orderDetails.orderId}.\nThank you!`
    };
    return transporter.sendMail(mailConfiguration);
};
