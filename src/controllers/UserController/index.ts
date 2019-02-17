import { Router, Response, Request, NextFunction } from 'express'

import {
    pick,
    formatURL,
    promiseWrapper,
    escapeString,
    filterEntity,
} from '../../utils'
import {
    UserService,
    MailService,
    mailCredentialsService,
} from '../../services'
import { UserEntity } from '../../entities'
import { decrypt } from '../../utils/encrypt'
import { requireLogin } from '../../middleware'
import { logout } from '../../middleware/logout'
import UserSchema from '../../schemas/UserSchema'
import { UserRepository } from '../../repositories'
import * as httpMessages from '../../utils/httpMessages'
import { validationRules, validationFunc } from './validation'

const mailCredentials = mailCredentialsService.mailGun()

class Controller {
    router: Router
    userRepo: UserRepository
    userService: UserService

    constructor() {
        this.router = Router()
        this.routes()
        this.userRepo = new UserRepository()
        this.userService = new UserService(new MailService(mailCredentials))
    }

    routes() {
        this.router.get(
            '/:id',
            [...validationRules.getUser],
            validationFunc,
            this.getUser
        )
        this.router.post(
            '/',
            [...validationRules.createUser],
            validationFunc,
            this.createUser
        )
        this.router.patch(
            '/:id',
            [...validationRules.updateUser],
            validationFunc,
            requireLogin,
            this.updateUser
        )
        this.router.delete(
            '/:id',
            [...validationRules.deleteUser],
            validationFunc,
            requireLogin,
            this.deleteUser,
            logout
        )
        this.router.get('/me', requireLogin, this.me)
    }

    me = (req: Request, res: Response) => {
        return res.status(200).json(httpMessages.code200(req.user))
    }

    createUser = async (req: Request, res: Response) => {
        const schema = UserSchema.filter(s => s !== 'isConfirmed')
        const filteredBody = pick(req.body, schema)
        const userData: Partial<UserEntity> = {}
        for (const key in filteredBody) {
            if (filteredBody.hasOwnProperty(key)) {
                userData[key] = escapeString(filteredBody[key])
            }
        }

        const [newUser, newUserErr] = await promiseWrapper(
            this.userRepo.create(userData)
        )
        if (newUserErr) {
            if (Number(newUserErr.code) === 409) {
                return res.status(409).json(httpMessages.code409())
            }

            return res.status(500).json(httpMessages.code500())
        }

        newUser.email = decrypt(newUser.email)

        const appVersion = process.env.APP_VERSION
        const baseAppUrl = `${
            formatURL(req).split(`/${appVersion}`)[0]
        }/${appVersion}`
        await promiseWrapper(
            this.userService.sendAccountConfirmationEmail(newUser, baseAppUrl)
        )

        delete newUser.password

        const successMessage =
            'Account successfully created! Please check your email to confirm your account'
        return res
            .status(201)
            .json(httpMessages.code201(newUser, successMessage))
    }

    getUser = async (req: Request, res: Response) => {
        const userId = escapeString(req.params.id)
        const [user, userErr] = await promiseWrapper(
            this.userRepo.findOneQuery({ id: userId })
        )
        if (userErr) {
            if (userErr.code === 404) {
                return res.status(404).json(httpMessages.code404())
            }

            return res.status(500).json(httpMessages.code500())
        }

        delete user.password

        /**
         * Accepts fields param i.e.
         * http://localhost:8080/v1/users/:id?fields=id,title
         * if fields param is present the data will be filtered to
         * return only those fields specified kinda similar to gql.
         */
        const params = req.query
        if (params.fields) {
            const fields = params.fields
                .split(',')
                .map((f: string) => escapeString(f))
            const response = filterEntity(user, fields)

            return res.status(200).json(httpMessages.code200(response))
        }

        return res.status(200).json(httpMessages.code200(user))
    }

    updateUser = async (req: Request, res: Response) => {
        const userId = escapeString(req.params.id)

        // Check if logged in user is the same as requested user
        if (!req.user || req.user.id !== userId) {
            return res.status(403).json(httpMessages.code403())
        }

        const [originalUser, originalUserErr] = await promiseWrapper(
            this.userRepo.findOneQuery({ id: userId })
        )
        if (originalUserErr) {
            if (originalUserErr.code === 404) {
                return res.status(404).json(httpMessages.code404())
            }

            return res.status(500).json(httpMessages.code500())
        }

        const filteredBody = pick(req.body, UserSchema)
        const userData: Partial<UserEntity> = {}
        for (const key in filteredBody) {
            if (filteredBody.hasOwnProperty(key)) {
                userData[key] = escapeString(filteredBody[key])
            }
        }

        const [updatedUser, updatedUserErr] = await promiseWrapper(
            this.userRepo.update(originalUser, userData)
        )
        if (!updatedUser || updatedUserErr) {
            return res.status(500).json(httpMessages.code500())
        }

        delete updatedUser.password

        return res
            .status(200)
            .json(
                httpMessages.code200(updatedUser, 'User successfully updated.')
            )
    }

    deleteUser = async (req: Request, res: Response, next: NextFunction) => {
        const userId = escapeString(req.params.id)

        // Check if logged in user is the same as requested user
        if (!req.user || req.user.id !== userId) {
            return res.status(403).json(httpMessages.code403())
        }

        const [, userErr] = await promiseWrapper(
            this.userRepo.findOneQuery({ id: userId })
        )
        if (userErr) {
            if (userErr.code === 404) {
                return res.status(404).json(httpMessages.code404())
            }

            return res.status(500).json(httpMessages.code500())
        }

        const [, deleteUserErr] = await promiseWrapper(
            this.userRepo.remove(userId)
        )
        if (deleteUserErr) {
            return res.status(500).json(httpMessages.code500())
        }

        return next()
    }
}

export const UserController = new Controller().router
