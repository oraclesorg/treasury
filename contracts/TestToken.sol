pragma solidity 0.4.18;

import "zeppelin-solidity/contracts/token/StandardToken.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "./Treasury.sol";


contract TestToken is StandardToken, Ownable {
    using SafeMath for uint256;

    Treasury public treasury = Treasury(0x0);
    uint256 public decimals = 0;

    function TestToken(uint256 _totalSupplyItems, uint256 _decimals) public {
        decimals = _decimals;
        totalSupply = _totalSupplyItems.mul(10**_decimals);
        balances[msg.sender] = totalSupply; 
    }

    function setTreasury(address _treasury) public onlyOwner {
        require(_treasury != 0x0);
        treasury = Treasury(_treasury);
    }

    function transfer(address _to, uint256 _tokenAmount) public returns (bool) {
        super.transfer(_to, _tokenAmount);
        if (_to == address(treasury)) {
            treasury.tokenDepositEvent(msg.sender, _tokenAmount);
        }
    }

}
