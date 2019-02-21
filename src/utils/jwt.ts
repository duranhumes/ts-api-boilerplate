import { readFileSync } from 'fs'
import * as jsonwebtoken from 'jsonwebtoken'
import { normalize, resolve, join } from 'path'

const basePath = normalize(resolve(__dirname, join('..', '..', 'keys')))
const privateKey = readFileSync(`${basePath}/private.pem`, 'utf8')
const publicKey = readFileSync(`${basePath}/public.pem`, 'utf8')

const options = {
    expiresIn: process.env.JWT_EXP,
    issuer: process.env.JWT_ISSUER,
    audience: process.env.JWT_AUDIENCE,
    algorithm: 'RS256',
}

export function sign(value: string | {}) {
    const timestamp = new Date().getTime()
    const payload = {
        sub: value,
        iat: timestamp,
    }

    return jsonwebtoken.sign(payload, privateKey, options)
}

export function verify(token: string) {
    return jsonwebtoken.verify(token, publicKey, {
        ...options,
        algorithms: [options.algorithm],
        maxAge: options.expiresIn,
    })
}
