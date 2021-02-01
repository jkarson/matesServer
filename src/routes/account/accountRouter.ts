import express from 'express';
import authenticateUser from '../../middleware/authenticateUser';
import {
    getAccountInfo,
    createApartment,
    searchCode,
    requestToJoin,
    viewApartment,
    logOutUser,
    cancelJoinRequest,
    leaveApartment,
} from './api';
const accountRouter = express.Router();

accountRouter.use(authenticateUser);
accountRouter.get('/', getAccountInfo);
accountRouter.post('/createApartment', createApartment);
accountRouter.post('/searchCode', searchCode);
accountRouter.post('/requestToJoin', requestToJoin);
accountRouter.post('/viewApartment', viewApartment);
accountRouter.post('/logOutUser', logOutUser);
accountRouter.post('/cancelJoinRequest', cancelJoinRequest);
accountRouter.post('/leaveApartment', leaveApartment);
export default accountRouter;
