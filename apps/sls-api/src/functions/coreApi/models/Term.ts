import { Binary, ObjectId } from 'mongodb'
import * as Schema from '../schemas'

export type Term = Omit<
  Schema.Term,
  '_id' | 'createdAt' | 'updatedAt' | 'image' | 'audio'
> & {
  _id: ObjectId
  createdAt: Date
  updatedAt: Date
  image: Binary | null
  audio: Binary | null
}
