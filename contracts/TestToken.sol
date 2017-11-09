pragma solidity 0.4.18;
import "zeppelin-solidity/contracts/token/StandardToken.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./Treasury.sol";


contract TestToken is StandardToken, Ownable {
    Treasury public treasury = Treasury(0x0);

    function TestToken(uint _hardCap, uint _decimals) public {
        totalSupply = _hardCap * (10**_decimals);
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
