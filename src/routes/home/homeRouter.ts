import express from 'express';
import { login } from './api';
const homeRouter = express.Router();
homeRouter.post('/login', login);

export default homeRouter;
