export interface IRepository<T> {
    findQuery: (query: object) => Promise<T[] | []>
    findOneQuery: (query: object) => Promise<T>
    countQuery: (query: object) => Promise<number>
}
