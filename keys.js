const { normalize } = require('path')
const { mkdir, rm, exec } = require('shelljs')

const basePath = normalize(__dirname)

const keysDir = `${basePath}/keys`
const genPrivKeyCmd = 'openssl genrsa -out keys/private.pem 2048'
const genPubKeyCmd =
    'openssl rsa -in keys/private.pem -outform PEM -pubout -out keys/public.pem'

mkdir(keysDir)
rm(`${keysDir}/*`)
exec(`${genPrivKeyCmd} && ${genPubKeyCmd}`)
