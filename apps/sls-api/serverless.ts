/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-namespace */
import * as functions from './src/functions'
import type { Serverless } from 'serverless/aws'

const environment = {
  USERS_TABLE: '${param:tableName}',
} as const

interface ServerlessConfig extends Partial<Serverless> {
  org?: string
  app?: string
  service: string
  stages?: {
    default: {
      params: Record<string, string>
    }
  }
  plugins?: string[]
  build?: {
    esbuild?: {
      configFile?: string
    }
  }
}

const serverlessConfig: ServerlessConfig = {
  org: 'crisak',
  app: 'dictionary-app',
  service: 'dictionary',

  stages: {
    default: {
      params: {
        tableName: 'user-table-${sls:stage}',
      },
    },
  },

  // https://www.serverless.com/plugins/serverless-dotenv-plugin
  // plugins: ['serverless-dotenv-plugin'],
  // useDotenv: true,

  provider: {
    name: 'aws',
    runtime: 'nodejs20.x',

    // enable API to API Gataway a observability
    tracing: {
      apiGateway: true,
      lambda: true,
    },
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
      apiKeys: ['${self:service}-${sls:stage}-apiKeyTemporal'],
    },

    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: [
              'dynamodb:Query',
              'dynamodb:Scan',
              'dynamodb:GetItem',
              'dynamodb:PutItem',
              'dynamodb:UpdateItem',
              'dynamodb:DeleteItem',
            ],
            Resource: [
              {
                'Fn::GetAtt': ['UsersTable', 'Arn'],
              },
            ],
          },
        ],
      },
    },
    environment,
  },

  functions,

  package: {
    individually: true,
  },

  build: {
    esbuild: {
      configFile: './esbuild.config.js',
    },
  },

  resources: {
    Resources: {
      UsersTable: {
        Type: 'AWS::DynamoDB::Table',
        Properties: {
          AttributeDefinitions: [
            {
              AttributeName: 'id',
              AttributeType: 'S',
            },
          ],
          KeySchema: [
            {
              AttributeName: 'id',
              KeyType: 'HASH',
            },
          ],
          BillingMode: 'PAY_PER_REQUEST', // PAY_PER_REQUEST(on-demand) or PROVISIONED(default)
          TableName: '${param:tableName}',
        },
      },
    },
  },
}

/** Set up typescript environment variables */
type KeysVariables = keyof typeof environment
type LambdaVariables = Record<KeysVariables, string>

declare global {
  namespace NodeJS {
    interface Global {
      dictionary: {
        auth: {
          id: string
        }
      }
    }
    interface ProcessEnv extends LambdaVariables {}
  }
}

export default serverlessConfig
