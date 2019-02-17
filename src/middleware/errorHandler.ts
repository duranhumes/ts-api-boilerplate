import { Response } from 'express'

import logging from '../utils/logging'
import * as httpMessages from '../utils/httpMessages'

export const errorHandler = (err: any, _: any, res: Response, __: any) => {
    if (err) {
        logging.error(err)

        return res.status(500).json(httpMessages.code500())
    }

    return res.status(404).json(httpMessages.code404())
}
