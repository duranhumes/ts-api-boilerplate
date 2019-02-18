import { Router, Response, Request } from 'express'

import { verify } from '../../utils/jwt'
import { promiseWrapper, escapeString } from '../../utils'
import { decrypt } from '../../utils/encrypt'
import { UserRepository } from '../../repositories'
import * as httpMessages from '../../utils/httpMessages'
import { validationRules, validationFunc } from './validation'

class Controller {
    router: Router
    userRepo: UserRepository

    constructor() {
        this.router = Router()
        this.routes()

        this.userRepo = new UserRepository()
    }

    routes() {
        this.router.get(
            '/',
            [...validationRules.verify],
            validationFunc,
            this.verify
        )
    }

    verify = async (req: Request, res: Response) => {
        // @ts-ignore
        const { id } = verify(escapeString(req.query.token)).sub
        const decryptedId = decrypt(id)

        const [user, userErr] = await promiseWrapper(
            this.userRepo.findOneQuery({ id: decryptedId })
        )
        if (userErr) {
            return res.status(404).json(httpMessages.code404())
        }

        if (user.isConfirmed) {
            res.set('Content-Type', 'text/html')
            return res.send(
                new Buffer(
                    '<p>Your account has already been verified, you can now close this window.</p>'
                )
            )
        }

        const [, err] = await promiseWrapper(
            this.userRepo.update(user, { isConfirmed: 1 })
        )
        if (err) {
            return res.status(404).json(httpMessages.code404())
        }

        res.set('Content-Type', 'text/html')
        return res.send(
            new Buffer(
                '<p>Your account has been confirmed, you can now close this window.</p>'
            )
        )
    }
}

export const AccountVerifyController = new Controller().router
