#!/usr/bin/env node
'use strict';

import fetch from 'node-fetch';
import chalk from 'chalk';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import columnify from 'columnify';

const divider = '----------------------------------------------------------------------------------------------------';

const options = yargs(hideBin(process.argv))
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
      const change = dataJson.data ? dataJson.data.priceChange ? dataJson.data.priceChange.toString().charAt(0) : '' : '';
      results.push({
        code: chalk.bgHex('#333').hex('#fff').bold(dataJson.data ? (dataJson.data.symbol).toUpperCase() : (asxCode.substring(0,3)).toUpperCase()),
        last: chalk.hex('#fff')(dataJson.data ? dataJson.data.priceLast.toFixed(3) : '-'),
        'chg $': (change === '-') ? chalk.hex('#e88388').bold(dataJson.data ? dataJson.data.priceChange ? dataJson.data.priceChange.toFixed(3) : '-' : '-') : dataJson.data ? dataJson.data.priceChange ? chalk.hex('#a8cc8b').bold(dataJson.data.priceChange.toFixed(3)) : '-' : '-',
        'chg %': (change === '-') ? chalk.hex('#e88388').bold(dataJson.data ? dataJson.data.priceChangePercent ? dataJson.data.priceChangePercent.toFixed(3) : '-' : '-') : dataJson.data ? dataJson.data.priceChangePercent ? chalk.hex('#a8cc8b').bold(dataJson.data.priceChangePercent.toFixed(3)) : '-' : '-',
        bid: chalk.hex('#fff')(dataJson.data ? dataJson.data.priceBid ? dataJson.data.priceBid.toFixed(3) : '-' : '-'),
        offer: chalk.hex('#fff')(dataJson.data ? dataJson.data.priceAsk ? dataJson.data.priceAsk.toFixed(3) : '-' : '-'),
        'day high': chalk.hex('#fff')(dailyDataJson.data ? dailyDataJson.data.underlyingAsset.priceDayHigh ? dailyDataJson.data.underlyingAsset.priceDayHigh.toFixed(3) : '-' : '-'),
        'day low': chalk.hex('#fff')(dailyDataJson.data ? dailyDataJson.data.underlyingAsset.priceDayLow ? dailyDataJson.data.underlyingAsset.priceDayLow.toFixed(3) : '-' : '-'),
        volume: chalk.hex('#fff')(dataJson.data ? dataJson.data.volume ? new Intl.NumberFormat().format(dataJson.data.volume) : '-' : '-')
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
