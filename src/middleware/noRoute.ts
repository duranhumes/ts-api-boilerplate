import { Response } from 'express'

import * as httpMessages from '../utils/httpMessages'

export const noRoute = (_: any, res: Response) => {
    return res.status(404).json(httpMessages.code404())
}
