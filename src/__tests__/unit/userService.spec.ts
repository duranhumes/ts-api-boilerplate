import { stubTransport } from 'nodemailer-stub'

import {
    openDatabaseConnection,
    closeDatabaseConnection,
    clearDatabaseTables,
} from '../../database'
import config from '../../config'
import { UserRepository } from '../../repositories'
import { UserService, MailService, MailTemplatesOpts } from '../../services'

const stubMailer = new MailService(stubTransport)
const userService = new UserService(stubMailer)
const user = {
    userName: 'Duran',
    email: 'Duranhumes@gmail.com',
    password: 'dsaDS#@89sda',
}

let userRepo: UserRepository
beforeAll(async () => {
    await openDatabaseConnection(config.testing.db)
    await clearDatabaseTables()

    userRepo = new UserRepository()
})

afterAll(async () => {
    await clearDatabaseTables()
    await closeDatabaseConnection()
})

describe('User Service', () => {
    test('sends account confirmation email', async () => {
        const template = MailTemplatesOpts.AccountConfirmation
        const cUser = await userRepo.create(user)
        const confirmation = await userService.sendAccountConfirmationEmail(
            cUser!,
            'http://google.com'
        )

        expect(confirmation).toHaveProperty('template')
        expect(confirmation.template!.name).toContain(template)
        expect(confirmation.subject).toContain(user.userName)
    })
})
