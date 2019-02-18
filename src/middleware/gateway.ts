import { Request, Response, NextFunction } from 'express'

import logging from '../utils/logging'
import * as httpMessages from '../utils/httpMessages'

export const gateway = (
    err: any,
    _: Request,
    res: Response,
    next: NextFunction
) => {
    if (err) {
        logging.error(err)

        return res.status(500).json(httpMessages.code500())
    }

    return next()
}
