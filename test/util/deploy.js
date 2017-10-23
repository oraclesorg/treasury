let Treasury = artifacts.require('Treasury');
//let TestToken = artifacts.require('TestToken');


async function deployTestContracts(accounts) {
    let treasuryContract = await Treasury.new();
    //let tokenContract = await TestToken.new();
    //await tokenContract.mint(accounts[0], 1000);
    return {
        treasuryContract: treasuryContract,
        //tokenContract: tokenContract,
    }
}

module.exports = {
    deployTestContracts: deployTestContracts,
}
