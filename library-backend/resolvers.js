const { GraphQLError } = require('graphql')

const Author = require('./models/author')
const Book = require('./models/book')

const resolvers = {
  Author: {
    bookCount: async (root) => {
      return await Book.countDocuments({ author: root._id })
    }
  },

  Book: {
    author: async (root) => {
      return Author.findById(root.author)
    }
  },

  Query: {
    bookCount: async () => await Book.countDocuments(),
    authorCount: async () => await Author.countDocuments(),
    allBooks: async (root, args) => {
      if (args.author) {
        const author = await Author.findOne({ name: args.author })
        if (author) {
          return Book.find({ author: author._id })
        }
      }
      if (args.genre) {
        return Book.find({ genres: { $in: [args.genre] } })
      }
      return Book.find({})
    },
    allAuthors: async () => Author.find({})
  },

  Mutation: {
    addBook: async (root, args) => {
      let author = await Author.findOne({ name: args.author })

      if (!author) {
        author = new Author({ name: args.author })
        
        try {
          await author.save()    
        } catch (error) {
          throw new GraphQLError('Saving author failed. Name too short.', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.author,
              error
            }
          })
        }
      }

      const book = new Book({ ...args, author: author._id })

      try {
        await book.save()
      } catch (error) {
        throw new GraphQLError('Saving book failed. Title too short.', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.title,
            error
          }
        })
      }

      return book  
    },
    editAuthor: async (root, args) => {
      const author = await Author.findOne({ name: args.name })
      if (!author) {
        return null
      }

      author.born = args.setBornTo
      try {
        return await author.save()
      } catch (error) {
        console.log('Error updating author:', error.message)
        throw new GraphQLError('Updating author failed. Invalid birth year', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.setBornTo,
            error
          }
        })
      }
    }
  },
}

module.exports = resolvers