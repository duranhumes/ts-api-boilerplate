import { normalize, resolve, join } from 'path'
import { readdirSync, unlinkSync, writeFileSync } from 'fs'
import {
    createConnection,
    ConnectionOptions,
    Connection,
    getManager,
} from 'typeorm'

import logging, { consoleLog } from './utils/logging'
import { isEmpty } from './utils'

const projectDirBasePath = normalize(resolve(__dirname, '..'))

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
    const schemasDir = normalize(
        join(resolve(projectDirBasePath), 'src/schemas')
    )
    try {
        // Clear schema dir of old files
        const files = readdirSync(schemasDir)
        for (const file of files) {
            const filePath = normalize(join(schemasDir, file))
            unlinkSync(filePath)
        }

        // Gen new files
        const entities = connection.entityMetadatas
        for (const entity of entities) {
            const modelSchema = connection.getMetadata(entity.name)
                .propertiesMap

            const keysToExclude = ['id', 'createdAt', 'updatedAt']
            const objKeys = Object.keys(modelSchema).filter(
                (k: string) => !keysToExclude.includes(k)
            )

            if (!objKeys || isEmpty(objKeys)) return

            const keys = objKeys.map((k: string) => `\n    '${k}'`)
            const template = `export default [${keys},\n]\n`

            const fileName =
                entity.name.charAt(0).toUpperCase() +
                entity.name.slice(1).replace('Entity', 'Schema')
            const schemaFile = `${schemasDir}/${fileName}.ts`
            try {
                writeFileSync(schemaFile, template)
            } catch (err) {
                consoleLog('%s', err.toString())

                process.exit(0)
            }
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
                // console.log(err)
            }
        }

        await manager.query('SET FOREIGN_KEY_CHECKS = 1;')
    }
}

export function isConnected() {
    return connection ? connection.isConnected : false
}
