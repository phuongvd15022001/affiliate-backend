import { Environment } from 'src/shared/constants/global.constants';

export const GLOBAL_CONFIG = {
  env: (process.env.NODE_ENV as Environment) ?? Environment.Development,
  frontendUrl: process.env.FRONTEND_URL,
  jwt: {
    secret: process.env.JWT_SECRET as string,
    refreshSecret: process.env.JWT_REFRESH_SECRET as string,
  },
  mail: {
    user: process.env.EMAIL as string,
    pass: process.env.APP_PASSWORD as string,
  },
};
