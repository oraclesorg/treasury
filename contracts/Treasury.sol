pragma solidity 0.4.18;

import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "zeppelin-solidity/contracts/math/SafeMath.sol";
import "./OraclesToken.sol";


contract Treasury is Ownable {
    using SafeMath for uint256;

    // Address of token contract
    OraclesToken public token = OraclesToken(0x0);

    // Exchange rate, how much wei does 1 token cost
    uint256 public  tokenRateWei = 0;

    // Decimal positions in token amount
    uint256 public tokenDecimals = 18;

    event Exchange(address _who, uint256 _tokenAmount, uint256 _weiAmount);
    //
    //function Treasury() public {
    //}

    function() public payable {
        revert();
    }

    function initialize(address _token, uint256 _rate) public payable {
        // Could be run only one time
        require(address(token) == 0x0);
        // Check input data
        require(_token != 0x0);
        require(_rate != 0);
        require(msg.value != 0);
        // Remember data
        token = OraclesToken(_token);
        tokenRateWei = _rate;
    }

    function getEtherBalance() public view returns (uint256) {
        return this.balance;
    }

    // This method is called by token contract
    // when the person submites tokens in excahge of ether
    function tokenDepositEvent(address _person, uint256 _tokenAmount) public {
        require(msg.sender == address(token));
        uint256 weiAmount = _tokenAmount.div(10**tokenDecimals).mul(tokenRateWei);
        require(this.balance >= weiAmount);
        _person.transfer(weiAmount);
        Exchange(_person, _tokenAmount, weiAmount);
    }

}
