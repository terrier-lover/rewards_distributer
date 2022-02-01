//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ReentrancyGuardUpgradeable} from "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import {AccessControlEnumerableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlEnumerableUpgradeable.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

abstract contract AbstractMerkleDistributer is
    AccessControlEnumerableUpgradeable,
    ReentrancyGuardUpgradeable
{
    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");

    IERC20Metadata public token;

    event Claim(
        address indexed recipient, 
        uint256 currentAmount, 
        string uniqueKey
    );

    modifier onlyAdminOrModeratorRoles() {
        require(
            hasRole(DEFAULT_ADMIN_ROLE, _msgSender()) ||
                hasRole(MODERATOR_ROLE, _msgSender()),
            "Not admin or moderator"
        );
        _;
    }

    function initialize() public initializer {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

    function claim(
        address recipient,
        uint256 amount,
        string memory uniqueKey,
        bytes32[] calldata proof
    ) external virtual;

    function getTokenDecimals() public view returns (uint8) {
        return token.decimals();
    }

    function getTokenSymbol() public view returns (string memory) {
        return token.symbol();
    }
}
