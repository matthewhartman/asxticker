const https = require('https');
const cheerio = require('cheerio');
const chalk = require('chalk');
// https://stackoverflow.com/a/28641253
const tab = require('tab');

https.get('https://www.asx.com.au/asx/markets/equityPrices.do?by=asxCodes&asxCodes=ben+apt', (response) => {
  response.setEncoding('utf8');
  let rawData = '';
  response.on('data', (chunk) => { rawData += chunk; });
  response.on('end', () => {
    try {
      const parsedData = rawData;
      const $ = cheerio.load(parsedData);
      let table = new tab.TableOutputStream({
        'columns': [
          { label: 'code', align: 'left', width: 10 },
          { label: 'last price', align: 'left', width: 10 },
          { label: 'change $+/-', align: 'left', width: 10 },
          { label: 'change %', align: 'left', width: 10 },
          { label: 'bid price', align: 'left', width: 10 },
          { label: 'offer price', align: 'left', width: 10 },
          { label: 'open price', align: 'left', width: 10 },
          { label: 'daily high', align: 'left', width: 10 },
          { label: 'daily low', align: 'left', width: 10 },
          { label: 'volume', align: 'left', width: 10 }
        ],
        'omitHeader': true
      });
      // regex - https://stackoverflow.com/a/33823632
      $('.datatable tr').each((index, element) => {
        const row = $(element).text().trim().replace('*', '').replace(/\s+/g, '| ');
        const dataset = row.split('|');
        table.writeRow([
          dataset[0], // code
          dataset[1], // last price
          dataset[2], // change $+/-
          dataset[3], // change %
          dataset[4], // bid price
          dataset[5], // offer price
          dataset[6], // open price
          dataset[7], // daily high
          dataset[8], // daily low
          dataset[9]  // volume
        ]);
      });
    } catch (e) {
      console.error(e.message);
    }
  })
})