import { Request, Response, NextFunction } from 'express';
import { UserType } from '../objects/user/types/UserType';

function authenticateUser(req: Request, res: Response, next: NextFunction): void {
    // passport adds this to the request object
    if (req.isAuthenticated()) {
        console.log('user is logged in, proceeding to route');
        const user = req.user as UserType;
        console.log('user id: ' + user.id);
        res.locals.authenticated = true;
        return next();
    } else {
        console.log('user is not logged in, informing client.');
        res.json({ authenticated: false });
        return;
    }
}

export default authenticateUser;
