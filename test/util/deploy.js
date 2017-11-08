let Treasury = artifacts.require('Treasury');
let TestToken = artifacts.require('TestToken');


async function deployTestContracts(accounts) {
    let treasuryContract = await Treasury.new();
    let tokenContract = await TestToken.new(252460800, 0);
    return {
        treasuryContract: treasuryContract,
        tokenContract: tokenContract,
    }
}

module.exports = {
    deployTestContracts: deployTestContracts,
}
