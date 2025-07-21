export const CONFIG = {
  /** DB Configuration */
  dbUsername: process.env.SLS_DB_USERNAME,
  dbPassword: process.env.SLS_DB_PASSWORD,
  dbName: process.env.SLS_DB_NAME,

  /** Google Translate API */
  googleApiKey: process.env.SLS_GOOGLE_API_KEY,

  /** cl = collection */
  cl: {
    terms: 'terms',
    users: 'users',
    userTerms: 'userTerms',
    userSettings: 'userSettings',
  },

  /** IA API */
  iaApiKey: process.env.SLS_IA_API_KEY,

  /** @deprecated Images API */
  imgEndpoint: process.env.SLS_IMG_ENDPOINT,
  imgAccessKey: process.env.SLS_IMG_ACCESS_KEY,
  /** GIF API */
  gifEndpoint: process.env.SLS_GIF_ENDPOINT,
  gifApiKey: process.env.SLS_GIF_API_KEY,
  /** Key alarm */
  keyAlarm: process.env.SLS_KEY_ALARM,
}
