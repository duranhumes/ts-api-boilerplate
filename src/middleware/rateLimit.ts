import { RateLimiterRedis } from 'rate-limiter-flexible'
import { Request, Response, NextFunction } from 'express'

import { redisClient } from '../redis'
import * as httpMessages from '../utils/httpMessages'

const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'limiter',
    points: 100,
    duration: 15 * 60 * 1000,
    blockDuration: 0,
})

export const rateLimit = (req: Request, res: Response, next: NextFunction) => {
    const ip = req.connection.remoteAddress
    if (!ip) {
        return res.status(500).json(httpMessages.code500())
    }

    return rateLimiter
        .consume(String(ip))
        .then(() => {
            return next()
        })
        .catch(() => {
            return res.status(429).json({
                message: {
                    status: 429,
                    error: 'To many requests',
                    message: 'To many requests, please try again later',
                },
            })
        })
}
