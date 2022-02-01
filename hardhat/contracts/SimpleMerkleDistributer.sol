//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {MerkleProofUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/cryptography/MerkleProofUpgradeable.sol";
import {AbstractMerkleDistributer, IERC20Metadata} from "./AbstractMerkleDistributer.sol";

contract SimpleMerkleDistributer is AbstractMerkleDistributer {
    bytes32 merkleRoot;
    mapping(address => mapping(string => bool)) hasClaimed;

    function initialize(address initialToken, bytes32 initialMerkleRoot)
        public
        initializer
    {
        AbstractMerkleDistributer.initialize();

        token = IERC20Metadata(initialToken);
        merkleRoot = initialMerkleRoot;
    }

    function setMerkleRoot(bytes32 newMerkleRoot)
        public
        onlyAdminOrModeratorRoles
    {
        merkleRoot = newMerkleRoot;
    }

    function setHasClaimedPerRecipientAndUniqueKey(
        address recipient, 
        string memory uniqueKey,
        bool newHasClaimed
    )
        public
        onlyAdminOrModeratorRoles
    {
        hasClaimed[recipient][uniqueKey] = newHasClaimed;
    }

    function claim(
        address recipient,
        uint256 amount,
        string memory uniqueKey,
        bytes32[] calldata proof
    ) external override nonReentrant {
        require(
            (
                _msgSender() == recipient
                ||  hasRole(DEFAULT_ADMIN_ROLE, _msgSender())
                ||  hasRole(MODERATOR_ROLE, _msgSender())
            ),
            "Cannot claim reward of others."
        );

        (bool isClaimable, string memory message) = getIsClaimable(
            recipient,
            amount,
            uniqueKey,
            proof
        );
        require(isClaimable, message);

        hasClaimed[recipient][uniqueKey] = true;
        require(token.transfer(recipient, amount), "Transfer failed");

        emit Claim(recipient, amount, uniqueKey);
    }

    function getIsClaimable(
        address recipient,
        uint256 amount,
        string memory uniqueKey,
        bytes32[] calldata proof
    ) public view returns (bool, string memory) {
        if (hasClaimed[recipient][uniqueKey]) {
            return (false, "Recipient already claimed");
        }

        bytes32 leaf = keccak256(abi.encodePacked(recipient, amount, uniqueKey));
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

    function claimAllDiposits() public onlyAdminOrModeratorRoles {
        uint256 currentBalance = token.balanceOf(address(this));
        if (currentBalance <= 0) {
            revert('No available balance');
        }

        require(
            token.transfer(_msgSender(), currentBalance), 
            "Transfer failed"
        );
    }
}
