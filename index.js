#!/usr/bin/env node
'use strict';

const fetch = require('node-fetch');
const cheerio = require('cheerio');
const chalk = require('chalk');
const yargs = require('yargs');
const columnify = require('columnify');

const divider = '--------------------------------------------------------------------------------------------------------------';

const options = yargs
.default('c', 'AMC,ANZ,BHP,BXB,CBA,CSL,GMG,IAG,MQG,NAB,NCM,RIO,SCG,SUN,TLS,TCL,WES,WBC,WPL,WOW', 'Show top 20 ASX codes')
.usage('Usage: -c <code>')
.option('c', { alias: 'code', describe: 'ASX code (eg: BEN or multiple codes BEN,CBA,ATP)', type: 'string', demandOption: false })
.argv;

let code = `${options.code}`.split(',');

let codes = [], size = 10;

while (code.length > 0) {
  codes.push(code.splice(0, size));
}

let results = [];

function getData(asxCodes) {
  return new Promise((resolve, reject) => {
    const response = fetch(`https://www.asx.com.au/asx/markets/equityPrices.do?by=asxCodes&asxCodes=${asxCodes}`)
    .then(response => response.text())
    .then(body => {
      const $ = cheerio.load(body);
      // regex - https://stackoverflow.com/a/33823632
      $('.datatable tr').each((index, element) => {
        const row = $(element).text().trim().replace('*', '').replace(/\s+/g, '| ');
        const column = row.split('| ');
        const change = column[2].charAt(0);
        if (index !== 0) {
          results.push({
            code: chalk.bgHex('#333').hex('#fff').bold(column[0]),
            last: chalk.hex('#fff')(column[1]),
            '$+/-': (change === '-' && index !== 0) ? chalk.hex('#e88388').bold(column[2]) : chalk.hex('#a8cc8b').bold(column[2]),
            '% chg': (change === '-' && index !== 0) ? chalk.hex('#e88388').bold(column[3]) : chalk.hex('#a8cc8b').bold(column[3]),
            bid: chalk.hex('#fff')(column[4]),
            offer: chalk.hex('#fff')(column[5]),
            open: chalk.hex('#fff')(column[6]),
            high: chalk.hex('#fff')(column[7]),
            low: chalk.hex('#fff')(column[8]),
            volume: chalk.hex('#fff')(column[9])
          });
        }
      });
      resolve(results);
    })
  })
}

const getAllData = async () => {
  return Promise.all(codes.map(codes => {
    const asxCodes = codes.toString().replace(/,/g, '+');
    return getData(asxCodes)
  }))
}

getAllData().then((val) => {
  const tableOptions = {
    truncate: true,
    config: {
      code: { minWidth: 10 },
      last: { minWidth: 10 },
      '$+/-': { minWidth: 10 },
      '% chg': { minWidth: 10 },
      bid: { minWidth: 10 },
      offer: { minWidth: 10 },
      open: { minWidth: 10 },
      high: { minWidth: 10 },
      low: { minWidth: 10 },
      volume: { minWidth: 10 },
    }
  }
  const columns = columnify(results, tableOptions);
  console.log(chalk.hex('#fff').bold(`\n$$$ ASX Ticker $$$\n${divider}`));
  if (results.length) {
    console.log(`${columns}\n${divider}\n* prices are delayed up to 20 minutes\n`);
  }
});
