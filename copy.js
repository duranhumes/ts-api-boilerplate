/**
 * TSC doesn't seem to handle copying other file types
 * just building ts files, so we'll copy the email templates.
 */

const shell = require('shelljs')
const { normalize, resolve } = require('path')

const basePath = normalize(resolve(__dirname))

const tsSrc = `${basePath}/src/services/MailService/Templates`
const buildSrc = `${basePath}/build/services/MailService`

shell.cp('-r', tsSrc, buildSrc)
