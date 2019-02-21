import { createServer } from 'http'
import { normalize, join, resolve } from 'path'

import {
    openDatabaseConnection,
    closeDatabaseConnection,
    genModelSchemas,
} from './database'
import { redisClient } from './redis'
import { createDirIfNotExists } from './utils'
import logging, { consoleLog } from './utils/logging'

const appName = process.env.APP_NAME
const port = Number(process.env.APP_PORT)

consoleLog('Booting %s', appName)

let httpServer = createServer()
async function main(config: any) {
    const logsDir = normalize(join(resolve(__dirname, '..'), 'logs'))
    createDirIfNotExists(logsDir)

    await openDatabaseConnection(config.db)
    await genModelSchemas()

    setImmediate(() => {
        const app = require('./server').default
        app.set('port', port)
        httpServer = createServer(app)
        httpServer.listen(port)
        httpServer.on('error', onError)
        consoleLog('%s is ready for use on port %s', appName, port)
    })
}

function onError(error: NodeJS.ErrnoException): void {
    if (error.syscall !== 'listen') throw error

    const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`
    switch (error.code) {
        case 'EACCES':
            consoleLog('%s requires elevated privileges', bind)
            cleanUp()
            break
        case 'EADDRINUSE':
            consoleLog('%s is already in use', bind)
            cleanUp()
            break
        default:
            cleanUp()
            throw error
    }
}

process.on(
    'uncaughtException',
    (exception: NodeJS.ErrnoException): void => {
        logging.error(exception)
        consoleLog('uncaughtException %s', exception.toString())

        cleanUp()
    }
)

process.on(
    'unhandledRejection',
    (reason: any, promise: any): void => {
        logging.error({ promise, reason })
        consoleLog(
            'unhandledRejection %s, %s',
            promise.toString(),
            reason.toString()
        )

        cleanUp()
    }
)

// Clean up on nodemon restarts
process.once('SIGUSR2', () => {
    closeDatabaseConnection()
    process.kill(process.pid, 'SIGUSR2')
})

process.on('SIGINT', () => {
    cleanUp()
})

process.on('SIGTERM', () => {
    cleanUp()
})

process.on('exit', () => {
    closeServer()
    consoleLog('Api shutdown')
})

export function closeServer() {
    consoleLog('Server successfully closed')
    httpServer.close()
}

export function cleanUp() {
    redisClient.quit()
    closeDatabaseConnection().then(() => process.exit(0))
}

export default main
