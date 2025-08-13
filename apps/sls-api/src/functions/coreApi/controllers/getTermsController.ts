import { MongoClient, ObjectId, ServerApiVersion } from 'mongodb'
import { CONFIG } from '../utils'
import { Term, UserTerm } from '../schemas'

const uriDB = `mongodb+srv://${CONFIG.dbUsername}:${CONFIG.dbPassword}@production.h5yse.mongodb.net/?retryWrites=true&w=majority&appName=production`

type Filters = {
  tags: string[]
}

const clientDB = new MongoClient(uriDB, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

export async function getTermsController(
  userId: string,
  page: number,
  limit: number,
  filters: Filters,
) {
  const collection = await clientDB
    .db(CONFIG.dbName)
    .collection<UserTerm>(CONFIG.cl.userTerms)

  // find terms by user with filters
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = {
    userId: new ObjectId(userId),
  }

  if (filters.tags && filters.tags.length > 0) {
    query.tags = { $in: filters.tags }
  }

  const termsByUser = await collection
    .find(query)
    .skip((page - 1) * limit)
    .limit(limit)
    .toArray()

  const totalRecords = await collection.countDocuments(query)

  /**
   * Obtener el destalle del termino por su id, usar metodos de mongo para consultar
   * por lotes para mejorar la eficiencia
   */

  const termIds = termsByUser.map((term) => term.termId)

  const collectionTerms = await clientDB
    .db(CONFIG.dbName)
    .collection<Term>(CONFIG.cl.terms)

  const termsDetail = await collectionTerms
    .find({ _id: { $in: termIds } })
    .toArray()

  const mergeTypes = (term: Term) => {
    const bodyTypes = term.types || []
    const translateTypes = term?.dictionary?.map((d) => d.type) || []

    const types = [...bodyTypes, ...translateTypes].filter(Boolean)

    return Array.from(new Set(types))
  }

  const list = termsDetail.map((term) => ({
    ...term,
    types: !term?.types?.length
      ? mergeTypes(term)
      : Array.from(new Set(term.types)),
  }))

  return {
    list,
    total: totalRecords,
  }
}
