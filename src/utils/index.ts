import * as uuid from 'uuid/v4'
import { Request } from 'express'
import { format, parse } from 'url'
import * as escape from 'escape-html'

/**
 * Check if object is plain or has extra properties
 * like a date object.
 *
 * @param {object} obj
 *
 * @returns boolean
 */
export function isPlainObject(obj: object) {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        obj.constructor === Object &&
        Object.prototype.toString.call(obj) === '[object Object]'
    )
}

/**
 *
 * @param {object} obj
 *
 * Check if object is empty
 *
 * @returns boolean
 */
export function isEmpty(obj: object) {
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            return false
        }
    }

    return true
}

/**
 *
 * @param {object} obj
 * @param {array} keys
 *
 * Returns new object with only keys
 * specified in keys param
 */
export function pick(obj: object, keys: string[]) {
    return Object.assign(
        {},
        ...keys.map(k => (k in obj ? { [k]: obj[k] } : {}))
    )
}

/**
 *
 * @param {promise} promise
 *
 * Returns the value from a promise and an error if it exists.
 *
 * @returns {array} [value, error]
 */
interface CustomError extends Error {
    code: string | number
}
export async function promiseWrapper<E = CustomError>(
    promise: Promise<any>
): Promise<[any | undefined, undefined | E]> {
    try {
        return [await promise, undefined]
    } catch (e) {
        return [undefined, e]
    }
}

/**
 *
 * @param {object} obj
 * @param {array} keys
 *
 * Returns new object without keys
 * specified in keys param
 */
export function reject(obj: object, keys: string[]) {
    return Object.assign(
        {},
        ...Object.keys(obj)
            .filter(k => !keys.includes(k))
            .map(k => ({ [k]: obj[k] }))
    )
}

/**
 * @param {object} entity
 * @param {array} fields
 *
 * @returns An object with all entity
 * properties fields specified in the fields param
 */
export function filterEntity(
    entity: object = {},
    fields: string[] = []
): object {
    const fieldsToExclude = ['password'].concat(fields)

    // If entity param is an array of entities loop through
    // and return the new array.
    if (Array.isArray(entity)) {
        return entity.map(e => {
            Object.assign(e, entityRecurse(e, fieldsToExclude))

            return pick(e, fieldsToExclude)
        })
    }

    Object.assign(entity, entityRecurse(entity, fieldsToExclude))

    return pick(entity, fieldsToExclude)
}

function entityRecurse(obj: object = {}, fieldsToExclude: string[]) {
    for (const key in obj) {
        if (obj[key] && typeof obj[key] === 'object') {
            Object.assign(obj, {
                [key]: filterEntity(obj[key], fieldsToExclude),
            })
        }
    }

    return obj
}

/**
 * Boils uuid string down to only numbers and letters
 *
 * @returns string
 */
export function formattedUUID() {
    return uuid().replace(/[^a-z0-9]/gi, '')
}

export function upperCaseFirstLetter(str: string) {
    const s = String(str)

    return s.charAt(0).toUpperCase() + s.slice(1)
}

/**
 * Escapes and removed all extra spaces
 *
 * @param str string to be escaped
 *
 * @returns string
 */
export function escapeString(str: string) {
    return escape(str)
        .replace(/\s+/g, ' ')
        .trim()
}

/**
 * Creates pagination query object following
 * typeorm's spec i.e. '{ skip: 10, take: 20 }'
 *
 * @param params {object} with limit & page & upperLimit
 *
 * @returns paginationObject
 */
export function createPaginationObject(
    params: {
        limit?: number
        page?: number
        upperLimit?: number
    } = {}
) {
    const upperLimit = params.upperLimit ? params.upperLimit : 50
    const pagination = {
        skip: 0,
        take: 10,
    }

    if (params.limit) {
        if (Number(params.limit) > 0) {
            Object.assign(pagination, {
                take: Number(params.limit),
            })
        }

        // Set top limit to upperLimit per request ☝️defaults to 50
        if (Number(params.limit) >= upperLimit) {
            Object.assign(pagination, {
                take: upperLimit,
            })
        }
    }

    if (params.page && Number(params.page) > 0) {
        Object.assign(pagination, {
            skip: Number(pagination.take * (params.page - 1)),
        })
    }

    return pagination
}

/**
 * Builds and formats a url from a request object
 *
 * @param request express request object
 *
 * @returns {string} url
 */
export function formatURL(request: Request): string {
    return format({
        protocol: request.protocol,
        host: request.get('host'),
        pathname: request.originalUrl,
    })
}

/**
 * Breaks url into the base and query params array
 *
 * @param url string with / without query params
 *
 * @returns {object} { baseUrl, queryParams }
 */
function parseUrl(url: string): { baseUrl: string; params: string[] } {
    const newUrlParts = decodeURI(
        String(parse(url.replace('%3F', '?'), true, true).href)
    ).split('?')
    const baseUrl = newUrlParts[0]
    const params = newUrlParts[1] ? newUrlParts[1].split('&') : []

    return {
        baseUrl,
        params,
    }
}

/**
 * Creates next and previous pagination links
 *
 * i.e. links: {
 *  base: http://localhost:8080/v1/listings
 *  prev: http://localhost:8080/v1/listings?query=shop&page=1
 *  next: http://localhost:8080/v1/listings?query=shop&page=3
 * }
 *
 * @param url {string}
 * @param pagination {object} { skip, take }
 */
export function createLinksObject(
    url: string,
    pagination: {
        skip: number
        take: number
    }
) {
    const { skip, take } = pagination
    const { baseUrl, params } = parseUrl(url)

    const newParams = params
        .map(param => {
            if (param.includes('limit')) {
                return `limit=${take}`
            }
            if (param.includes('page')) {
                return
            }

            return param
        })
        .filter(Boolean)

    const perPage = (skip + take) / take
    const previousPage = perPage - 1 <= 0 ? 1 : perPage - 1
    const urlEnd = newParams.length > 0 ? `&${newParams.join('&')}` : ''

    return {
        base: baseUrl,
        next: `${baseUrl}?page=${perPage + 1}${urlEnd}`,
        prev: `${baseUrl}?page=${previousPage}${urlEnd}`,
    }
}

export function createSortObject(sort: string) {
    if (!sort) {
        return {}
    }

    console.log({ sort })

    const [column, direction] = sort.split(':')

    const validDirections = ['asc', 'desc']
    if (!validDirections.includes(direction.toLowerCase())) {
        return {}
    }

    return { order: { [column]: direction.toUpperCase() } }
}
