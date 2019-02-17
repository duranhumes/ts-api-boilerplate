import { Response } from 'express'

import { consoleLog } from '../utils/logging'
import { ExtendedRequest } from '../interfaces/ExtendedRequest'

export const logout = (req: ExtendedRequest, res: Response) => {
    req.logout()
    if (req.session) {
        req.session.destroy(() => {
            consoleLog('Session Destroyed')
        })
    }

    return res.sendStatus(204)
}
