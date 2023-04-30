/** @format */

import { FastifyPluginAsync } from 'fastify'
import nodemailer from 'nodemailer'
import fp from 'fastify-plugin'

const mailer: FastifyPluginAsync = async (server) => {
  async function sendEmail(to: string, subject: string, html: string) {
    const transporter = nodemailer.createTransport({
     service: 'gmail',
     host: 'smtp.gmail.com',
     secure: false,
      auth: {
        user: server.config.NODEMAILER_USER,
        pass: server.config.NODEMAILER_PASS,
      },
      logger: false,
    })
    const mailOptions = {
      from: server.config.NODEMAILER_USER,
      to,
      subject,
      html,
      bcc: server.config.NODEMAILER_USER,
    }
    await transporter.sendMail(mailOptions)
  }
  server.decorate('sendEmail', sendEmail)
}
export default fp(mailer)
