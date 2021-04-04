import log4js from 'log4js'
const logger = log4js.getLogger("stripe-server")
logger.level = "info"

export const log = logger;