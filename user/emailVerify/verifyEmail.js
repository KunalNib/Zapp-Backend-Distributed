import "dotenv/config";
import nodemailer from "nodemailer";

export const verifyEmail = (token, email) => {
    try {
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
            subject: "Email Verification",
            text: `Please follow this link to verify your email
               http://localhost:5173/verify/${token}`
        }

        transporter.sendMail(mailConfiguration, function (error, info) {
            if (error) throw Error(error);
            console.log('Email sent successfully');
            console.log(info);
        })

    }
    catch (err) {
        console.log(err);
    }


}

