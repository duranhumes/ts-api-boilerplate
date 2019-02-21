import 'reflect-metadata'
import 'dotenv-safe/config'

import {
    clearDatabaseTables,
    openDatabaseConnection,
    closeDatabaseConnection,
} from '../../database'
import { deleteSession } from '../utils'
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

describe('Login Integration', () => {
    test('rejects unconfirmed users', async () => {
        const userObj = {
            userName: 'user231',
            email: 'vona231@netmail-pro.com',
            password: 'DSn#232$dsbus2',
        }
        // @ts-ignore
        const { id, email } = await userRepo.create(userObj)

        const response = await r
            .post('/login')
            .set('Content-Type', 'application/json')
            .send(userObj)

        expect(response.status).toBe(403)
    })
    test('logs in a user', async () => {
        const userObj = {
            userName: 'user12345',
            email: 'vona1235@netmail-pro.com',
            password: 'DSn#232$dsbus2',
            isConfirmed: 1,
        }
        // @ts-ignore
        const { id, email } = await userRepo.create(userObj)

        const response = await r
            .post('/login')
            .set('Content-Type', 'application/json')
            .send(userObj)

        await deleteSession(r, response.header['set-cookie'][0])

        expect(response.status).toBe(200)
        expect(response.header['set-cookie']).toHaveLength(1)
        expect(response.body.data.email).toBe(userObj.email)
    })
})
