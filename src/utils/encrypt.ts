import * as crypto from 'crypto'

const algo = 'aes-256-cbc'
const iv = String(process.env.ENCRYPTION_KEY).slice(0, 16)
const key = String(process.env.ENCRYPTION_KEY)

export const encrypt = (value: string) => {
    const cipher = crypto.createCipheriv(algo, key, iv)

    return String(
        cipher.update(String(value), 'utf8', 'hex') + cipher.final('hex')
    )
}

export const decrypt = (value: string) => {
    const decipher = crypto.createDecipheriv(algo, key, iv)

    return String(
        decipher.update(String(value), 'hex', 'utf8') + decipher.final('utf8')
    )
}
