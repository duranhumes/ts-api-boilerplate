import { createTransport, Transporter, TransportOptions } from 'nodemailer'

import {
    emailTemplates,
    MailTemplatesOpts,
    IMailTemplate,
} from './EmailTemplates'
import {
    IMailGunMailCredentials,
    IBasicMailCredentials,
    IOAuth2MailCredentials,
} from './MailCredentialsService'
import logging from '../../utils/logging'
import { formattedUUID } from '../../utils'

interface IMail extends IMailTemplate {
    to: string
    html: string
    subject: string
}

interface ITemplateMail {
    to: string
    params: {
        [key: string]: any
    }
}

export type Credentials =
    | IMailGunMailCredentials
    | IBasicMailCredentials
    | IOAuth2MailCredentials
    | TransportOptions

export class MailService {
    transporter: Transporter

    constructor(credentials: Credentials) {
        this.transporter = createTransport(credentials)
        this.verifyTransport()
    }

    verifyTransport = () => {
        this.transporter.verify(error => {
            if (error) {
                logging.error(error)

                throw new Error(error.toString())
            }
        })
    }

    formatMail = (mail: Partial<IMail>) => {
        const email = String(process.env.EMAIL_FROM)
            .split('<')[1]
            .split('>')[0]

        return {
            ...mail,
            generateTextFromHTML: true,
            from: process.env.EMAIL_FROM,
            dsn: {
                id: formattedUUID(),
                return: 'headers',
                notify: ['success', 'failure', 'delay'],
                recipient: email,
            },
        }
    }

    sendTemplateMail = async (
        { to, params }: ITemplateMail,
        template: MailTemplatesOpts
    ) => {
        const mail = this.formatMail(emailTemplates[template](params))

        this.transporter.sendMail({ to, ...mail }, err => {
            if (err) {
                logging.error(err)
            }
        })

        this.transporter.close()

        return mail
    }

    sendBasicMail = async (message: IMail) => {
        const mail = this.formatMail(message)

        this.transporter.sendMail(mail, err => {
            if (err) {
                logging.error(err)
            }
        })

        this.transporter.close()

        return mail
    }
}
