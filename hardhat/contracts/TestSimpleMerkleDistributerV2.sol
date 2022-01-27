//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { SimpleMerkleDistributer } from "./SimpleMerkleDistributer.sol";

// This is test purpose only. Never deploy this contract to mainnet.
contract TestSimpleMerkleDistributerV2 is SimpleMerkleDistributer {
    uint256 public testValue;

    function setTestValue(uint newTestValue) public {
        testValue = newTestValue;
    } 

    function getTestValue() public view returns (uint256) {
        return testValue;
    }
}