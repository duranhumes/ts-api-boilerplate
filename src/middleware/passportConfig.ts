import * as passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'

import logging from '../utils/logging'
import { encrypt } from '../utils/encrypt'
import { UserRepository } from '../repositories'
import { promiseWrapper, isEmpty } from '../utils'

const userRepo = new UserRepository()

const localLogin = new LocalStrategy(
    { usernameField: 'email' },
    async (email: string, _: any, done: any) => {
        const encryptedEmail = encrypt(email)
        const [user, userErr] = await promiseWrapper(
            userRepo.findOneQuery({ email: encryptedEmail })
        )
        if (userErr) {
            logging.error(userErr)

            return done(null, false)
        }

        if (!user || isEmpty(user)) {
            return done(null, false)
        }

        return done(null, user)
    }
)

export const passportConfig = () => {
    passport.use(localLogin)

    passport.serializeUser((user, done) => {
        return done(null, user)
    })

    passport.deserializeUser(async (id, done) => {
        const [user, userErr] = await promiseWrapper(
            userRepo.findOneQuery({ id })
        )

        if (userErr) {
            logging.error(userErr)

            return done(null, false)
        }

        if (!user || isEmpty(user)) {
            return done(null, false)
        }

        return done(null, user)
    })
}
