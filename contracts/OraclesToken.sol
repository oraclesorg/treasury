pragma solidity 0.4.18;

import "zeppelin-solidity/contracts/token/StandardToken.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "./Treasury.sol";


contract OraclesToken is StandardToken, Ownable {
    using SafeMath for uint256;

    Treasury public treasury = Treasury(0x0);
    uint256 public decimals = 0;
    address public bridgeAddress = 0x0;

    function OraclesToken(address _bridgeAddress, uint256 _totalSupplyItems, uint256 _decimals) public {
        require(_bridgeAddress != 0x0);
        bridgeAddress = _bridgeAddress;
        decimals = _decimals;
        totalSupply = _totalSupplyItems.mul(10**_decimals);
        balances[bridgeAddress] = totalSupply;
    }

    function setTreasury(address _treasury) public onlyOwner {
        require(_treasury != 0x0);
        treasury = Treasury(_treasury);
    }

    function treasuryIsSet() public returns (bool) {
        return address(treasury) != 0x0;
    }

    function isTransferAllowed() public returns (bool) {
        return (
            (msg.sender == bridgeAddress)
            || treasuryIsSet()
        );
    }

    function transfer(address _to, uint256 _tokenAmount) public returns (bool) {
        require(isTransferAllowed());
        super.transfer(_to, _tokenAmount);
        if (_to == address(treasury)) {
            treasury.tokenDepositEvent(msg.sender, _tokenAmount);
        }
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
        require(isTransferAllowed());
        super.transferFrom(_from, _to, _value);
        // TODO FIXME
        // call treasury.tokenDepositEvent
    }
}
