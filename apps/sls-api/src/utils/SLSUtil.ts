import { readFileSync } from 'fs'

type TypeResource =
  | 'sqs'
  | 'dynamodb'
  | 'sns'
  | 's3'
  | 'lambda'
  | 'iam'
  | 'apigateway'
  | 'cloudwatch'
  | 'cloudwatchLogs'
  | 'cloudwatchLogsLogGroup'
  | 'cloudwatchLogsDestination'
  | 'cloudwatchLogsSubscriptionFilter'
  | 'cloudwatchEvent'
  | 'cloudwatchEventTarget'
  | 'cloudwatchMetric'
  | 'cloudwatchAlarm'
  | 'cognito-idp'
  | 'kinesis'
  | 'kinesisStream'
  | 'kinesisFirehose'
  | 'kinesisAnalytics'
  | 'kinesisAnalyticsApplication'
  | 'kinesisAnalyticsApplicationOutput'
  | 'kinesisAnalyticsApplicationReferenceDataSource'
  | 'kinesisAnalyticsV2'
  | 'kinesisAnalyticsV2Application'
  | 'kinesisAnalyticsV2ApplicationOutput'
  | 'kinesisAnalyticsV2ApplicationReferenceDataSource'
  | 'kms'
  | 'sqsQueuePolicy'
  | 'sqsQueue'
  | 'snsTopicPolicy'
  | 'snsTopic'
  | 'snsTopicSubscription'
  | 'appsync'
  | 'ses'
  | 's3'

export default class SLSUtil {
  static handlerPath(context: string) {
    const parts = context.split(process?.cwd() ?? '')
    if (parts[1]) {
      return `${parts[1].substring(1).replace(/\\/g, '/')}`
    }
    return context.replace(/\\/g, '/')
  }

  static getKeysFromJson(pathName: string): Array<string> {
    let packageJson: { dependencies: { [key: string]: string } }
    try {
      packageJson = JSON.parse(readFileSync(pathName, 'utf8')) as {
        dependencies: { [key: string]: string }
      }
    } catch (error) {
      console.error(error)
      throw new Error(`Error reading '${pathName}'`)
    }

    const libs = Object.keys(packageJson.dependencies)
    const dependencies = libs
      .map((lib) => {
        const [rootLib] = lib.split('/')
        return rootLib
      })
      .filter((dep): dep is string => typeof dep === 'string' && dep.length > 0)

    return dependencies
  }

  static getTableName(graphqlApiId: string) {
    return (tableName: string) => {
      return `${tableName}-${graphqlApiId}-\${sls:stage}`
    }
  }

  /**
   * Get custom variable of Serverless Framework
   * Apply overlap of functions in TypeScript ti 'getVar'
   */
  static getSecret(
    secretName: string,
    options?: { withoutEnv?: boolean },
  ): string

  static getSecret(
    secretName: Array<string>,
    options?: { withoutEnv?: boolean },
  ): Record<string, string>

  /** Get secret key of AWS System Manager */
  static getSecret(
    secretName: unknown,
    options?: { withoutEnv?: boolean },
  ): unknown {
    if (typeof secretName === 'string') {
      if (options?.withoutEnv) {
        return `\${ssm:/sls/\${self:service}/all/${secretName}}`
      }
      return `\${ssm:/sls/\${self:service}/\${sls:stage}/${secretName}}`
    }

    if (Array.isArray(secretName)) {
      return secretName.reduce((acc, keyName) => {
        let valueStr = `\${ssm:/sls/\${self:service}/\${sls:stage}/${keyName}}`

        if (options?.withoutEnv) {
          valueStr = `\${ssm:/sls/\${self:service}/all/${keyName}}`
        }

        return {
          ...acc,
          [keyName]: valueStr,
        }
      }, {}) as Record<string, string>
    }
  }

  /**
   * @outputs examples
   * - arn:aws:dynamodb:us-east-1:123456789012:table/MyTable
   * - arn:aws:appsync:us-east-1:122155166549:apis/78234h234h2h34jh2k3j4g
   * - arn:aws:lambda:us-east-1:122155166549:function:pickPack-prod-worksheets
   * - arn:aws:ses:us-east-1:123456789012:identity/example.com
   * - arn:aws:sns:us-east-1:123456789012:MyTopic
   */
  static getARNResource(type: TypeResource, resource: string): string
  static getARNResource(
    type: TypeResource,
    resource: Array<string>,
  ): Array<string>

  static getARNResource(type: TypeResource, resource: unknown) {
    const region = '${aws:region}'
    const accountId = '${aws:accountId}'

    if (typeof resource === 'string') {
      if (type === 's3') {
        return `arn:aws:${type}:::${resource}`
      }

      const src = resource
      return `arn:aws:${type}:${region}:${accountId}:${src}`
    }

    if (Array.isArray(resource)) {
      return resource.map((src) => {
        if (type === 's3') {
          return `arn:aws:${type}:::${src}`
        }

        return `arn:aws:${type}:${region}:${accountId}:${src}`
      })
    }

    throw new Error('Resource must be string or array of string')
  }

  static isLocal(): boolean {
    return [process.env.IS_OFFLINE, process.env.IS_LOCAL].includes('true')
  }
}
