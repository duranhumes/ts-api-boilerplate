import 'reflect-metadata'
import 'dotenv-safe/config'

import config from './config'
import bootstrap from './bootstrap'

bootstrap(config[String(process.env.APP_ENV)])
