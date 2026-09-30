import { ALL_BOOKS } from '../src/queries'

export const addBookToCache = (cache, bookToAdd) => {
  const uniqById = (list) => {
    const seen = new Set()
    return list.filter((item) => {
      return seen.has(item.id) ? false : seen.add(item.id)
    })
  }

  cache.updateQuery({ query: ALL_BOOKS }, (data) => {
    if (!data || !data.allBooks) return data
    return {
      allBooks: uniqById(data.allBooks.concat(bookToAdd)),
    }
  })

  bookToAdd.genres?.forEach((genre) => {
    cache.updateQuery({ query: ALL_BOOKS, variables: { genre } }, (data) => {
      if (!data || !data.allBooks) return data
      return {
        allBooks: uniqById(data.allBooks.concat(bookToAdd)),
      }
    })
  })
}