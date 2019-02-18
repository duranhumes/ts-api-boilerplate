import { SuperAgent } from 'superagent'

export async function createSession(
    r: SuperAgent<any>,
    data: {
        email: string
        password: string
    }
) {
    const response = await r
        .post('/login')
        .set('Content-Type', 'application/json')
        .send(data)

    return response.header['set-cookie'][0]
}

export async function deleteSession(r: SuperAgent<any>, cookie: string) {
    await r
        .post('/logout')
        .set('Content-Type', 'application/json')
        .set('cookie', cookie)
        .send({})
}
