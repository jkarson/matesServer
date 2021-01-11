import express from 'express';
import { signup, checkUsernameAvailability } from './api';

const signupRouter = express.Router();
signupRouter.post('/', signup);
signupRouter.post('/checkUsernameAvailability', checkUsernameAvailability);

export default signupRouter;
