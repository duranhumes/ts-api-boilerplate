import * as hpp from 'hpp'
import * as cors from 'cors'
import * as helmet from 'helmet'
import * as morgan from 'morgan'
import * as express from 'express'
import * as passport from 'passport'
import * as compression from 'compression'

import {
    noRoute,
    gateway,
    errorHandler,
    contentType,
    rateLimit,
    redisSession,
    passportConfig,
} from './middleware'
import controllers from './controllers'

morgan.token('id', req => req.ip)
const loggerFormat = ':id [:date[web]] ":method :url" :status :response-time'

/**
 * App instance
 */
const app = express()

/**
 * Middlewares
 */
app.use(gateway)
app.use(contentType)

if (process.env.NODE_ENV === 'production') {
    app.enable('trust proxy')
}
app.disable('x-powered-by')
app.use(helmet())
app.use(
    cors({
        credentials: true,
        origin: 'http://localhost:3000',
    })
)
app.use(rateLimit)
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(express.json({ limit: '10mb' }))
app.use(compression())
app.use(hpp())
app.use(
    morgan(loggerFormat, {
        stream: process.stderr,
    })
)
passportConfig()
app.use(redisSession())
app.use(passport.initialize())
app.use(passport.session())

/**
 * Routes
 */
const router = express.Router()

const appVersion = process.env.APP_VERSION
app.use(`/${appVersion}`, router)

router.use(gateway)
router.use(contentType)

router.get('/_healthz', (_, res) => res.sendStatus(200))
router.use('/users', controllers.UserController)
router.use('/login', controllers.LoginController)
router.use('/logout', controllers.LogoutController)
router.use('/verify', controllers.AccountVerifyController)

const noContentUrls = ['/favicon.ico', '/robots.txt']
noContentUrls.forEach(url => {
    app.all(url, (_, res) => res.sendStatus(204))
})

app.use(errorHandler)

router.all('*', noRoute)

export default app
