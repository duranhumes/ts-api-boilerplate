import { validateData } from '../helpers'
import { promiseWrapper } from '../../utils'
import { encrypt } from '../../utils/encrypt'
import { hashPassword } from '../../utils/password'
import { UserEntity, passwordRegex, passwordValidationMessage } from '.'

export async function validateUserBeforeInsert(user: Partial<UserEntity>) {
    if (user.userName) {
        user.userName = formatUserName(user.userName)
    }
    if (user.email) {
        user.email = encrypt(formatEmail(user.email))
    }
    if (user.password) {
        if (validatePassword(user.password)) {
            const [hashedPassword, hashedPasswordErr] = await promiseWrapper(
                hashPassword(user.password)
            )
            if (hashedPasswordErr) {
                throw new Error('In password hash.')
            }

            user.password = hashedPassword

            await validateData<UserEntity>(user)

            return user
        } else {
            throw new TypeError(passwordValidationMessage)
        }
    }

    user.isConfirmed = Boolean(user.isConfirmed)

    await validateData<UserEntity>(user)

    return user
}

export async function validateUserBeforeUpdate(user: Partial<UserEntity>) {
    if (user.userName) {
        user.userName = formatUserName(user.userName)
    }
    if (user.email) {
        user.email = encrypt(formatEmail(user.email))
    }
    if (user.password) {
        // Skip password hashing as its most likely already hashed
        if (user.password.startsWith('$argon2id')) {
            const currentData: Partial<UserEntity> = {}
            Object.assign(currentData, user)
            delete currentData.password
            await validateData<UserEntity>(currentData)

            return currentData
        }

        if (validatePassword(user.password)) {
            const [hashedPassword, hashedPasswordErr] = await promiseWrapper(
                hashPassword(user.password)
            )
            if (hashedPasswordErr) {
                throw new Error('In password hash.')
            }

            user.password = hashedPassword

            await validateData<UserEntity>(user)

            return user
        } else {
            throw new TypeError(passwordValidationMessage)
        }
    }

    user.isConfirmed = Boolean(user.isConfirmed)

    await validateData<UserEntity>(user)

    return user
}

const formatUserName = (userName: string) =>
    userName.replace(/\s+/g, '-').toLowerCase()
const formatEmail = (email: string) => email.toLowerCase()
const validatePassword = (password: string) => passwordRegex.test(password)
