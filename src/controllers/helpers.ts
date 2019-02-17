export function formatValidationError(errors: object[]) {
    const errString = errors
        .map((err: any) => `${err.param}: ${err.msg}`)
        .join(', ')

    const fields: string[] = [...new Set(errors.map((err: any) => err.param))]

    return { errString, fields }
}
