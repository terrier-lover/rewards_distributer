//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {SafeMathUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {MerkleProofUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/cryptography/MerkleProofUpgradeable.sol";
import {AbstractMerkleDistributer} from "./AbstractMerkleDistributer.sol";

contract SimpleMerkleDistributer is AbstractMerkleDistributer {
    using SafeMathUpgradeable for uint256;

    IERC20 public token;
    bytes32 merkleRoot;
    mapping(address => bool) hasClaimed;

    function initialize(address initialToken, bytes32 initialMerkleRoot)
        public
        initializer
    {
        AbstractMerkleDistributer.initialize();

        token = IERC20(initialToken);
        merkleRoot = initialMerkleRoot;
    }

    function setMerkleRoot(bytes32 newMerkleRoot)
        public
        onlyAdminOrModeratorRoles
    {
        merkleRoot = newMerkleRoot;
    }

    function setHasClaimedPerRecipient(address recipient, bool newHasClaimed)
        public
        onlyAdminOrModeratorRoles
    {
        hasClaimed[recipient] = newHasClaimed;
    }

    function claim(
        address recipient,
        uint256 amount,
        bytes32[] calldata proof
    ) external override nonReentrant {
        require(msg.sender == recipient, "Cannot claim reward of others.");

        (bool isClaimable, string memory message) = getIsClaimable(
            recipient,
            amount,
            proof
        );
        require(isClaimable, message);

        hasClaimed[recipient] = true;
        require(token.transfer(recipient, amount), "Transfer failed");

        emit Claim(recipient, amount);
    }

    function getIsClaimable(
        address recipient,
        uint256 amount,
        bytes32[] calldata proof
    ) public view returns (bool, string memory) {
        if (hasClaimed[recipient]) {
            return (false, "Recipient already claimed");
        }

        bytes32 leaf = keccak256(abi.encodePacked(recipient, amount));
        bool isValidLeaf = MerkleProofUpgradeable.verify(
            proof,
            merkleRoot,
            leaf
        );
        if (!isValidLeaf) {
            return (false, "Not a valid leaf");
        }

        return (true, "Reward is claimable");
    }
}
