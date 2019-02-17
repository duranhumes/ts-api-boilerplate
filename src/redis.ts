import { createClient } from 'redis'

import config from './config'
import logging from './utils/logging'
import { cleanUp } from './bootstrap'

export const redisClient = createClient(config.redis)

redisClient.on('error', error => {
    logging.error(error)

    redisClient.quit()

    cleanUp()
})
