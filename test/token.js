require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(web3.BigNumber))
  .should();
let data = require('./data.js');
let big = require('./util/bigNum.js').big;
let OraclesToken = artifacts.require('OraclesToken');
let {deployTestContracts} = require('./util/deploy.js');
let {etherUsedForTx} = require('./util/gas.js');

contract('OraclesToken', function(accounts) {
    let {bridgeAddress, tokenContract, treasuryContract} = {};

    beforeEach(async () => {
        ({bridgeAddress, tokenContract, treasuryContract} = await deployTestContracts(accounts));
    });

    it('constructor arguments set totalSupply', async () => {
        let token = await OraclesToken.new(accounts[0], 100, 2);
        10000..should.be.bignumber.equal(await token.totalSupply());
    });

    it('decimals constructor argument', async () => {
        let token = await OraclesToken.new(accounts[0], 100, 2);
        2..should.be.bignumber.equal(await token.decimals());
    });

    it('totalSupply', async() => {
        data.TOTAL_SUPPLY_ITEMS.mul(10**data.DECIMALS).should.be.bignumber.equal(
            await tokenContract.totalSupply()
        );
    });

    it('setTreasury fails for non-owner', async () => {
        await tokenContract.setTreasury(treasuryContract.address, {from: accounts[1]})
            .should.be.rejectedWith(': revert');
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

    it('transfer fails if treasury is not set', async () => {
        // put some tokens on common accounts[0] balance using bridge account
        await tokenContract.transfer(accounts[0], 100, {from: bridgeAddress});
        await tokenContract.transfer(accounts[1], 100)
            .should.be.rejectedWith(': revert');
    });

    it('transferFrom fails if treasury is not set', async () => {
        await tokenContract.approve(accounts[1], 100);
        // put some tokens on common accounts[0] balance using bridge account
        await tokenContract.transfer(accounts[0], 100, {from: bridgeAddress});
        await tokenContract.transferFrom(accounts[0], accounts[2], 100, {from: accounts[1]})
            .should.be.rejectedWith(': revert');
    });

    it('transfer works if treasury is set', async () => {
        await tokenContract.setTreasury(treasuryContract.address);
        // put some tokens on common accounts[0] balance using bridge account
        await tokenContract.transfer(accounts[0], 100, {from: bridgeAddress});
        await tokenContract.transfer(accounts[1], 100);
        100..should.be.bignumber.equal(
            await tokenContract.balanceOf(accounts[1])
        );
    });

    it('transferFrom works if treasury is set', async () => {
        await tokenContract.setTreasury(treasuryContract.address);
        // put some tokens on common accounts[0] balance using bridge account
        await tokenContract.transfer(accounts[0], 100, {from: bridgeAddress});
        await tokenContract.approve(accounts[1], 100);
        await tokenContract.transferFrom(accounts[0], accounts[2], 100, {from: accounts[1]});
        100..should.be.bignumber.equal(
            await tokenContract.balanceOf(accounts[2])
        );
    });

    it('transferFrom fails if treasury is set AND recipient is treasury', async () => {
        await tokenContract.setTreasury(treasuryContract.address);
        // put some tokens on common accounts[0] balance using bridge account
        await tokenContract.transfer(accounts[0], 100, {from: bridgeAddress});
        await tokenContract.approve(accounts[1], 100);
        await tokenContract.transferFrom(accounts[0], treasuryContract.address, 100, {from: accounts[1]})
            .should.be.rejectedWith(': revert');
    });

    it('transfer works if treasury is NOT set and msg.sender is bridge', async () => {
        await tokenContract.transfer(accounts[1], 100, {from: bridgeAddress});
        100..should.be.bignumber.equal(
            await tokenContract.balanceOf(accounts[1])
        );
    });

    it('transferFrom works if treasury is NOT set and msg.sender is bridge', async () => {
        await tokenContract.approve(bridgeAddress, 100);
        // put some tokens on common accounts[0] balance using bridge account
        await tokenContract.transfer(accounts[0], 100, {from: bridgeAddress});
        await tokenContract.transferFrom(accounts[0], accounts[2], 100, {from: bridgeAddress});
    });

    it('isTransferAllowed', async () => {
        true.should.be.equal(
            await tokenContract.isTransferAllowed.call({from: bridgeAddress})
        );
        false.should.be.equal(
            await tokenContract.isTransferAllowed.call()
        );
        await tokenContract.setTreasury(treasuryContract.address);
        true.should.be.equal(
            await tokenContract.isTransferAllowed.call({from: bridgeAddress})
        );
        true.should.be.equal(
            await tokenContract.isTransferAllowed.call()
        );
    });

    /**
     * @dev exchange all tokens of `msg.sender` for ether from treasury
     */
    it('getEtherForTokens', async () => {
        let tokenRateWei = data.ETHER;
        await tokenContract.setTreasury(treasuryContract.address);
        await treasuryContract.initialize(
            tokenContract.address, tokenRateWei, {value: data.ETHER.mul(100)}
        );
        let tokenAmount = big(10).mul(10**data.DECIMALS);
        let initBalance = (
            await web3.eth.getBalance(accounts[0])
        );
        let weiAmount = tokenAmount.divToInt(10**data.DECIMALS).mul(tokenRateWei);
        // put some tokens on common accounts[0] balance using bridge account
        await tokenContract.transfer(accounts[0], tokenAmount, {from: bridgeAddress});

        res = await tokenContract.getEtherForTokens();

        let etherUsed = etherUsedForTx(res);
        // should be initial balance
        // plus ether exchanged for tokens
        // minus ether for gas
        initBalance.add(weiAmount).sub(etherUsed).should.be.bignumber.equal(
            await web3.eth.getBalance(accounts[0])
        );
    });
});
