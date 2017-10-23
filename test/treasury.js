require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(web3.BigNumber))
  .should();
let data = require('./data.js');
let big = require('./util/bigNum.js').big;

let {deployTestContracts} = require('./util/deploy.js');

contract('Treasury [all features]', function(accounts) {
    let {treasuryContract} = {};

    beforeEach(async () => {
        ({treasuryContract} = await deployTestContracts(accounts));
    });

    it('Decimals attribute', async () => {
        data.DECIMALS.should.be.bignumber.equal(
            await treasuryContract.tokenDecimals()
        );
    });

    it('Token address before initialization', async () => {
        big(0).should.be.bignumber.equal(
            await treasuryContract.tokenAddress()
        );
    });

    it('Exchange rate before initialization', async () => {
        big(0).should.be.bignumber.equal(
            await treasuryContract.tokenRateWei()
        );
    });

    it('Initialization', async () => {
        await treasuryContract.initialize(
            accounts[0], data.ETHER, {value: data.ETHER.mul(100)}
        );
        accounts[0].should.be.equal(
            await treasuryContract.tokenAddress()
        );
        data.ETHER.should.be.bignumber.equal(
            await treasuryContract.tokenRateWei()
        );
        data.ETHER.mul(100).should.be.bignumber.equal(
            await web3.eth.getBalance(treasuryContract.address)
        );
    });

    it('Initialization could be run only once', async () => {
        await treasuryContract.initialize(
            accounts[0], data.ETHER, {value: data.ETHER.mul(100)}
        );
        await treasuryContract.initialize(
                accounts[0], data.ETHER, {value: data.ETHER.mul(100)}
            ).should.be.rejectedWith('invalid opcode');
    });

    it('tokenDepositEvent', async () => {
        let tokenRateWei = data.ETHER;
        await treasuryContract.initialize(
            accounts[0], tokenRateWei, {value: data.ETHER.mul(100)}
        );
        let tokenAmount = big(10).mul(10**data.DECIMALS);
        let initBalance = (
            await web3.eth.getBalance(accounts[1])
        );
        let weiAmount = tokenAmount.divToInt(10**data.DECIMALS).mul(tokenRateWei);
        await treasuryContract.tokenDepositEvent(
            accounts[1], tokenAmount, {from: accounts[0]}
        );
        initBalance.add(weiAmount).should.be.bignumber.equal(
            await web3.eth.getBalance(accounts[1])
        );
    });

    it('tokenDepositEvent fails from non-token address', async () => {
        let tokenRateWei = data.ETHER;
        await treasuryContract.initialize(
            accounts[0], tokenRateWei, {value: data.ETHER.mul(100)}
        );
        let tokenAmount = big(10).mul(10**data.DECIMALS);
        await treasuryContract.tokenDepositEvent(
                accounts[1], tokenAmount, {from: accounts[1]})
            .should.be.rejectedWith('invalid opcode');
    });

    it('tokenDepositEvent generates Exchange event', async () => {
        let tokenRateWei = data.ETHER;
        await treasuryContract.initialize(
            accounts[0], tokenRateWei, {value: data.ETHER.mul(100)}
        );
        let tokenAmount = big(10).mul(10**data.DECIMALS);
        let initBalance = (
            await web3.eth.getBalance(accounts[1])
        );
        let weiAmount = tokenAmount.divToInt(10**data.DECIMALS).mul(tokenRateWei);
        let res = await treasuryContract.tokenDepositEvent(
            accounts[1], tokenAmount, {from: accounts[0]}
        );
        assert.equal(1, res.logs.length);
        assert.equal('Exchange', res.logs[0].event);
        assert.equal(accounts[1], res.logs[0].args['_who']);
        tokenAmount.should.be.bignumber.equal(
            res.logs[0].args['_tokenAmount']
        );
        weiAmount.should.be.bignumber.equal(
            res.logs[0].args['_weiAmount']
        );
    });

    it('getEtherBalance', async () => {
        big(0).should.be.bignumber.equal(
            await treasuryContract.getEtherBalance.call()
        );
        let weiAmount = data.ETHER.mul(100);
        await treasuryContract.initialize(
            accounts[0], data.ETHER, {value: weiAmount}
        );
        weiAmount.should.be.bignumber.equal(
            await treasuryContract.getEtherBalance.call()
        );
    });

});

