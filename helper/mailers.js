const nodemailer = require('nodemailer')
const dotenv = require('dotenv')
dotenv.config()


const sendEmail = async (options) => {
  try {
    let transporter = nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.mailtrapUsername, // generated ethereal user
        pass: process.env.mailtrapPassword, // generated ethereal password
      },
    });

    const message = {
      from: `${process.env.fromName} <${process.env.fromEmail}>`,
      to: options.email,
      subject: options.subject,
      text: options.message
    }

    const info = await transporter.sendMail(message)
    // return { error: false }
  } catch (error) {
    res.json({
      error: error.message
    })
  }

}

module.exports = { sendEmail }