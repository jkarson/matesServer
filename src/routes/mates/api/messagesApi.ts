import express from 'express';
import Apartment from '../../../objects/apartment/models/Apartment';

const postNewMessage = (req: express.Request, res: express.Response): void => {
    const { apartmentId, ...message } = req.body;
    console.log(apartmentId);
    console.log(message);
    console.log(message.time);
    console.log(typeof message.time);
    Apartment.findOne({ _id: apartmentId }, function (err, apartment) {
        if (err) {
            console.error(err);
            res.json({ ...res.locals, success: false, message: err });
            return;
        }
        if (!apartment) {
            res.json({ ...res.locals, success: false, message: 'Apartment not found' });
            return;
        }
        apartment.messages.splice(0, 0, message);
        apartment.save(function (err, savedApartment) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false, message: err });
                return;
            }
            if (!apartment) {
                res.json({ ...res.locals, success: false, message: 'Apartment not found' });
                return;
            }
            res.json({ ...res.locals, success: true, savedMessages: savedApartment.messages });
        });
    });
};

const deleteMessage = (req: express.Request, res: express.Response): void => {
    const { apartmentId, messageId } = req.body;
    Apartment.findOne({ _id: apartmentId }, function (err, apartment) {
        if (err) {
            console.error(err);
            res.json({ ...res.locals, success: false });
            return;
        }
        if (!apartment) {
            res.json({ ...res.locals, success: false });
            return;
        }
        const deletionIndex = apartment.messages.findIndex(
            (message) => message._id.toString() === messageId.toString(),
        );
        apartment.messages.splice(deletionIndex, 1);
        apartment.save(function (err, resultApartment) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false });
                return;
            }
            res.json({ ...res.locals, success: true, resultMessages: resultApartment.messages });
        });
    });
};

export { postNewMessage, deleteMessage };
