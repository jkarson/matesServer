import express from 'express';
import authenticateUser from '../../middleware/authenticateUser';
import { deleteAccount, getAccountSettingsInfo, logOutUser } from './api';

const accountSettingsRouter = express.Router();
accountSettingsRouter.use(authenticateUser);
accountSettingsRouter.get('/', getAccountSettingsInfo);
accountSettingsRouter.post('/logOutUser', logOutUser);
accountSettingsRouter.delete('/deleteAccount', deleteAccount);
export default accountSettingsRouter;
