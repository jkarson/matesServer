import express from 'express';
import Apartment from '../../../objects/apartment/models/Apartment';
import { BillGeneratorType } from '../../../objects/bills/types/BillGeneratorType';
import { BillType } from '../../../objects/bills/types/BillType';
import mongoose from 'mongoose';

const createBillGenerator = (req: express.Request, res: express.Response): void => {
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
        console.log('user apartment found');
        const billGenerator = { ...newBillGenerator, _id: mongoose.Types.ObjectId() } as BillGeneratorType;
        console.log('new bill generator: ');
        console.log(billGenerator);
        userApartment.billsInfo.billGenerators.push(billGenerator);
        console.log('new bill generator added to apartment');
        const generatedBillsWithBillGeneratorId: BillType[] = generatedBills.map((generatedBill: BillType) => {
            return { ...generatedBill, billGeneratorId: billGenerator._id };
        });
        console.log('new bills initialized with bill generator ID');
        userApartment.billsInfo.bills = userApartment.billsInfo.bills.concat(generatedBillsWithBillGeneratorId);
        console.log('new bills added to apartment');
        userApartment.save(function (err, savedUserApartment) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false });
                return;
            }
            console.log('apartment saved');
            res.json({
                ...res.locals,
                success: true,
                billsInfo: savedUserApartment.billsInfo,
            });
        });
    });
};

const updateAmountsOwed = (req: express.Request, res: express.Response): void => {
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
        console.log('user apartment found');
        const bill = userApartment.billsInfo.bills.find((bill) => bill._id.toString() === billId.toString());
        if (!bill) {
            console.log('bill not found');
            res.json({ ...res.locals, success: false });
            return;
        }
        console.log('bill found');
        console.log('updating amounts owed');
        bill.amountsOwed = amountsOwed;
        console.log('saving bill');
        userApartment.save(function (err, savedApartment) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false });
                return;
            }
            console.log('apartment saved');
            res.json({ ...res.locals, success: true, billsInfo: savedApartment.billsInfo });
        });
    });
};

const deleteBill = (req: express.Request, res: express.Response): void => {
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
        console.log('user apartment found');
        const billIndex = userApartment.billsInfo.bills.findIndex((bill) => bill._id.toString() === billId.toString());
        if (billIndex === -1) {
            console.log('bill not found');
            res.json({ ...res.locals, success: false });
            return;
        }
        console.log('bill found');
        userApartment.billsInfo.bills.splice(billIndex, 1);
        console.log('bill deleted');
        userApartment.save(function (err, savedUserApartment) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false });
                return;
            }
            console.log('user apartment saved');
            res.json({ ...res.locals, success: true, billsInfo: savedUserApartment.billsInfo });
        });
    });
};

const deleteBillSeries = (req: express.Request, res: express.Response): void => {
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
        console.log('user apartment found');
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
        console.log('relevant bills deleted');

        userApartment.billsInfo.billGenerators.splice(billGeneratorIndex, 1);
        console.log('relevant bill generator deleted');
        userApartment.save(function (err, savedApartment) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false });
                return;
            }
            console.log('apartment saved');
            res.json({ ...res.locals, success: true, billsInfo: savedApartment.billsInfo });
        });
    });
};

const addBillsAndUpdateBillGenerators = (req: express.Request, res: express.Response): void => {
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
        console.log('user apartment found');
        console.log('adding new bills and updating bill generators');
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
            console.log('user apartment saved');
            const billsInfo = savedUserApartment.billsInfo;
            res.json({ ...res.locals, success: true, billsInfo: billsInfo });
        });
    });
};

const deleteOldBills = (req: express.Request, res: express.Response): void => {
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
        console.log('user apartment found');
        billDeletionIds.forEach((id: string) => {
            const billIndex = userApartment.billsInfo.bills.findIndex((bill) => bill._id.toString() === id);
            if (billIndex === -1) {
                console.log('old bill not found!');
            } else {
                userApartment.billsInfo.bills.splice(billIndex, 1);
                console.log('old bill deleted');
            }
        });
        console.log('old bills deleted');
        userApartment.save(function (err, savedApartment) {
            if (err) {
                console.error(err);
                res.json({ ...res.locals, success: false });
                return;
            }
            console.log('user apartment saved');
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
