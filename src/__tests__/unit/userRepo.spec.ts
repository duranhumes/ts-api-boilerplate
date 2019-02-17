import 'reflect-metadata'
import 'dotenv-safe/config'

import {
    openDatabaseConnection,
    closeDatabaseConnection,
    clearDatabaseTables,
} from '../../database'
import config from '../../config'
import { promiseWrapper } from '../../utils'
import { UserRepository } from '../../repositories'
import { decrypt, encrypt } from '../../utils/encrypt'

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

describe('User Repository', () => {
    const user = {
        userName: 'Duran',
        email: 'Duranhumes@gmail.com',
        password: 'dsaDS#@89sda',
    }
    const encryptedEmail = encrypt(String(user.email.toLowerCase()))

    test('t', async () => {
        const func = () => new Promise(resolve => resolve('Butter'))
        await expect(func()).resolves.toBe('Butter')
    })
    describe('create user', () => {
        test('creates a user', async () => {
            const newUser = await userRepo.create(user)

            // Check email encryption
            expect(newUser!.email).not.toContain('@')
            const decryptedEmail = decrypt(String(newUser!.email))
            expect(decryptedEmail).toBe(user.email.toLowerCase())

            expect(newUser!.password).toContain('argon2')
        })
        test('handles duplicate users', async () => {
            await expect(userRepo.create(user)).rejects.toThrow(
                'Duplicate entry'
            )
        })
    })
    test('finds user', async () => {
        const foundUser = await userRepo.findOneQuery({ email: encryptedEmail })

        expect(foundUser.userName).toBe(user.userName.toLowerCase())
        expect(foundUser!.email).toContain('@')
    })
    test('updates user', async () => {
        const foundUser = await userRepo.findOneQuery({ email: encryptedEmail })

        const updatedUser = await userRepo.update(foundUser, {
            isConfirmed: 1,
        })

        expect(updatedUser!.isConfirmed).toBeTruthy()
    })
    test('deletes user', async () => {
        const foundUser = await userRepo.findOneQuery({ email: encryptedEmail })

        const deletedUser = await userRepo.remove(String(foundUser!.id))

        expect(deletedUser).toBeTruthy()
        const [, err] = await promiseWrapper(
            userRepo.findOneQuery({ email: encryptedEmail })
        )
        expect(err.code).toBe(404)
    })
    test('finds all users', async () => {
        await userRepo.create({
            userName: 'user1',
            email: 'email1@email.com',
            password: 'DSn#232$dsbus2',
        })
        await userRepo.create({
            userName: 'user2',
            email: 'email2@email.com',
            password: 'DSn#232$dsbus2',
        })

        const foundUsers = await userRepo.findQuery()

        expect(foundUsers.length).toBe(2)
        expect(foundUsers[1].email).toContain('@')
    })
})
