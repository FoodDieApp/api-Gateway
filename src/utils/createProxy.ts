// utils/createProxy.ts
import proxy from 'express-http-proxy';
import { Request } from 'express';

export const createProxy = (targetUrl: string) =>
  proxy(targetUrl, {
    
    proxyReqPathResolver: (req: Request) => req.originalUrl,
    proxyReqOptDecorator: (proxyReqOpts, srcReq: Request) => {
      proxyReqOpts.headers = {
        ...proxyReqOpts.headers,
        'Authorization': srcReq.headers['authorization'] || '',
        'Content-Type': srcReq.headers['content-type'] || 'application/json',
      };
      return proxyReqOpts;
    },
    userResDecorator: async (_proxyRes, proxyResData) => proxyResData,
    
  });
