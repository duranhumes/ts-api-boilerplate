import { resolve, normalize, join } from 'path'

import { upperCaseFirstLetter } from '../../utils'

export enum MailTemplatesOpts {
    AccountConfirmation = 'AccountConfirmation',
}
export interface IMailTemplate {
    subject: string
    template?: {
        name: string
        engine: string
        context: {
            [key: string]: string
        }
    }
}
export type IMailTemplates = {
    [key in keyof typeof MailTemplatesOpts]: (...args: any) => IMailTemplate
}

const basePath = normalize(resolve(join(__dirname, 'Templates')))

export const emailTemplates: IMailTemplates = {
    AccountConfirmation: (args: any) => ({
        subject: `Thank you for signing up ${upperCaseFirstLetter(
            args.userName
        )}!`,
        template: {
            name: `${basePath}/AccountConfirmation.hbs`,
            engine: 'handlebars',
            context: { ...args, userName: upperCaseFirstLetter(args.userName) },
        },
    }),
}
