pragma solidity 0.4.18;

import "zeppelin-solidity/contracts/token/StandardToken.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "./Treasury.sol";


contract OraclesToken is StandardToken, Ownable {
    using SafeMath for uint256;

    Treasury public treasury = Treasury(0x0);
    uint256 public decimals = 0;

    function OraclesToken(uint256 _totalSupplyItems, uint256 _decimals) public {
        decimals = _decimals;
        totalSupply = _totalSupplyItems.mul(10**_decimals);
        balances[msg.sender] = totalSupply; 
    }

    function setTreasury(address _treasury) public onlyOwner {
        require(_treasury != 0x0);
        treasury = Treasury(_treasury);
    }

    modifier treasuryIsSet() {
        require(address(treasury) != 0x0);
        _;
    }

    function transfer(address _to, uint256 _tokenAmount) public treasuryIsSet returns (bool) {
        super.transfer(_to, _tokenAmount);
        if (_to == address(treasury)) {
            treasury.tokenDepositEvent(msg.sender, _tokenAmount);
        }
    }

    function transferFrom(address _from, address _to, uint256 _value) public treasuryIsSet returns (bool) {
        super.transferFrom(_from, _to, _value);
        if (_to == address(treasury)) {
            // TODO FIXME
            //treasury.tokenDepositEvent(msg.sender, _tokenAmount);
        }
    }
}
