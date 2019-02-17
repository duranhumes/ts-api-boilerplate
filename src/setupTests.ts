import 'reflect-metadata'
import 'dotenv-safe/config'
import * as request from 'supertest'

jest.spyOn(process, 'exit').mockImplementation()
jest.setTimeout(30000)

const appPort = process.env.APP_PORT
const appVersion = process.env.APP_VERSION
export const r = request(`http://localhost:${appPort}/${appVersion}`)
