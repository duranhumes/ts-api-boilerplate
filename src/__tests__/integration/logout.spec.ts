import 'reflect-metadata'
import 'dotenv-safe/config'

import {
    clearDatabaseTables,
    openDatabaseConnection,
    closeDatabaseConnection,
} from '../../database'
import { createSession } from '../utils'
import { r, testConfig } from '../../setupTests'
import { UserRepository } from '../../repositories'
import bootstrap, { closeServer } from '../../bootstrap'

let userRepo: UserRepository
beforeAll(async () => {
    await bootstrap(testConfig)
    await openDatabaseConnection(testConfig.db)
    await clearDatabaseTables()

    userRepo = new UserRepository()
})

afterAll(async () => {
    await clearDatabaseTables()
    await closeDatabaseConnection()
    closeServer()
})

describe('Logout Integration', () => {
    test('logs out a user', async () => {
        const userObj = {
            userName: 'user135',
            email: 'vona123@netmail-pro.com',
            password: 'DSn#232$dsbus2',
            isConfirmed: 1,
        }

        // @ts-ignore
        const { id, email } = await userRepo.create(userObj)

        const cookie = await createSession(r, {
            email: userObj.email,
            password: userObj.password,
        })

        const response = await r
            .post('/logout')
            .set('Content-Type', 'application/json')
            .set('cookie', cookie)
        expect(response.status).toBe(204)

        const response2 = await r
            .post('/logout')
            .set('Content-Type', 'application/json')
            .set('cookie', cookie)
        expect(response2.status).toBe(401)
    })
})
