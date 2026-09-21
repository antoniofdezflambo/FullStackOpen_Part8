import { ApolloServer } from '@apollo/server'

import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { expressMiddleware } from '@as-integrations/express5'
import cors from 'cors'
import express from 'express'
import { makeExecutableSchema } from '@graphql-tools/schema'
import http from 'http'
import { WebSocketServer } from 'ws'
import { useServer } from 'graphql-ws/use/ws'

import { GraphQLError } from 'graphql'

import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

import mongoose from 'mongoose'
mongoose.set('strictQuery', false)

import Author from './src/models/author.js'
import Book from './src/models/book.js'
import User from './src/models/User.js'

import { PubSub } from 'graphql-subscriptions'
const pubsub = new PubSub()

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI //eslint-disable-line no-undef

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

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    filterBooks(genre: String!): [Book!]!
    allAuthors: [Author!]!
    me: User
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
    createUser(
      username: String!
      favoriteGenre: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token  
  }

  type Subscription {
    bookAdded: Book!
  }
`

const resolvers = {
  Author: {
    bookCount: (root) => {
      if(root.books) {
        return root.books.length
      }

      return Book.countDocuments({ author: root._id })
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
    allBooks: async () => await Book.find({}),
    filterBooks: async (root, args) => {
      const filter = {}
      if (args.author) {
        const author = await Author.findOne({ name: args.author })
        if (author) {
          return Book.find({ author: author._id })
        }
      }
      if (args.genre) {
        return Book.find({ genres: { $in: [args.genre] } })
      }
      return Book.find(filter)
    },
    allAuthors: async () => {
      return Author.find({}).populate('books')
    },  
    me: (root, args, context) => {
      return context.currentUser
    }
  },
  Mutation: {
    addBook: async (root, args, context) => {
      if (!context.currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'UNAUTHENTICATED'
          }
        })
      }

      let author = await Author.findOne({ name: args.author })

      if (!author) {
        author = new Author({ name: args.author })
        
        try {
          await author.save()    
        } catch (error) {
          throw new GraphQLError('Saving author failed. Name too short', {
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
        throw new GraphQLError('Saving book failed. Title too short', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.title,
            error
          }
        })
      }
      
      author.books = author.books.concat(book._id)
      await author.save()

      await book.populate('author')

      pubsub.publish('ADD_BOOK', { bookAdded: book })

      return book
    },
    editAuthor: async (root, args, context) => {
      if (!context.currentUser) {
        throw new GraphQLError('not authenticated', {
          extensions: {
            code: 'UNAUTHENTICATED'
          }
        })
      }

      const author = await Author.findOne({ name: args.name })
      if (!author) {
        return null
      }

      author.born = args.setBornTo
      try {
        return await author.save()
      } catch (error) {
        console.log('error updating author:', error.message)
        throw new GraphQLError('Updating author failed. Invalid birth year', {
          extensions: {
            code: 'BAD_USER_INPUT',
            invalidArgs: args.setBornTo,
            error
          }
        })
      }
    },
    createUser: async (root, args) => {
      const user = new User({ ...args })
      return await user.save()
        .catch(error => {
          throw new GraphQLError('Creating the user failed. Username must be unique and at least 3 characters long', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args,
              error
            }
          })
        })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user || args.password !== 'secret') {
        throw new GraphQLError('Invalid username or password', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })
      }

      const userForToken = {
        username: user.username,
        id: user._id
      }

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) } //eslint-disable-line no-undef
    },
  },
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterableIterator(['ADD_BOOK'])
    }
  }
}

/*
const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.startsWith('Bearer ')) {
      try {
        const decodedToken = jwt.verify(auth.substring(7), process.env.JWT_SECRET) //eslint-disable-line no-undef
        const currentUser = await User.findById(decodedToken.id)
        return { currentUser }
      } catch (error) {
        console.error('Error verifying token:', error)
        throw new GraphQLError('Invalid token', {
          extensions: {
            code: 'UNAUTHENTICATED'
          }
        })
      }
    }
  },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
*/

// INICIALIZAR SERVIDOR
const getUserFromAuthHeader = async (auth) => {
  if (!auth || !auth.startsWith('Bearer ')) {
    return null
  }

  try {
    const decodedToken = jwt.verify(auth.substring(7), process.env.JWT_SECRET)
    return await User.findById(decodedToken.id)
  } catch (error) {
    console.error(error)
    return null
  }
}

const startServer = async (port) => {
  const app = express()
  const httpServer = http.createServer(app)

  const schema = makeExecutableSchema({ typeDefs, resolvers })

  const wsServer = new WebSocketServer({
    noServer: true,
  })

  const serverCleanup = useServer({ schema }, wsServer)

  httpServer.on('upgrade', (request, socket, head) => {
    const pathname = new URL(request.url, `http://${request.headers.host}`).pathname
    if(pathname === '/') {
      wsServer.handleUpgrade(request, socket, head, (ws) => {
        wsServer.emit('connection', ws, request)
      })
    } else {
      socket.destroy()
    }
  })

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose()
            }
          }
        }
      }
    ],    
  })

  await server.start()

  app.use(
    '/',
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const auth = req.headers.authorization
        const currentUser = await getUserFromAuthHeader(auth)
        return { currentUser }
      },
    }),
  )
  httpServer.listen(port, '0.0.0.0', () =>
    console.log(`Server is now running on http://localhost:${port}`),
  )
}

startServer(process.env.PORT || 4000)