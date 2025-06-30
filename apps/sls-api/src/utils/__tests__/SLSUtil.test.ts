import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { readFileSync } from 'fs'
import SLSUtil from '../SLSUtil'

vi.mock('fs')

describe('SLSUtil', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('handlerPath', () => {
    it('should return correct handler path when context contains cwd', () => {
      const mockCwd = '/project/root'
      vi.spyOn(process, 'cwd').mockReturnValue(mockCwd)

      const context = '/project/root/src/functions/handler.ts'
      const result = SLSUtil.handlerPath(context)

      expect(result).toBe('src/functions/handler.ts')
    })

    it('should return context with replaced backslashes when no cwd match', () => {
      vi.spyOn(process, 'cwd').mockReturnValue('/different/path')

      const context = 'src\\functions\\handler.ts'
      const result = SLSUtil.handlerPath(context)

      expect(result).toBe('src/functions/handler.ts')
    })

    it('should handle case when context does not contain cwd', () => {
      vi.spyOn(process, 'cwd').mockReturnValue('/different/path')

      const context = 'src\\functions\\handler.ts'
      const result = SLSUtil.handlerPath(context)

      // Cuando el context no contiene el cwd, debería retornar el context con barras reemplazadas
      expect(result).toBe('src/functions/handler.ts')
    })
  })

  describe('getKeysFromJson', () => {
    it('should return array of dependency keys from package.json', () => {
      const mockPackageJson = {
        dependencies: {
          '@aws-sdk/client-dynamodb': '^3.585.0',
          '@middy/core': '^6.1.6',
          express: '^4.18.0',
          '@types/node': '^20.0.0',
        },
      }

      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockPackageJson))

      const result = SLSUtil.getKeysFromJson('/path/to/package.json')

      expect(result).toEqual(['@aws-sdk', '@middy', 'express', '@types'])
      expect(readFileSync).toHaveBeenCalledWith('/path/to/package.json', 'utf8')
    })

    it('should throw error when file cannot be read', () => {
      vi.mocked(readFileSync).mockImplementation(() => {
        throw new Error('File not found')
      })

      expect(() => {
        SLSUtil.getKeysFromJson('/invalid/path.json')
      }).toThrow("Error reading '/invalid/path.json'")
    })

    it('should handle empty dependencies object', () => {
      const mockPackageJson = {
        dependencies: {},
      }

      vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockPackageJson))

      const result = SLSUtil.getKeysFromJson('/path/to/package.json')

      expect(result).toEqual([])
    })
  })

  describe('getTableName', () => {
    it('should return function that generates table name with API ID', () => {
      const apiId = 'test-api-id'
      const getTableNameFn = SLSUtil.getTableName(apiId)

      const result = getTableNameFn('users')

      expect(result).toBe('users-test-api-id-${sls:stage}')
    })
  })

  describe('getSecret', () => {
    it('should return SSM parameter path for single secret with stage', () => {
      const result = SLSUtil.getSecret('database-url')

      expect(result).toBe(
        '${ssm:/sls/${self:service}/${sls:stage}/database-url}',
      )
    })

    it('should return SSM parameter path for single secret without environment', () => {
      const result = SLSUtil.getSecret('database-url', { withoutEnv: true })

      expect(result).toBe('${ssm:/sls/${self:service}/all/database-url}')
    })

    it('should return object with SSM parameter paths for array of secrets', () => {
      const secrets = ['database-url', 'api-key', 'secret-token']
      const result = SLSUtil.getSecret(secrets)

      expect(result).toEqual({
        'database-url': '${ssm:/sls/${self:service}/${sls:stage}/database-url}',
        'api-key': '${ssm:/sls/${self:service}/${sls:stage}/api-key}',
        'secret-token': '${ssm:/sls/${self:service}/${sls:stage}/secret-token}',
      })
    })

    it('should return object with SSM parameter paths for array of secrets without environment', () => {
      const secrets = ['database-url', 'api-key']
      const result = SLSUtil.getSecret(secrets, { withoutEnv: true })

      expect(result).toEqual({
        'database-url': '${ssm:/sls/${self:service}/all/database-url}',
        'api-key': '${ssm:/sls/${self:service}/all/api-key}',
      })
    })
  })

  describe('getARNResource', () => {
    it('should generate DynamoDB ARN for single resource', () => {
      const result = SLSUtil.getARNResource('dynamodb', 'MyTable')

      expect(result).toBe(
        'arn:aws:dynamodb:${aws:region}:${aws:accountId}:MyTable',
      )
    })

    it('should generate S3 ARN for single resource (special case)', () => {
      const result = SLSUtil.getARNResource('s3', 'my-bucket')

      expect(result).toBe('arn:aws:s3:::my-bucket')
    })

    it('should generate Lambda ARN for single resource', () => {
      const result = SLSUtil.getARNResource('lambda', 'function:my-function')

      expect(result).toBe(
        'arn:aws:lambda:${aws:region}:${aws:accountId}:function:my-function',
      )
    })

    it('should generate ARNs for array of resources', () => {
      const resources = ['table1', 'table2']
      const result = SLSUtil.getARNResource('dynamodb', resources)

      expect(result).toEqual([
        'arn:aws:dynamodb:${aws:region}:${aws:accountId}:table1',
        'arn:aws:dynamodb:${aws:region}:${aws:accountId}:table2',
      ])
    })

    it('should generate S3 ARNs for array of resources', () => {
      const resources = ['bucket1', 'bucket2']
      const result = SLSUtil.getARNResource('s3', resources)

      expect(result).toEqual(['arn:aws:s3:::bucket1', 'arn:aws:s3:::bucket2'])
    })

    it('should throw error for invalid resource type', () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        SLSUtil.getARNResource('dynamodb', 123 as any)
      }).toThrow('Resource must be string or array of string')
    })
  })

  describe('isLocal', () => {
    it('should return true when IS_OFFLINE is true', () => {
      vi.stubEnv('IS_OFFLINE', 'true')

      const result = SLSUtil.isLocal()

      expect(result).toBe(true)
    })

    it('should return true when IS_LOCAL is true', () => {
      vi.stubEnv('IS_LOCAL', 'true')

      const result = SLSUtil.isLocal()

      expect(result).toBe(true)
    })

    it('should return false when neither variable is true', () => {
      vi.stubEnv('IS_OFFLINE', 'false')
      vi.stubEnv('IS_LOCAL', 'false')

      const result = SLSUtil.isLocal()

      expect(result).toBe(false)
    })

    it('should return false when variables are undefined', () => {
      vi.stubEnv('IS_OFFLINE', undefined)
      vi.stubEnv('IS_LOCAL', undefined)

      const result = SLSUtil.isLocal()

      expect(result).toBe(false)
    })
  })
})
