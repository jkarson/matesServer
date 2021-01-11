import express from 'express';
import Apartment from '../../../objects/apartment/models/Apartment';

const addNewContact = (req: express.Request, res: express.Response): void => {
    const { apartmentId, contact } = req.body;
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
        apartment.manuallyAddedContacts.push(contact);
        apartment.save(function (err, resultApartment) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false });
            }
            res.json({ ...res.locals, success: true, manuallyAddedContacts: resultApartment.manuallyAddedContacts });
        });
    });
};

const deleteContact = (req: express.Request, res: express.Response): void => {
    //console.log('hello from delete contact');
    const { apartmentId, contactId } = req.body;
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
        const deletionIndex = apartment.manuallyAddedContacts.findIndex(
            (contact) => contact._id.toString() === contactId.toString(),
        );
        apartment.manuallyAddedContacts.splice(deletionIndex, 1);
        apartment.save(function (err, resultApartment) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false });
                return;
            }
            res.json({
                ...res.locals,
                success: true,
                remainingManuallyAddedContacts: resultApartment.manuallyAddedContacts,
            });
        });
    });
};

export { addNewContact, deleteContact };
