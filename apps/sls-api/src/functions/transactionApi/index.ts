import SLSUtil from '../../utils/SLSUtil'

export default {
  handler: `${SLSUtil.handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'post',
        path: '/transactions/bulk',
        cors: true,
        private: true,
      },
    },
  ],
}
