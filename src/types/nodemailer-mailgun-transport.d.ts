import * as nodemailer from 'nodemailer'
import Mail = require('nodemailer/lib/mailer')
import MailMessage = require('nodemailer/lib/mailer/mail-message')

declare namespace mailgunTransport {
    interface AuthOptions {
        api_key: string
        domain?: string
    }

    interface Options {
        auth: AuthOptions
    }

    type MailOptions = Mail.Options

    class MailgunTransport implements nodemailer.Transport {
        name: string
        version: string
        send(
            mail: MailMessage,
            callback: (err: Error | null, info?: object) => void
        ): void
    }
}

declare function mailgunTransport(
    options: mailgunTransport.Options
): mailgunTransport.MailgunTransport

export = mailgunTransport
