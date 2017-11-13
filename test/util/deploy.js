let Treasury = artifacts.require('Treasury');
let OraclesToken = artifacts.require('OraclesToken');
let data = require('./../data.js');


async function deployTestContracts(accounts) {
    let bridgeAddress = accounts[5];
    let treasuryContract = await Treasury.new();
    let tokenContract = await OraclesToken.new(
        bridgeAddress, data.TOTAL_SUPPLY_ITEMS, data.DECIMALS
    );
    return {
        bridgeAddress,
        treasuryContract,
        tokenContract,
    }
}

module.exports = {
    deployTestContracts,
}
