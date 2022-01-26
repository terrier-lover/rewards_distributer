//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { UpgradeableMerkleDistributer } from "./UpgradeableMerkleDistributer.sol";

// This is test purpose only. Never deploy this contract to mainnet.
contract TestUpgradeableMerkleDistributerV2 is UpgradeableMerkleDistributer {
    uint256 public testValue;

    function setTestValue(uint newTestValue) public {
        testValue = newTestValue;
    } 

    function getTestValue() public view returns (uint256) {
        return testValue;
    }
}