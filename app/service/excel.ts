'use strict';

import {BaseService} from "@/extend/class";

/** Import ES6 Default Dependencies !*/
import Excel, {Workbook} from "exceljs";

/** Sequelize TRANSACTION & LOCKER INTERFACES !*/
import type {/*Transaction, LOCK*/} from "sequelize/types/lib/transaction";
/** Sequelize INCREMENT & DECREMENT OPTION INTERFACES !*/
import type {/*IncrementDecrementOptions, IncrementDecrementOptionsWithBy*/} from "sequelize/types/lib/model";

export default class ExcelService extends BaseService {

    /**
     ** @constructor
     ** @param {IContext} ctx
     **/
    constructor(ctx: BaseService["ctx"]) {
        super(ctx);
    }

    /**
     ** Load data and generate excel
     ** @param {Array} headers - Excel title
     ** @param {Array} data - Data parameter
     ** @param {string} name - File name
     **/
    public async export(headers: any, data: any, name: string) {
        let columns: any = []; // Exceljs Columns
        let hjRow = {}; // Total Rows
        let titleRows = headers.length; // Title-Bar Rows Length

        // Processing header
        for (let i = 0; i < titleRows; i++) {
            let row = headers[i];
            for (let j = 0, rowLength = row.length; j < rowLength; j++) {
                let col = row[j];
                let {f, t, w = 15, visible} = col;
                if (!f) continue; // Skip if f does not exist
                if (!visible) continue;

                if (col.totalRow) hjRow[f] = true;
                if (col.totalRowText) hjRow[f] = col.totalRowText;
                col.style = {alignment: {vertical: 'middle', horizontal: 'center'}};
                col.header = t;
                col.key = f;
                col.width = w;
                columns.push(col);
            }
        }


        let workbook = new Excel.Workbook();
        let sheet = workbook.addWorksheet('My Sheet', {views: [{xSplit: 1, ySplit: 1}]});
        sheet.columns = columns;
        sheet.addRows(data);

        // Handling complex headers
        if (titleRows > 1) {
            for (let i = 1; i < titleRows; i++) sheet.spliceRows(1, 0, []); // Insert a blank line at the head

            for (let i = 0; i < titleRows; i++) {
                let row = headers[i];
                for (let j = 0, rlen = row.length; j < rlen; j++) {
                    let col = row[j];
                    if (!col.m1) continue;

                    sheet.getCell(col.m1).value = col.t;
                    sheet.mergeCells(col.m1 + ":" + col.m2);
                }
            }
        }

        // Handling styles, dates, dictionary items
        sheet.eachRow(function (row, rowNumber) {
            // Set row height
            row.height = 25;

            row.eachCell({includeEmpty: true}, (cell) => {
                // Set the border black thin solid line
                const top: any = {style: 'thin', color: {argb: '000000'}};
                const left: any = {style: 'thin', color: {argb: '000000'}};
                const bottom: any = {style: 'thin', color: {argb: '000000'}};
                const right: any = {style: 'thin', color: {argb: '000000'}};
                cell.border = {top, left, bottom, right};

                // Set the title part to bold
                if (rowNumber <= titleRows) {
                    cell.font = {bold: true};
                }
            });
        });

        this.ctx.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        this.ctx.set('Content-Disposition', "attachment;filename*=UTF-8" + encodeURIComponent(name) + '.xlsx');
        this.ctx.body = await workbook.xlsx.writeBuffer();
    }

    /**
     ** @param file
     **/
    public async import(file): Promise<{[p: string]: any}[]> {
        const workbook = new Workbook();

        /** Load file to workbook */
        if (file.filepath.endsWith('.csv') > -1) {
            await workbook.csv.readFile(file.filepath);
        } else if (file.filepath.endsWith('.xlsx') > -1) {
            await workbook.xlsx.readFile(file.filepath);
        } else {
            return Promise.reject('Chấp nhận file csv, xlsx');
        }

        const DEFAULT_DATA_SHEET = 1;
        const worksheet = workbook.getWorksheet(DEFAULT_DATA_SHEET);

        function changeRowsToDict(worksheet): {[p: string]: any}[] {
            let dataArray: {[p: string]: any}[] = [];
            let keys = [];
            worksheet.eachRow(function (row, rowNumber) {
                if (rowNumber === 1) {
                    keys = row.values;
                } else {
                    let rowDict = cellValueToDict(keys, row.values);
                    dataArray.push(rowDict);
                }
            });
            return dataArray;
        }

        function cellValueToDict(keys, rowValue) {
            let rowDict = {};
            keys.forEach((value, index) => {
                rowDict[value] = rowValue[index];
            });
            return rowDict;
        }

        return changeRowsToDict(worksheet);
    }
}

/** For ES5 Default Import Statement !*/
module.exports.default = ExcelService;
