import { Response, NextFunction } from 'express'

import * as httpMessages from '../utils/httpMessages'
import { ExtendedRequest } from '../interfaces/ExtendedRequest'

export const requireLogin = (
    req: ExtendedRequest,
    res: Response,
    next: NextFunction
) => {
    if (req.isAuthenticated()) {
        return next()
    }

    return res.status(401).json(httpMessages.code401())
}
