#!/usr/bin/env node
'use strict';

const https = require('https');
const cheerio = require('cheerio');
const chalk = require('chalk');

const yargs = require('yargs');
const columnify = require('columnify');

const options = yargs
.default('c', 'CSL,CBA,BHP,WBC,NAB,FMG,WES,ANZ,WOW,MQG,RIO,TCL,TLS,GMG,NCM', 'Show all ASX codes')
.usage('Usage: -a <code>')
.option('a', { alias: 'all', describe: 'Show all ASX codes', type: 'string', demandOption: false })
.usage('Usage: -c <code>')
.option('c', { alias: 'code', describe: 'ASX code (eg: BEN or multiple codes BEN,CBA,ATP)', type: 'string', demandOption: true })
.argv;

const code = `${options.code}`.replace(/,/g, '+');
console.clear();

https.get(`https://www.asx.com.au/asx/markets/equityPrices.do?by=asxCodes&asxCodes=${code}`, (response) => {
  response.setEncoding('utf8');
  let rawData = '';
  response.on('data', (chunk) => { rawData += chunk; });
  response.on('end', () => {
    try {
      const parsedData = rawData;
      const $ = cheerio.load(parsedData);
      let results = []
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
      const options = { truncate: true, config: {
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
      }}
      const columns = columnify(results, options)
      console.log(columns)
    } catch (e) {
    console.error(e.message);
    }
  })
})