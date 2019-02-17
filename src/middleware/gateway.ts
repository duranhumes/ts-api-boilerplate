import { Request, Response, NextFunction } from 'express'

import logging from '../utils/logging'
import * as httpMessages from '../utils/httpMessages'

export const gateway = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err) {
        logging.error(err)

        return res.status(500).json(httpMessages.code500())
    }
    console.log(req.query.key)

    if (!req.query.key || req.query.key !== process.env.APP_API_KEY) {
        return res.status(403).json(httpMessages.code403('Invalid API Key'))
    }

    return next()
}
