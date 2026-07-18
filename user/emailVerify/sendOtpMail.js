import "dotenv/config";
import nodemailer from "nodemailer";

export const sendOTPMail = (otp, email) => {
    try{
        const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    })

    const mailConfiguration = {
        from: process.env.MAIL_USER,
        to: email,
        subject: "Password reset OTP",
        html: `<p>Here's your otp for password reset is :<b>${otp}</b></p>`
    }

    transporter.sendMail(mailConfiguration, function (error, info) {
        if (error) throw Error(error);
        console.log('OTP sent successfully');
        console.log(info);
    })

    }
    catch(err){
        console.log(err);
    }


}