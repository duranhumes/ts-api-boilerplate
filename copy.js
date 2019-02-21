/**
 * TSC doesn't seem to handle copying other file types
 * just building ts files, so we'll copy the email templates.
 */

const { cp } = require('shelljs')
const { normalize } = require('path')

const basePath = normalize(__dirname)

const tsSrc = `${basePath}/src/services/MailService/Templates`
const buildSrc = `${basePath}/build/services/MailService`

cp('-r', tsSrc, buildSrc)
