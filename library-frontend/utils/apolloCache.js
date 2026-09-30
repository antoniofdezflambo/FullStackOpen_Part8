import { ALL_BOOKS } from '../src/queries'

export const addBookToCache = (cache, bookToAdd) => {
  const uniqById = (list) => {
    const seen = new Set()
    return list.filter((item) => {
      return seen.has(item.id) ? false : seen.add(item.id)
    })
  }

  const update = (variables) => {
    try {
      cache.updateQuery({ query: ALL_BOOKS, variables }, (data) => {
        if (!data?.allBooks) return data
        return {
          allBooks: uniqById(data.allBooks.concat(bookToAdd)),
        }
      })
    } catch(error) {
      console.error(error)  
    }
  }

  update()

  update({ genre: null })

  bookToAdd.genres?.forEach((genre) => {
    update({ genre })
  })
}