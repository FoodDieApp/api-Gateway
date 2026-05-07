const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const app: any = express();
const cookieParser = require('cookie-parser');
import { createProxyMiddleware } from 'http-proxy-middleware';
import routes from './routes/index'


app.use(express.json());
app.use(cors({
    origin: [
        'http://localhost:3001',  
        "http://localhost:5174",
         "http://localhost:5173",
         "http://localhost:5175",
         "http://localhost:8081",
         "exp://192.168.90.87:8081"
    ], 
    credentials: true
}
));
app.use(morgan('dev'));
app.use(cookieParser());

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL as string;


app.use(
  "/socket.io",
  createProxyMiddleware({
    target:`${ORDER_SERVICE_URL}`,
    changeOrigin: true,
    ws: true, // enable WebSocket proxying
  })
);
app.use('/api', routes);
app.get("/health", (req:any, res:any) => {
  res.status(200).send("OK");
});

app.use((err: any, req: any, res: any, next: any) => {
    console.error(err.stack);
   
});

module.exports = app;