require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(web3.BigNumber))
  .should();
let data = require('./data.js');
let big = require('./util/bigNum.js').big;

let {deployTestContracts} = require('./util/deploy.js');

contract('Treasury [all features]', function(accounts) {
    let {tokenContract} = {};

    beforeEach(async () => {
        ({tokenContract, treasuryContract} = await deployTestContracts(accounts));
    });

    it('setTreasury fails for non-owner', async () => {
        await tokenContract.setTreasury(treasuryContract.address, {from: accounts[1]})
            .should.be.rejectedWith('invalid opcode');
    });

    it('setTreasury sets treasury contract', async () => {
        big(0).should.be.bignumber.equal(
            await tokenContract.treasury()
        );
        await tokenContract.setTreasury(treasuryContract.address);
        treasuryContract.address.should.be.equal(
            await tokenContract.treasury()
        );
    });

});


