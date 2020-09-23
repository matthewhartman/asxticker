#!/usr/bin/env node
'use strict';

const fetch = require('node-fetch');
const chalk = require('chalk');
const yargs = require('yargs');
const columnify = require('columnify');

const divider = '----------------------------------------------------------------------------------------------------';

const options = yargs
.default('c', 'AMC,ANZ,BHP,BXB,CBA,CSL,GMG,IAG,MQG,NAB,NCM,RIO,SCG,SUN,TLS,TCL,WES,WBC,WPL,WOW', 'Show top 20 ASX codes')
.usage('Usage: -c <code>')
.option('c', { alias: 'code', describe: 'ASX code (eg: BEN or multiple codes BEN,CBA,ATP)', type: 'string', demandOption: false })
.argv;

let asxCodes = `${options.code}`.split(',');
let results = [];

async function getAllData() {
  await Promise.all(
    asxCodes.map(async (asxCode) => {
      const data = await fetch(`https://asx.api.markitdigital.com/asx-research/1.0/companies/${asxCode}/header`);
      const dataJson = await data.json();
      const dailyData = await fetch(`https://asx.api.markitdigital.com/asx-research/1.0/derivatives/equity/${asxCode}/options`);
      const dailyDataJson = await dailyData.json();
      const {
        symbol,
        priceLast,
        priceChange,
        priceChangePercent,
        priceBid,
        priceAsk,
        volume
      } = dataJson.data;
      const { priceDayHigh, priceDayLow } = dailyDataJson.data.underlyingAsset;
      const change = priceChange.toString().charAt(0);
      results.push({
        code: chalk.bgHex('#333').hex('#fff').bold(symbol),
        last: chalk.hex('#fff')(priceLast.toFixed(3)),
        'chg $': (change === '-') ? chalk.hex('#e88388').bold(priceChange.toFixed(3)) : chalk.hex('#a8cc8b').bold(priceChange.toFixed(3)),
        'chg %': (change === '-') ? chalk.hex('#e88388').bold(priceChangePercent.toFixed(3)) : chalk.hex('#a8cc8b').bold(priceChangePercent.toFixed(3)),
        bid: chalk.hex('#fff')(priceBid.toFixed(3)),
        offer: chalk.hex('#fff')(priceAsk.toFixed(3)),
        'day high': chalk.hex('#fff')(priceDayHigh.toFixed(3)),
        'day low': chalk.hex('#fff')(priceDayLow.toFixed(3)),
        volume: chalk.hex('#fff')(new Intl.NumberFormat().format(volume))
      });
    })
  ).then(() => {
    const tableOptions = {
      truncate: true,
      config: {
        code: { minWidth: 10 },
        last: { minWidth: 10 },
        'chg $': { minWidth: 10 },
        'chg %': { minWidth: 10 },
        bid: { minWidth: 10 },
        offer: { minWidth: 10 },
        'day high': { minWidth: 10 },
        'day low': { minWidth: 10 },
        volume: { minWidth: 10 },
      }
    }
    const columns = columnify(results, tableOptions);
    console.clear();
    console.log(chalk.hex('#fff').bold(`\n$$$ ASX Ticker $$$\n${divider}`));
    if (results.length) {
      console.log(`${columns}\n${divider}\n* prices are delayed up to 20 minutes\n`);
    }
  });
}

getAllData();
