let Treasury = artifacts.require('Treasury');
let TestToken = artifacts.require('TestToken');
let data = require('./../data.js');


async function deployTestContracts(accounts) {
    let treasuryContract = await Treasury.new();
    let tokenContract = await TestToken.new(
        data.TOTAL_SUPPLY_ITEMS, data.DECIMALS
    );
    return {
        treasuryContract: treasuryContract,
        tokenContract: tokenContract,
    }
}

module.exports = {
    deployTestContracts: deployTestContracts,
}
