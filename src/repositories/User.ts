import { getManager, EntityManager } from 'typeorm'

import logging from '../utils/logging'
import { UserEntity } from '../entities'
import { IRepository } from './IRepository'
import { promiseWrapper, isEmpty } from '../utils'

export class UserRepository implements IRepository<UserEntity> {
    manager: EntityManager

    constructor() {
        this.manager = getManager()
    }

    findQuery = (query: object = {}) => {
        return new Promise<UserEntity[] | []>(async (resolve, reject) => {
            const [user, userErr] = await promiseWrapper(
                this.manager.find(UserEntity, query)
            )
            if (userErr) {
                logging.error(userErr)

                return reject(userErr)
            }

            if (!user || isEmpty(user)) {
                return resolve([])
            }

            return resolve(user)
        })
    }

    findOneQuery = (query: object = {}) => {
        return new Promise<UserEntity>(async (resolve, reject) => {
            const [user, userErr] = await promiseWrapper(
                this.manager.findOne(UserEntity, query)
            )
            if (userErr) {
                logging.error(userErr)

                return reject(userErr)
            }

            if (!user || isEmpty(user)) {
                return reject({ code: 404, message: 'User not found' })
            }

            return resolve(user)
        })
    }

    countQuery = (query: object = {}) => {
        return new Promise<number>(async (resolve, reject) => {
            const [count, countErr] = await promiseWrapper(
                this.manager.count(UserEntity, query)
            )
            if (countErr) {
                logging.error(countErr)

                return reject(countErr)
            }

            return resolve(count)
        })
    }

    create = (obj: Partial<UserEntity>) => {
        return new Promise<UserEntity | null>(async (resolve, reject) => {
            const user = new UserEntity()
            Object.assign(user, obj)

            const [newUser, newUserErr] = await promiseWrapper(
                this.manager.save(user)
            )
            if (newUserErr) {
                logging.error(newUserErr)

                return reject(newUserErr)
            }

            if (!newUser || isEmpty(newUser)) {
                return resolve(null)
            }

            return resolve(newUser)
        })
    }

    update = (
        originalObj: UserEntity,
        updatedObj: Partial<UserEntity> = {}
    ) => {
        return new Promise<UserEntity | null>(async (resolve, reject) => {
            Object.assign(originalObj, updatedObj)
            const [updatedUser, updatedUserErr] = await promiseWrapper(
                this.manager.save(originalObj)
            )
            if (updatedUserErr) {
                logging.error(updatedUserErr)

                return reject(updatedUserErr)
            }

            if (!updatedUser || isEmpty(updatedUser)) {
                return resolve(null)
            }

            return resolve(updatedUser)
        })
    }

    remove = (id: string) => {
        return new Promise<boolean>(async (resolve, reject) => {
            const [, deletedErr] = await promiseWrapper(
                this.manager.delete(UserEntity, id)
            )
            if (deletedErr) {
                logging.error(deletedErr)

                return reject(deletedErr)
            }

            return resolve(true)
        })
    }
}
