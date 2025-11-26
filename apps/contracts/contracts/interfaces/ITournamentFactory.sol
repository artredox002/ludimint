// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title ITournamentFactory
 * @notice Interface for TournamentFactory contract
 */
interface ITournamentFactory {
    function createTournament(
        address token,
        uint256 entryFee,
        uint256 maxPlayers,
        uint256 topK,
        uint256 commitDurationSeconds,
        uint256 revealDurationSeconds
    ) external returns (address tournamentAddress);
    
    function getTournaments() external view returns (address[] memory);
    function getTournamentCount() external view returns (uint256);
    function isValidTournament(address tournament) external view returns (bool);
    function tournamentCreators(address) external view returns (address);
}

