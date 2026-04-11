import dns from 'node:dns'
import { MongoClient, type MongoClientOptions } from 'mongodb'

// Helps some Windows / dual-stack setups when connecting to Atlas.
dns.setDefaultResultOrder('ipv4first')

declare global {
  // eslint-disable-next-line no-var -- HMR singleton
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

let prodClientPromise: Promise<MongoClient> | undefined

const clientOptions: MongoClientOptions = {
  serverSelectionTimeoutMS: 15_000,
  // Prefer IPv4; avoids occasional Atlas resolution issues on Windows.
  family: 4,
}

async function createConnectedClient(): Promise<MongoClient> {
  const uri =
    process.env.MONGODB_URI?.trim() ||
    (process.env.NODE_ENV === 'development' ? 'mongodb://127.0.0.1:27017' : '')
  if (!uri) {
    throw new Error('Missing MONGODB_URI environment variable')
  }
  const client = new MongoClient(uri, clientOptions)
  await client.connect()
  return client
}

/**
 * Re-use one client per process. If a connect attempt fails (e.g. DNS), clear the
 * cached promise so the next request can retry instead of re-throwing forever.
 */
export async function getMongoClient(): Promise<MongoClient> {
  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = createConnectedClient().catch((err) => {
        global._mongoClientPromise = undefined
        throw err
      })
    }
    return global._mongoClientPromise
  }
  if (!prodClientPromise) {
    prodClientPromise = createConnectedClient().catch((err) => {
      prodClientPromise = undefined
      throw err
    })
  }
  return prodClientPromise
}

export const MONGODB_DB_NAME = 'uehis'
