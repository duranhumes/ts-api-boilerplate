import 'reflect-metadata'
import 'dotenv-safe/config'
import { ConnectionOptions } from 'typeorm'

const getPassword = (password: string) =>
    password === 'null' || password === 'undefined' ? {} : { password }

const redisPassword = getPassword(String(process.env.REDIS_PASSWORD))
const mySQLPassword = getPassword(String(process.env.MYSQL_PASSWORD))

const defaultDBOpts: ConnectionOptions = {
    type: 'mysql',
    maxQueryExecutionTime: 800,
    entities: [`${__dirname}/entities/*`],
    synchronize: true,
    ...mySQLPassword,
}

export default {
    redis: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        enable_offline_queue: false,
        ...redisPassword,
    },
    production: {
        db: {
            ...defaultDBOpts,
            logging: false,
            host: String(process.env.MYSQL_HOST),
            port: Number(process.env.MYSQL_PORT),
            username: String(process.env.MYSQL_USER),
            database: String(process.env.MYSQL_DATABASE),
        },
    },
    development: {
        db: {
            ...defaultDBOpts,
            logging: true,
            host: String(process.env.MYSQL_HOST),
            port: Number(process.env.MYSQL_PORT),
            username: String(process.env.MYSQL_USER),
            database: String(process.env.MYSQL_DATABASE),
        },
    },
    test: {
        db: {
            ...defaultDBOpts,
            logging: false,
            host: String(process.env.MYSQL_HOST),
            port: Number(process.env.MYSQL_PORT),
            username: String(process.env.MYSQL_USER),
            database: String(process.env.MYSQL_DATABASE_TEST),
        },
    },
}
