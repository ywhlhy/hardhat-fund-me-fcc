// SPDX-License-Identifier: MIT
pragma solidity >=0.8.18;

import "./PriceConverter.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

error FundMe__NotOwner();

/** @title A contract for crowd funding
 *   @author David
 *   @notice This contract is to demo a sample funding contracts
 *   @dev This implements price feeds as out library
 */
contract FundMe {
    using PriceConverter for uint256;

    uint256 public constant MINIMUM_USD = 1;

    address[] private s_funders;
    mapping(address => uint256) private s_addressAmountFunded;

    address private immutable i_owner;

    AggregatorV3Interface private s_priceFeed;

    uint256 public monkey;

    modifier onlyOwner() {
        // require(msg.sender == i_owner,);
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    //    receive() external payable {
    //        fund();
    //    }
    //
    //    fallback() external payable {
    //        fund();
    //    }

    function storeMonkey(uint256 _monkey) public {
        monkey = _monkey;
    }

    function getMonkey() public view returns (uint256) {
        return monkey;
    }

    /**
     * @notice This function funds this contract
     * @dev This implements price feeds as out library
     */
    function fund() public payable {
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "Didn't send enough!"
        );

        s_funders.push(msg.sender);
        s_addressAmountFunded[msg.sender] += msg.value;
        // s_addressAmountFunded[msg.sender] += 100000000000000000;
    }

    function withdraw() public onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addressAmountFunded[funder] = 0;
        }

        s_funders = new address[](0);

        //transfer
        // payable(msg.sender).transfer(address(this).balance);

        // //send
        // bool sendSuccess =  payable(msg.sender).send(address(this).balance);
        // require(sendSuccess,"Send failed");

        //calll
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }

    function cheaperWithdraw() public payable onlyOwner {
        address[] memory funders = s_funders;
        // payable(msg.sender).transfer(address(this).balance);
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success);
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getAddressToAmountFunded(
        address fundingAddress
    ) public view returns (uint256) {
        return s_addressAmountFunded[fundingAddress];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
