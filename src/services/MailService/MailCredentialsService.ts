import { google } from 'googleapis'
import * as mgTransport from 'nodemailer-mailgun-transport'

import { MailgunTransport } from '../../types/nodemailer-mailgun-transport'
import { TransportOptions } from 'nodemailer'

export interface IOAuth2MailCredentials extends TransportOptions {
    service: string
    auth: {
        type: string
        user: string
        clientId: string
        clientSecret: string
        refreshToken: string
        accessToken: string
    }
}

export interface IBasicMailCredentials extends TransportOptions {
    service: string
    auth: {
        user: string
        pass: string
    }
}

export type IMailGunMailCredentials = MailgunTransport

class MailCredentialsService {
    mailGun = () => {
        const apiKey = process.env.MAILGUN_ACTIVE_API_KEY
        const domain = process.env.MAILGUN_DOMAIN
        if (!apiKey || !domain) {
            throw new Error('Invalid Mailgun credentials')
        }

        const auth = {
            domain,
            api_key: apiKey,
        }

        return mgTransport({ auth })
    }

    basicGoogle = (): IBasicMailCredentials => {
        const user = process.env.GMAIL_EMAIL
        const pass = process.env.GMAIL_PASSWORD
        if (!user || !pass) {
            throw new Error('Invalid Gmail credentials')
        }

        return {
            service: 'gmail',
            auth: { user, pass },
        }
    }

    googleOAuth2 = async (): Promise<IOAuth2MailCredentials> => {
        const user = process.env.GMAIL_EMAIL
        const clientId = process.env.GOOGLE_OAUTH_ID
        const clientSecret = process.env.GOOGLE_OAUTH_SECRET
        const redirectUrl = process.env.GOOGLE_OAUTH_REDIRECT_URL
        const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN
        if (
            !user ||
            !clientId ||
            !clientSecret ||
            !redirectUrl ||
            !refreshToken
        ) {
            throw new Error('Invalid Google OAuth credentials')
        }

        const oauth2Client = new google.auth.OAuth2(
            clientId,
            clientSecret,
            redirectUrl
        )
        oauth2Client.setCredentials({
            refresh_token: refreshToken,
        })
        const tokens = await oauth2Client.refreshAccessToken()
        const accessToken = String(tokens.credentials.access_token)

        return {
            service: 'gmail',
            auth: {
                user,
                clientId,
                clientSecret,
                refreshToken,
                accessToken,
                type: 'OAuth2',
            },
        }
    }
}

export const mailCredentialsService = new MailCredentialsService()
