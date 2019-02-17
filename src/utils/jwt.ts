import * as jsonwebtoken from 'jsonwebtoken'

export function sign(payload: string | {}) {
    const timestamp = new Date().getTime()
    return jsonwebtoken.sign(
        {
            sub: payload,
            iat: timestamp,
        },
        String(process.env.JWT_SECRET),
        {
            expiresIn: 86400000, // One day
            issuer: String(process.env.JWT_ISSUER),
        }
    )
}

export function verify(token: string) {
    return jsonwebtoken.verify(token, String(process.env.JWT_SECRET), {
        issuer: String(process.env.JWT_ISSUER),
    })
}
