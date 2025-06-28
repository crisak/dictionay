import { ObjectId } from 'mongodb'
import * as Schema from '../schemas'
import { Term } from './Term'

export type UserTerm = Omit<
  Schema.UserTerm,
  '_id' | 'addedDate' | 'lastReviewed' | 'nextReview' | 'termId' | 'userId'
> & {
  _id: ObjectId
  termId: Term['_id']
  userId: ObjectId
  addedDate: Date
  lastReviewed: Date | null
  nextReview: Date | null
}
