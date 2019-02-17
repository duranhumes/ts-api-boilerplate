import 'reflect-metadata'
import 'dotenv-safe/config'

import {
    clearDatabaseTables,
    openDatabaseConnection,
    closeDatabaseConnection,
} from '../../database'
import config from '../../config'
import { r } from '../../setupTests'
import { promiseWrapper } from '../../utils'
import { decrypt } from '../../utils/encrypt'
import { UserRepository } from '../../repositories'
import bootstrap, { closeServer } from '../../bootstrap'
import { createSession, deleteSession } from '../utils'

let userRepo: UserRepository
beforeAll(async () => {
    await bootstrap(config.testing)
    await openDatabaseConnection(config.testing.db)
    await clearDatabaseTables()

    userRepo = new UserRepository()
})

afterAll(async () => {
    await clearDatabaseTables()
    await closeDatabaseConnection()
    closeServer()
})

describe('User Integration', () => {
    test('creates a user', async () => {
        const user = {
            userName: 'user2',
            email: 'vona@netmail-pro.com',
            password: 'DSn#232$dsbus2',
        }

        const response = await r
            .post('/users')
            .set('Content-Type', 'application/json')
            .send(user)

        expect(response.status).toBe(201)

        const { data } = response.body
        expect(data.email).toBe(user.email)
        expect(data.password).toBeFalsy()
    })
    test('finds user', async () => {
        // @ts-ignore
        const { id, email } = await userRepo.create({
            userName: 'user1',
            email: 'vona1@netmail-pro.com',
            password: 'DSn#232$dsbus2',
        })

        const response = await r
            .get(`/users/${id}?fields=email,password`)
            .set('Content-Type', 'application/json')

        expect(response.status).toBe(200)

        const { data } = response.body
        expect(data.email).toBe(decrypt(email))
        expect(data.password).toBeFalsy()
    })
    describe('updates user', () => {
        test('rejects un-authed users', async () => {
            // @ts-ignore
            const { id, email } = await userRepo.create({
                userName: 'user23',
                email: 'vona2@netmail-pro.com',
                password: 'DSn#232$dsbus2',
            })

            const response = await r
                .patch(`/users/${id}`)
                .set('Content-Type', 'application/json')
                .send({ userName: 'user32' })

            expect(response.status).toBe(401)
            expect(response.body.data).toBeFalsy()
        })
        test('updates a user', async () => {
            const userObj = {
                userName: 'user35',
                email: 'vona12@netmail-pro.com',
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
                .patch(`/users/${id}`)
                .set('Content-Type', 'application/json')
                .set('cookie', cookie)
                .send({ userName: 'user32' })

            await deleteSession(r, cookie)

            expect(response.status).toBe(200)

            const { data } = response.body
            expect(data.userName).toBe('user32')
            expect(data.email).toContain('@')
        })
    })
    test('deletes user', async () => {
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
            .delete(`/users/${id}`)
            .set('Content-Type', 'application/json')
            .set('cookie', cookie)

        await deleteSession(r, cookie)

        expect(response.status).toBe(204)
        expect(response.body.data).toBeFalsy()

        const [, err] = await promiseWrapper(userRepo.findOneQuery({ id }))
        expect(err.code).toBe(404)
    })
})
