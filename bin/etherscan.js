#!/usr/bin/env node
const { Command } = require('commander')
const { etherscanPageData } = require('../dist/etherscan')
const program = new Command()
const fs = require('fs-extra')
const path = require('path')
const { omit, get } = require('lodash')


function execAction(options, module, operator) {
    const USER_HOME = process.env.HOME || process.env.USERPROFILE
    const configPath = path.resolve(USER_HOME, '.easyscan.config.json')
    let config = {}
    try {
        config = fs.readJSONSync(configPath)
    } catch (e) {

    }
    const isDebug = get(config, 'debug') || options.debug
    const { baseURL, apiKey: _apiKey } = get(config, ['chains', options.chain]) || {}
    const apiKey = options.apikey || _apiKey
    if (!apiKey) {
        console.error(`Please set apikey by options or in ${configPath}`)
        return
    }
    const targetDir = options.target || process.cwd()
    fs.ensureDirSync(targetDir)
    if (fs.readdirSync(targetDir).length > 0) {
        console.error(`The dir ${targetDir} is not an empty dir.`)
        return
    }
    const etherscan = etherscanPageData(baseURL || options.chain + '', apiKey, undefined, { globalAutoStart: true, debug: isDebug })
    etherscan[module][operator](omit(options, 'debug', 'target', 'chain', 'help'), (pageData, pageIndex, accData, isFinish) => {
        if (isFinish) {
            fs.writeJsonSync(path.resolve(targetDir, `data.json`), accData, { spaces: 4 })
            fs.writeJSONSync(path.resolve(targetDir, 'options.json'), { operator: 'getlogs', ...options, dataLength: accData.length }, { spaces: 4 })
        } else {
            fs.writeJsonSync(path.resolve(targetDir, `${pageIndex}.json`), pageData, { spaces: 4 })
        }
    })
}

program.name('etherscan')
    .description('Cli to query the etherscan data')
    .version('0.1.0')
    .command('getlogs')
    .option('-d,--debug', 'display the request urls')
    .option('-k,--apikey', 'the etherscan api key')
    .option('-t,--target <dir>', 'save target dirname')
    .requiredOption('-c,--chain <number|string>', 'chain id or base url')
    .requiredOption('-a,--address <string>', 'account address')
    .option('-p,--page <number>', 'page index, from 1')
    .option('-o,--offset <number>', 'page limit, max 10000')
    .option('-s,--startblock <number>', 'start block')
    .option('-e,--endblock <number|latest>', 'end block')
    .option('-t0,--topic0 <string>', 'event topic 0')
    .option('-t1,--topic1 <string>', 'event topic 1')
    .option('-t2,--topic2 <string>', 'event topic 2')
    .option('-t3,--topic3 <string>', 'event topic 3')
    .option('-t01,--topic0_1_opr <and|or>', 'event topic operator between topic0 with topic1')
    .option('-t02,--topic0_2_opr <and|or>', 'event topic operator between topic0 with topic2')
    .option('-t03,--topic0_3_opr <and|or>', 'event topic operator between topic0 with topic3')
    .option('-t12,--topic1_2_opr <and|or>', 'event topic operator between topic1 with topic2')
    .option('-t13,--topic1_3_opr <and|or>', 'event topic operator between topic1 with topic3')
    .option('-t23,--topic2_3_opr <and|or>', 'event topic operator between topic2 with topic3')
    .action((options) => {
        execAction(options, 'logs', 'getLogs')
    })
program.name('etherscan')
    .description('Cli to query the etherscan data')
    .version('0.1.0')
    .command('gettxlist')
    .option('-d,--debug', 'display the request urls')
    .option('-k,--apikey', 'the etherscan api key')
    .option('-t,--target <dir>', 'save target dirname')
    .requiredOption('-c,--chain <number|string>', 'chain id or base url')
    .requiredOption('-a,--address <string>', 'account address')
    .option('-p,--page <number>', 'page index, from 1')
    .option('-o,--offset <number>', 'page limit, max 10000')
    .option('-s,--startblock <number>', 'start block')
    .option('-e,--endblock <number|latest>', 'end block')
    .option('-sort <asc|desc>', 'sort')
    .action((options) => {
        execAction(options, 'account', 'txList')
    })
program.parse(process.argv)