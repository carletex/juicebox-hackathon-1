pragma solidity >=0.8.0 <0.9.0;

import "hardhat/console.sol";

contract DummyPayer {
    event Pay(uint256 projectId, address beneficiary);

    function pay(
        uint256 _projectId,
        address _token,
        uint256 _amount,
        uint256 _decimals,
        address _beneficiary,
        uint256 _minReturnedTokens,
        bool _preferClaimedTokens,
        string memory _memo,
        bytes memory _metadata
    ) public payable {
        emit Pay(
            _projectId,
            _beneficiary
        );
    }
}
