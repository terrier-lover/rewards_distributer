// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// WARNING: This is an implemention used for testing purpose. Do not use this in mainnet.
contract SimpleToken is ERC20 {
    constructor() ERC20("Simple Token", "SIM") {}

    function mint(uint256 amount) public {
        _mint(msg.sender, amount);
    }
}
