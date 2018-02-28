'use strict';
import * as path from 'path';
import * as _ from 'lodash';
import {expect} from 'chai';
import * as DBFFile from 'dbffile';

describe('Reading a DBF file', () => {

    let tests = [
        {
            filename: 'PYACFL.DBF',
            rowCount: 45,
            firstRow: { AFCLPD: 'W', AFHRPW: 2.92308, AFLVCL: 0.00, AFCRDA: new Date(1999, 2, 25), AFPSDS: '' },
            delCount: 30,
            error: null
        },
        {
            filename: 'dbase_03.dbf',
            rowCount: null,
            firstRow: null,
            delCount: null,
            error: `Duplicate field name: 'Point_ID'`
        },
        {
            filename: 'QYUZK0P.env',
            rowCount: 1,
            firstRow: { "EST_SYSTEM":"A",
                        "SW_VERSION":"AE-8.0.414",
                        "DB_VERSION":"",
                        "DB_DATE": new Date("2017-06-01T04:00:00.000Z"),
                        "UNQFILE_ID":"QYUZK0P",
                        "RO_ID":"",
                        "ESTFILE_ID":"C602E65C-4E1B-417C-85C0-44A344871DA9",
                        "SUPP_NO":"E01",
                        "EST_CTRY":"CAN",
                        "TOP_SECRET":"",
                        "H_TRANS_ID":"",
                        "H_CTRL_NO":"",
                        "TRANS_TYPE":"E",
                        "STATUS":false,
                        "CREATE_DT": new Date("2017-06-19T04:00:00.000Z"),
                        "CREATE_TM":"100934",
                        "TRANSMT_DT": new Date("2018-02-02T05:00:00.000Z"),
                        "TRANSMT_TM":"111033",
                        "INCL_ADMIN":true,
                        "INCL_VEH":true,
                        "INCL_EST":true,
                        "INCL_PROFL":true,
                        "INCL_TOTAL":true,
                        "INCL_VENDR":true,
                        "EMS_VER":"2.6" },
            delCount: 0,
            error: null
        },
        {
            filename: 'QYUZK0PV.veh',
            rowCount: 1,
            firstRow: { "IMPACT_1":"06",
                        "IMPACT_2":"",
                        "DMG_MEMO":"2517850961643BFAID1                           NC                                                                13                                    ABSAC ALRBSTCC CD CHGCTCDABDEFDHMDRLFSTHABHAHINWIVMKESLESMP3OHCPB PL PS PW RTRSABSFRSTETCHTCSTDSTELTNTTW VEL                                                                                                                                                                                                                                                                                                    AT6C 1",
                        "DB_V_CODE":"61643",
                        "PLATE_NO":"ABC1234",
                        "PLATE_ST":"ON",
                        "V_VIN":"3VWRX7AJ4AM065626",
                        "V_COND":"GO",
                        "V_PROD_DT":"",
                        "V_MODEL_YR":"10",
                        "V_MAKECODE":"6164",
                        "V_MAKEDESC":"Volkswagen",
                        "V_MODEL":"Jetta",
                        "V_TYPE":"PC",
                        "V_BSTYLE":"Trendline 4 DR Sedan",
                        "V_TRIMCODE":"",
                        "TRIM_COLOR":"",
                        "V_MLDGCODE":"",
                        "V_ENGINE":"5cyl Gasoline 2.5",
                        "V_MILEAGE":"156444",
                        "V_OPTIONS":"AC;                   Air Conditioning\n   ALR;                       Alarm System\n   BST;                       Bucket Seats\n    CC;                     Cruise Control\n    CD;                    AM/FM CD Player\n   CHG;                      Chrome Grille\n   ABS;                   Anti-Lock Brakes\n   CTC;                     Center Console\n   DAB;                       Dual Airbags\n   DEF;              Rear Window Defroster\n   DHM;               Heated Power Mirrors\n   DRL;             Daytime Running Lights\n   FST;               Full Size Spare Tire\n   HAB;                       Head Airbags\n   HAH;                 Halogen Headlights\n   INW;                Intermittent Wipers\n   IVM;           Illuminated Visor Mirror\n   KES;               Keyless Entry System\n   LES;               Lighted Entry System\n   MP3;                        MP3 Decoder\n   OHC;                   Overhead Console\n    PB;                       Power Brakes\n    PL;                   Power Door Locks\n    PS;                     Power Steering\n    PW;                      Power Windows\n   RTR;           Rem Trunk-L/Gate Release\n   SAB;                       Side Airbags\n   SFR;            Split Folding Rear Seat\n   STE;                       Steel Wheels\n   TCH;                         Tachometer\n   TCS;            Traction Control System\n   TDS;             Theft Deterrent System\n   TEL;            Telescopic Steering Whl\n   TNT;                       Tinted Glass\n    TW;                Tilt Steering Wheel\n   VEL;                 Velour/Cloth Seats",
                        "V_COLOR":"REFLEX SILVER MET",
                        "V_TONE":1,
                        "V_STAGE":2,
                        "PAINT_CD1":"8E,8E8E",
                        "PAINT_CD2":"",
                        "PAINT_CD3":"",
                        "V_MEMO":"" },
            delCount: 0,
            error: null
        },
    ];

    tests.forEach(test => {
        it(test.filename, async () => {
            let filepath = path.join(__dirname, `./fixtures/${test.filename}`);
            let expectedRows = test.rowCount;
            let expectedData = test.firstRow;
            let expectedDels = test.delCount;
            let expectedError = test.error;
            let actualRows = null;
            let actualData = null;
            let actualDels = null;
            let actualError = null;
            try {
                let dbf = await (DBFFile.open(filepath));
                let rows = await (dbf.readRecords(500));
                actualRows = dbf.recordCount;
                actualData = _.pick(rows[0], _.keys(expectedData));
                actualDels = dbf.recordCount - rows.length;
            }
            catch (ex) {
                actualError = ex.message;
            }
            if (expectedError || actualError) {
                expect(actualError).equals(expectedError);
            }
            else {
                expect(actualRows).equals(expectedRows);
                expect(actualData).deep.equal(expectedData);
                expect(actualDels).equals(expectedDels);
            }
        });
    });
});
