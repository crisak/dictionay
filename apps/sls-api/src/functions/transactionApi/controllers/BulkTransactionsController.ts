import { BulkTransactions } from '@repo/schemas/BulkTransactions'
import { APIGatewayEvent } from './../types/aws'
import { APIGatewayProxyResult } from 'aws-lambda'

export class BulkTransactionsController {
  static async run(
    event: APIGatewayEvent<BulkTransactions>,
  ): Promise<APIGatewayProxyResult> {
    const row = event.body[0]
    return {
      statusCode: 200,
      body: JSON.stringify(row),
    }
  }
}
