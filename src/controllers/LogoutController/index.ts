import { Router, Response, Request, NextFunction } from 'express'

import { requireLogin, logout } from '../../middleware'

class Controller {
    router: Router

    constructor() {
        this.router = Router()
        this.routes()
    }

    routes() {
        this.router.post('/', requireLogin, this.logout, logout)
    }

    logout = async (_: Request, __: Response, next: NextFunction) => {
        return next()
    }
}

export const LogoutController = new Controller().router
