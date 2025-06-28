import SLSUtil from '../../utils/SLSUtil'

export default {
  handler: `${SLSUtil.handlerPath(__dirname)}/handler.main`,
  layers: [
    'arn:aws:lambda:${aws:region}:${aws:accountId}:layer:node_modules_layer:1',
  ],
  environment: {
    /** DB Configuration */
    // SLS_DB_USERNAME: '${env:SLS_DB_USERNAME}',
    SLS_DB_USERNAME: '${env:SLS_DB_USERNAME}',
    SLS_DB_PASSWORD: '${env:SLS_DB_PASSWORD}',
    SLS_DB_NAME: '${env:SLS_DB_NAME}',
    /** IA API */
    SLS_IA_API_KEY: '${env:SLS_IA_API_KEY}',
    /** Images API */
    SLS_IMG_ENDPOINT: '${env:SLS_IMG_ENDPOINT}',
    SLS_IMG_ACCESS_KEY: '${env:SLS_IMG_ACCESS_KEY}',
    /** GIF API */
    SLS_GIF_ENDPOINT: '${env:SLS_GIF_ENDPOINT}',
    SLS_GIF_API_KEY: '${env:SLS_GIF_API_KEY}',
    /** Key alarm */
    SLS_KEY_ALARM: '${env:SLS_KEY_ALARM}',
  },
  events: [
    {
      http: {
        method: 'POST',
        path: '/v1/translate',
        cors: true,
        private: true,
      },
    },
    {
      http: {
        method: 'POST',
        path: '/v1/translate-audio',
        cors: true,
        private: true,
      },
    },
    {
      http: {
        method: 'POST',
        path: '/v1/terms',
        cors: true,
        private: true,
      },
    },
    {
      http: {
        method: 'GET',
        path: '/v1/terms',
        cors: true,
        private: true,
      },
    },
    {
      http: {
        method: 'DELETE',
        path: '/v1/terms/{id}',
        cors: true,
        private: true,
      },
    },
    {
      http: {
        method: 'GET',
        path: '/v1/health',
      },
    },
  ],
}
