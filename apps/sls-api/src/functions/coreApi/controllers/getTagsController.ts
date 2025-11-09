import { MongoClient, ServerApiVersion } from 'mongodb'
import { CONFIG } from '../utils'
import * as DB from '../models'
import middy from '@middy/core'
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda'

const uriDB = `mongodb+srv://${CONFIG.dbUsername}:${CONFIG.dbPassword}@production.h5yse.mongodb.net/?retryWrites=true&w=majority&appName=production`

const clientDB = new MongoClient(uriDB, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE',
}

export const getTagsController = middy<
  APIGatewayEvent,
  APIGatewayProxyResult
>().handler(async () => {
  const collection = await clientDB
    .db(CONFIG.dbName)
    .collection<DB.Term>(CONFIG.cl.terms)

  const allTags = await collection
    .aggregate([
      { $unwind: '$tags' }, // Separate each tag as an individual document
      { $group: { _id: '$tags', count: { $sum: 1 } } }, // Group by tag and count occurrences
      { $sort: { count: -1 } }, // Sort by count descending
    ])
    .toArray()

  console.debug('Result:', allTags)

  return {
    headers,
    statusCode: 200,
    body: JSON.stringify({
      list: allTags.map(({ _id, count }) => ({
        tag: _id,
        total: count,
      })),
    }),
  }
})
