// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title ITournament
 * @notice Interface for Tournament contract
 */
interface ITournament {
    function join(bytes32 commitHash) external;
    function reveal(string calldata secret, uint256 score) external;
    function finalize() external;
    function claimPrize() external;
    function getPlayers() external view returns (address[] memory);
    function getPlayerCount() external view returns (uint256);
    function isPlayer(address player) external view returns (bool);
    function getStatus() external view returns (uint8 phase, uint256 playerCount, bool isFull);
    function commits(address) external view returns (bytes32);
    function scores(address) external view returns (uint256);
    function prizeAmounts(address) external view returns (uint256);
    function finalized() external view returns (bool);
    function winners(uint256) external view returns (address);
}

