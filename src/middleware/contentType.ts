import { Request, Response, NextFunction } from 'express'

export const contentType = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const type = req.headers['content-type']
    if (req.method !== 'GET') {
        const allowedContentTypes = ['application/json', 'multipart/form-data']
        const contentTypeMatches = type
            ? allowedContentTypes.filter(s => type.toLowerCase().includes(s))
            : []
        if (!type || contentTypeMatches.length === 0) {
            return res.status(406).json({
                status: 406,
                error: 'Bad Content-Type Header',
                message: `This API only accepts ${allowedContentTypes.join(
                    ', '
                )} content types for everything except GET requests.`,
            })
        }
    }

    return next()
}
