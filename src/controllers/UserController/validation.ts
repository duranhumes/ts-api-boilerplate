import { Request, Response, NextFunction } from 'express'
import { validationResult, body, param } from 'express-validator/check'

import {
    userIdRegex,
    passwordRegex,
    passwordValidationMessage,
} from '../../entities'
import UserSchema from '../../schemas/UserSchema'
import { code422 } from '../../utils/httpMessages'
import { formatValidationError } from '../helpers'

export const validationRules = {
    createUser: [
        ...UserSchema.map((field: string) =>
            body(field)
                .escape()
                .trim()
        ),
        body('userName')
            .not()
            .isEmpty()
            .withMessage('is required')
            .trim()
            .escape(),
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
            .escape()
            .matches(passwordRegex)
            .withMessage(passwordValidationMessage),
    ],
    getUser: [
        param('id')
            .not()
            .isEmpty()
            .withMessage('is required for this endpoint')
            .trim()
            .escape()
            .matches(userIdRegex)
            .isLength({ min: 32, max: 32 })
            .withMessage('is not a valid id'),
    ],
    updateUser: [
        ...UserSchema.map((field: string) =>
            body(field)
                .escape()
                .trim()
        ),
        param('id')
            .not()
            .isEmpty()
            .withMessage('is required for this endpoint')
            .trim()
            .escape()
            .matches(userIdRegex)
            .isLength({ min: 32, max: 32 })
            .withMessage('is not a valid id'),
        body('email')
            .optional()
            .trim()
            .isEmail()
            .withMessage('is not a valid email address')
            .escape()
            .normalizeEmail(),
        body('password')
            .optional()
            .trim()
            .escape()
            .matches(passwordRegex)
            .withMessage(passwordValidationMessage),
    ],
    deleteUser: [
        param('id')
            .not()
            .isEmpty()
            .withMessage('is required for this endpoint')
            .trim()
            .escape()
            .matches(userIdRegex)
            .isLength({ min: 32, max: 32 })
            .withMessage('is not a valid id'),
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
