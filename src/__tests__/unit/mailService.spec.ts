import { stubTransport } from 'nodemailer-stub'

import { MailService, MailTemplatesOpts } from '../../services/MailService'

const stubMailer = new MailService(stubTransport)
const to = 'duranhumes1@gmail.com'

describe('Mail Service', () => {
    test('sends properly formatted template email', async () => {
        const options = {
            to,
            params: {
                userName: 'Duran',
                confirmLink: 'https://duranhumes.com',
            },
        }
        const template = MailTemplatesOpts.AccountConfirmation
        const mail = await stubMailer.sendTemplateMail(options, template)

        expect(mail).toHaveProperty('template')
        expect(mail.template!.name).toContain(template)
        expect(mail.subject).toContain(options.params.userName)
    })
    test('sends proper basic email', async () => {
        const options = {
            to,
            subject: 'Stubbed test email',
            html: '<p>Stubbed test email</p>',
        }
        const mail = await stubMailer.sendBasicMail(options)

        expect(mail).toHaveProperty('subject')
        expect(mail.subject).toContain(options.subject)
    })
})
