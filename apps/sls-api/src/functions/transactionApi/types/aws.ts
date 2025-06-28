import type { APIGatewayEvent as EV } from 'aws-lambda'

export type APIGatewayEvent<Body extends object> = Omit<EV, 'body'> & {
  body: Body
}
