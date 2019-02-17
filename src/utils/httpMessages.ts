export const code500 = (
    error = 'Unknown',
    message = 'Something went wrong please try again.'
) => ({
    error,
    message,
    status: 500,
})

export const code422 = (
    error = 'Unacceptable data',
    message = 'The data passed does not meet the reqiurements for this endpoint',
    fields: string[] = []
) => ({
    error,
    message,
    fields,
    status: 422,
})

export const code409 = (
    error = 'Duplicate',
    message = 'Resource already exists'
) => ({
    error,
    message,
    status: 409,
})

export const code404 = (
    error = 'Not Found',
    message = 'The resource at this endpoint was not found'
) => ({
    error,
    message,
    status: 404,
})

export const code403 = (
    error = 'Forbbiden',
    message = 'You cannot perform this action'
) => ({
    error,
    message,
    status: 403,
})

export const code401 = (
    error = 'Unauthorized',
    message = 'Invalid credentials'
) => ({
    error,
    message,
    status: 401,
})

export const code204 = (data = {}, message = 'Resource found') => ({
    data,
    message,
    status: 204,
})

export const code201 = (data = {}, message = 'Created') => ({
    data,
    message,
    status: 201,
})

export const code200 = (data = {}, message = 'Success') => ({
    data,
    message,
    status: 200,
})
