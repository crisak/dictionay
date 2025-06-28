import { MongoClient, ObjectId, ServerApiVersion } from 'mongodb'
import { CONFIG } from '../utils'
import * as DB from '../models'

const uriDB = `mongodb+srv://${CONFIG.dbUsername}:${CONFIG.dbPassword}@production.h5yse.mongodb.net/?retryWrites=true&w=majority&appName=production`

const clientDB = new MongoClient(uriDB, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

export async function deleteTermController(userId: string, _id: string) {
  const collection = await clientDB
    .db(CONFIG.dbName)
    .collection<DB.UserTerm>(CONFIG.cl.userTerms)

  const termByUser = await collection.findOne({
    userId: new ObjectId(userId),
    termId: new ObjectId(_id),
  })

  if (termByUser) {
    await collection.deleteOne({
      _id: new ObjectId(termByUser._id),
    })
  }

  /**
   * Obtener el destalle del termino por su id, usar metodos de mongo para consultar
   * por lotes para mejorar la eficiencia
   */

  const collectionTerms = await clientDB
    .db(CONFIG.dbName)
    .collection<DB.Term>(CONFIG.cl.terms)

  await collectionTerms.deleteOne({
    _id: new ObjectId(_id),
  })
}
