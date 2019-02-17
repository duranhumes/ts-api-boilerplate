import * as connectRedis from 'connect-redis'
import * as expressSession from 'express-session'

import { redisClient } from '../redis'
import { formattedUUID } from '../utils'
import { encrypt } from '../utils/encrypt'

const RedisStore = connectRedis(expressSession)
const isProduction = process.env.NODE_ENV === 'production'

export const redisSession = () =>
    expressSession({
        genid: () => encrypt(formattedUUID()),
        name: String(process.env.REDIS_SESSION_NAME),
        secret: String(process.env.REDIS_SESSION_SECRET),
        saveUninitialized: false,
        resave: false,
        store: new RedisStore({
            client: redisClient,
            logErrors: !isProduction,
            host: String(process.env.REDIS_HOST),
            port: Number(process.env.REDIS_PORT),
            prefix: String(process.env.REDIS_SESSION_NAME),
        }),
        cookie: {
            path: '/',
            httpOnly: false,
            secure: isProduction,
            expires: new Date(
                Date.now() + Number(process.env.REDIS_SESSION_EXPIRE)
            ),
            maxAge: Number(process.env.REDIS_SESSION_EXPIRE),
            // domain: 'http://localhost:3000',
            sameSite: true,
        },
        unset: 'destroy',
    })
