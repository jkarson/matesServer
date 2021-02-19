import express from 'express';
import Apartment from '../../../objects/apartment/models/Apartment';
import { BillGeneratorType } from '../../../objects/bills/types/BillGeneratorType';
import { BillType } from '../../../objects/bills/types/BillType';
import mongoose from 'mongoose';

const createBillGenerator = (req: express.Request, res: express.Response): void => {
    if (!res.locals.authenticated) {
        res.json({ ...res.locals });
        return;
    }
    const { apartmentId, newBillGenerator, generatedBills } = req.body;
    Apartment.findOne({ _id: apartmentId }, function (err, userApartment) {
        if (err) {
            console.error(err);
            res.json({ ...res.locals, success: false });
            return;
        }
        if (!userApartment) {
            console.log('user apartment not found');
            res.json({ ...res.locals, success: false });
            return;
        }
        const billGenerator = { ...newBillGenerator, _id: mongoose.Types.ObjectId() } as BillGeneratorType;
        userApartment.billsInfo.billGenerators.push(billGenerator);
        const generatedBillsWithBillGeneratorId: BillType[] = generatedBills.map((generatedBill: BillType) => {
            return { ...generatedBill, billGeneratorId: billGenerator._id };
        });
        userApartment.billsInfo.bills = userApartment.billsInfo.bills.concat(generatedBillsWithBillGeneratorId);
        userApartment.save(function (err, savedUserApartment) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false });
                return;
            }
            res.json({
                ...res.locals,
                success: true,
                billsInfo: savedUserApartment.billsInfo,
            });
        });
    });
};

const updateAmountsOwed = (req: express.Request, res: express.Response): void => {
    if (!res.locals.authenticated) {
        res.json({ ...res.locals });
        return;
    }
    const { apartmentId, billId, amountsOwed } = req.body;
    Apartment.findOne({ _id: apartmentId }, function (err, userApartment) {
        if (err) {
            console.error(err);
            res.json({ ...res.locals, success: false });
            return;
        }
        if (!userApartment) {
            console.log('user apartment not found');
            res.json({ ...res.locals, success: false });
            return;
        }
        const bill = userApartment.billsInfo.bills.find((bill) => bill._id.toString() === billId.toString());
        if (!bill) {
            console.log('bill not found');
            res.json({ ...res.locals, success: false });
            return;
        }
        bill.amountsOwed = amountsOwed;
        userApartment.save(function (err, savedApartment) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false });
                return;
            }
            res.json({ ...res.locals, success: true, billsInfo: savedApartment.billsInfo });
        });
    });
};

const deleteBill = (req: express.Request, res: express.Response): void => {
    if (!res.locals.authenticated) {
        res.json({ ...res.locals });
        return;
    }
    const { apartmentId, billId } = req.body;
    Apartment.findOne({ _id: apartmentId }, function (err, userApartment) {
        if (err) {
            console.error(err);
            res.json({ ...res.locals, success: false });
            return;
        }
        if (!userApartment) {
            console.log('user apartment not found');
            res.json({ ...res.locals, success: false });
            return;
        }
        const billIndex = userApartment.billsInfo.bills.findIndex((bill) => bill._id.toString() === billId.toString());
        if (billIndex === -1) {
            console.log('bill not found');
            res.json({ ...res.locals, success: false });
            return;
        }
        userApartment.billsInfo.bills.splice(billIndex, 1);
        userApartment.save(function (err, savedUserApartment) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false });
                return;
            }
            res.json({ ...res.locals, success: true, billsInfo: savedUserApartment.billsInfo });
        });
    });
};

const deleteBillSeries = (req: express.Request, res: express.Response): void => {
    if (!res.locals.authenticated) {
        res.json({ ...res.locals });
        return;
    }
    const { apartmentId, billGeneratorId } = req.body;
    Apartment.findOne({ _id: apartmentId }, function (err, userApartment) {
        if (err) {
            console.error(err);
            res.json({ ...res.locals, success: false });
            return;
        }
        if (!userApartment) {
            console.log('user apartment not found');
            res.json({ ...res.locals, success: false });
            return;
        }
        const billGeneratorIndex = userApartment.billsInfo.billGenerators.findIndex(
            (bg) => bg._id.toString() === billGeneratorId.toString(),
        );
        if (billGeneratorIndex === -1) {
            console.log('bill generator not found');
            res.json({ ...res.locals, success: false });
            return;
        }
        const billsInSeries = userApartment.billsInfo.bills.filter(
            (bill) => bill.billGeneratorId.toString() === billGeneratorId.toString(),
        );
        billsInSeries.forEach((bill) =>
            userApartment.billsInfo.bills.splice(userApartment.billsInfo.bills.indexOf(bill), 1),
        );

        userApartment.billsInfo.billGenerators.splice(billGeneratorIndex, 1);
        userApartment.save(function (err, savedApartment) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false });
                return;
            }
            res.json({ ...res.locals, success: true, billsInfo: savedApartment.billsInfo });
        });
    });
};

const addBillsAndUpdateBillGenerators = (req: express.Request, res: express.Response): void => {
    if (!res.locals.authenticated) {
        res.json({ ...res.locals });
        return;
    }
    const { updatedThrough, newBills, apartmentId } = req.body;
    Apartment.findOne({ _id: apartmentId }, function (err, userApartment) {
        if (err) {
            console.error(err);
            res.json({ ...res.locals, success: false });
            return;
        }
        if (!userApartment) {
            console.log('user apartment not found');
            res.json({ ...res.locals, success: false });
            return;
        }
        userApartment.billsInfo.bills.push(...newBills);
        userApartment.billsInfo.billGenerators.forEach(
            (billGenerator) => (billGenerator.updatedThrough = updatedThrough),
        );
        userApartment.save(function (err, savedUserApartment) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false });
                return;
            }
            const billsInfo = savedUserApartment.billsInfo;
            res.json({ ...res.locals, success: true, billsInfo: billsInfo });
        });
    });
};

const deleteOldBills = (req: express.Request, res: express.Response): void => {
    if (!res.locals.authenticated) {
        res.json({ ...res.locals });
        return;
    }
    const { apartmentId, billDeletionIds } = req.body;
    Apartment.findOne({ _id: apartmentId }, function (err, userApartment) {
        if (err) {
            console.error(err);
            res.json({ ...res.locals, success: false });
            return;
        }
        if (!userApartment) {
            console.log('user apartment not found');
            res.json({ ...res.locals, success: false });
            return;
        }
        billDeletionIds.forEach((id: string) => {
            const billIndex = userApartment.billsInfo.bills.findIndex((bill) => bill._id.toString() === id);
            if (billIndex === -1) {
                console.log('old bill not found!');
            } else {
                userApartment.billsInfo.bills.splice(billIndex, 1);
            }
        });
        userApartment.save(function (err, savedApartment) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false });
                return;
            }
            res.json({ ...res.locals, success: true, billsInfo: savedApartment.billsInfo });
        });
    });
};

export {
    createBillGenerator,
    addBillsAndUpdateBillGenerators,
    updateAmountsOwed,
    deleteBill,
    deleteBillSeries,
    deleteOldBills,
};
