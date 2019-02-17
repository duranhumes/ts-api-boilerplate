import { sign } from '../utils/jwt'
import { UserEntity } from '../entities'
import { encrypt } from '../utils/encrypt'
import { MailService, MailTemplatesOpts } from './MailService'

export class UserService {
    mailService: MailService

    constructor(mailService: MailService) {
        this.mailService = mailService
    }

    sendAccountConfirmationEmail = async (user: UserEntity, appUrl: string) => {
        const { id, email, userName } = user

        const encryptedUserId = encrypt(id!)
        const jwtUserId = sign({ id: encryptedUserId })

        const confirmLink = `${appUrl}/verify?token=${jwtUserId}`

        const template = MailTemplatesOpts.AccountConfirmation

        return this.mailService.sendTemplateMail(
            { params: { userName, confirmLink }, to: String(email) },
            template
        )
    }
}
