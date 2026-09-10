import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'

import { GraphQLError } from 'graphql'

// import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

import mongoose from 'mongoose'
mongoose.set('strictQuery', false)

import Author from './src/models/author.js'
import Book from './src/models/book.js'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI

console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

const typeDefs = `
  type Author {
    name: String!
    born: Int
    bookCount: Int!
    id: ID!
  }

  type Book {
    title: String!
    author: Author!
    published: Int!
    genres: [String!]!
    id: ID!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ) : Book
    addAuthor(
      name: String!
      born: Int
    ) : Author
    editAuthor(
      name: String!
      setBornTo: Int!
    ) : Author
  }
`

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
      const filter = {}
      // if (args.author) {
      //   return books.filter(book => book.author === args.author)
      // }
      // if (args.genre) {
      //   return books.filter(book => book.genres.includes(args.genre))
      // }
      return Book.find(filter)
    },
    allAuthors: async () => Author.find({}),
  },
  Mutation: {
    addBook: async (root, args) => {
      let author = await Author.findOne({ name: args.author })

      if (!author) {
        author = new Author({ name: args.author })
        
        try {
          await author.save()    
        } catch (error) {
          throw new GraphQLError('Saving author failed', {
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
        throw new GraphQLError('Saving book failed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.title,
            error
          }
        })
      }

      return book
    },
    // editAuthor: (root, args) => {
    //   const author = authors.find(author => author.name === args.name)
    //   if (!author) {
    //     return null
    //   }

    //   const updatedAuthor = { ...author, born: args.setBornTo }
    //   authors = authors.map(a => a.name === args.name ? updatedAuthor : a)
    //   return updatedAuthor
    // }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})