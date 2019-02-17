import { Request, Response, NextFunction } from 'express'
import { validationResult, body } from 'express-validator/check'

import { code422 } from '../../utils/httpMessages'
import { formatValidationError } from '../helpers'

export const validationRules = {
    login: [
        body('email')
            .not()
            .isEmpty()
            .withMessage('is required')
            .trim()
            .isEmail()
            .withMessage('is not a valid email address')
            .escape()
            .normalizeEmail(),
        body('password')
            .not()
            .isEmpty()
            .withMessage('is required')
            .trim()
            .escape(),
    ],
}

export function validationFunc(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const { errString, fields } = formatValidationError(errors.array())

        return res.status(422).json(code422(undefined, errString, fields))
    }

    return next()
}
