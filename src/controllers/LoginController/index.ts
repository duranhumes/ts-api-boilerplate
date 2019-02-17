import { Router, Response, Request } from 'express'

import { encrypt } from '../../utils/encrypt'
import { UserRepository } from '../../repositories'
import { verifyPassword } from '../../utils/password'
import * as httpMessages from '../../utils/httpMessages'
import { validationRules, validationFunc } from './validation'
import { pick, promiseWrapper, escapeString } from '../../utils'

class Controller {
    router: Router
    userRepo: UserRepository

    constructor() {
        this.router = Router()
        this.routes()

        this.userRepo = new UserRepository()
    }

    routes() {
        this.router.post(
            '/',
            [...validationRules.login],
            validationFunc,
            this.login
        )
    }

    login = async (req: Request, res: Response) => {
        const credentials = pick(req.body, ['email', 'password'])
        const email = encrypt(escapeString(credentials.email.toLowerCase()))
        const password = escapeString(credentials.password)

        const [requestedUser, requestedUserErr] = await promiseWrapper(
            this.userRepo.findOneQuery({ email })
        )
        if (requestedUserErr) {
            if (Number(requestedUserErr.code) === 404) {
                return res.status(404).json(httpMessages.code404())
            }

            return res.status(500).json(httpMessages.code500())
        }

        if (!requestedUser.isConfirmed) {
            return res
                .status(403)
                .json(
                    httpMessages.code403(
                        'Unverified Account',
                        'Please check your email to verify your account.'
                    )
                )
        }

        const [valid] = await promiseWrapper(
            verifyPassword(requestedUser.password, password)
        )
        if (!valid) {
            return res.status(401).json(httpMessages.code401())
        }

        return req.login(requestedUser.id, (err: any) => {
            if (err) {
                return res.status(500).json(httpMessages.code500())
            }

            req.session!.user = requestedUser.id
            delete requestedUser.password

            return res.status(200).json(httpMessages.code200(requestedUser))
        })
    }
}

export const LoginController = new Controller().router
