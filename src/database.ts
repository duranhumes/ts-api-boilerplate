import {
    createConnection,
    ConnectionOptions,
    Connection,
    getManager,
} from 'typeorm'
import { writeFileSync } from 'fs'
import { normalize, resolve, join } from 'path'

import { upperCaseFirstLetter } from './utils'
import logging, { consoleLog } from './utils/logging'

const basePath = normalize(resolve(__dirname, '..'))

let connection: Connection

export async function openDatabaseConnection(
    connectionOpts: ConnectionOptions
) {
    if (!isConnected()) {
        try {
            connection = await createConnection(connectionOpts)

            consoleLog('DB successfully connected')
        } catch (err) {
            logging.error(err)
            consoleLog('Error in db connection %s', err.toString())

            process.exit(1)
        }
    }
}

export async function closeDatabaseConnection() {
    if (isConnected()) {
        try {
            await connection.close()

            consoleLog('DB successfully closed')
        } catch (err) {
            logging.error(err)
            consoleLog('Error in db connection close %s', err.toString())

            process.exit(1)
        }
    }
}

export async function genModelSchemas() {
    const schemasDir = normalize(join(resolve(basePath), 'src/schemas'))
    try {
        // Gen new files
        const entities = connection.entityMetadatas
        for (const entity of entities) {
            const modelSchema = connection.getMetadata(entity.name)
                .propertiesMap

            const keysToExclude = ['id', 'createdAt', 'updatedAt']
            const objKeys = Object.keys(modelSchema).filter(
                (k: string) => !keysToExclude.includes(k)
            )

            const keys = objKeys.map((k: string) => `\n    '${k}'`)
            const template = !objKeys
                ? 'export default []\n'
                : `export default [${keys},\n]\n`

            const fileName = upperCaseFirstLetter(entity.name).replace(
                'Entity',
                'Schema'
            )
            const schemaFile = `${schemasDir}/${fileName}.ts`

            writeFileSync(schemaFile, template)
        }

        consoleLog('Entity schemas created!')
    } catch (err) {
        consoleLog('%s', err.toString())

        process.exit(0)
    }
}

export async function clearDatabaseTables() {
    if (isConnected()) {
        const entities = connection.entityMetadatas
        const manager = getManager()

        await manager.query('SET FOREIGN_KEY_CHECKS = 0;')

        for (const entity of entities) {
            const repository = await connection.getRepository(entity.name)
            const query = `TRUNCATE TABLE \`${entity.tableName}\`;`
            try {
                await repository.query(query)
            } catch (err) {
                //
            }
        }

        await manager.query('SET FOREIGN_KEY_CHECKS = 1;')
    }
}

export function isConnected() {
    return connection ? connection.isConnected : false
}
