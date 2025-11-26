// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "./Tournament.sol";

/**
 * @title TournamentFactory
 * @notice Factory contract for creating and managing Tournament instances
 * @dev Maintains an index of all created tournaments
 */
contract TournamentFactory is Ownable {
    using EnumerableSet for EnumerableSet.AddressSet;

    // ============ State Variables ============

    /// @notice Set of all tournament addresses
    EnumerableSet.AddressSet private tournaments;

    /// @notice Mapping from tournament address to creator
    mapping(address => address) public tournamentCreators;

    /// @notice Minimum entry fee allowed (can be set by owner)
    uint256 public minEntryFee;

    /// @notice Maximum players allowed per tournament (can be set by owner)
    uint256 public maxPlayersPerTournament;

    /// @notice Minimum commit duration in seconds (can be set by owner)
    uint256 public minCommitDuration;

    /// @notice Minimum reveal duration in seconds (can be set by owner)
    uint256 public minRevealDuration;

    // ============ Events ============

    event TournamentCreated(
        address indexed creator,
        address indexed tournament,
        address indexed token,
        uint256 entryFee,
        uint256 maxPlayers,
        uint256 topK
    );

    event MinEntryFeeUpdated(uint256 oldFee, uint256 newFee);
    event MaxPlayersUpdated(uint256 oldMax, uint256 newMax);
    event MinDurationsUpdated(uint256 commitDuration, uint256 revealDuration);

    // ============ Constructor ============

    constructor(address _owner) Ownable(_owner) {
        minEntryFee = 0.01 ether; // Default minimum (adjust for token decimals)
        maxPlayersPerTournament = 200;
        minCommitDuration = 1 hours;
        minRevealDuration = 1 hours;
    }

    // ============ Public Functions ============

    /**
     * @notice Create a new tournament
     * @param token ERC20 token address for entry fees
     * @param entryFee Entry fee amount in token units
     * @param maxPlayers Maximum number of players
     * @param topK Number of top players to reward
     * @param commitDurationSeconds Duration of commit phase in seconds
     * @param revealDurationSeconds Duration of reveal phase in seconds
     * @return tournamentAddress Address of the newly created tournament
     */
    function createTournament(
        address token,
        uint256 entryFee,
        uint256 maxPlayers,
        uint256 topK,
        uint256 commitDurationSeconds,
        uint256 revealDurationSeconds
    ) external returns (address tournamentAddress) {
        require(token != address(0), "Factory: Invalid token address");
        require(entryFee >= minEntryFee, "Factory: Entry fee too low");
        require(maxPlayers >= 2 && maxPlayers <= maxPlayersPerTournament, "Factory: Invalid max players");
        require(topK > 0 && topK <= maxPlayers, "Factory: Invalid topK");
        require(commitDurationSeconds >= minCommitDuration, "Factory: Commit duration too short");
        require(revealDurationSeconds >= minRevealDuration, "Factory: Reveal duration too short");

        // Deploy new tournament contract
        Tournament tournament = new Tournament(
            token,
            entryFee,
            maxPlayers,
            topK,
            commitDurationSeconds,
            revealDurationSeconds,
            msg.sender
        );

        tournamentAddress = address(tournament);

        // Register tournament
        tournaments.add(tournamentAddress);
        tournamentCreators[tournamentAddress] = msg.sender;

        emit TournamentCreated(
            msg.sender,
            tournamentAddress,
            token,
            entryFee,
            maxPlayers,
            topK
        );
    }

    // ============ Owner Functions ============

    /**
     * @notice Set minimum entry fee
     * @param _minEntryFee New minimum entry fee
     */
    function setMinEntryFee(uint256 _minEntryFee) external onlyOwner {
        require(_minEntryFee > 0, "Factory: Invalid fee");
        uint256 oldFee = minEntryFee;
        minEntryFee = _minEntryFee;
        emit MinEntryFeeUpdated(oldFee, _minEntryFee);
    }

    /**
     * @notice Set maximum players per tournament
     * @param _maxPlayers New maximum players
     */
    function setMaxPlayersPerTournament(uint256 _maxPlayers) external onlyOwner {
        require(_maxPlayers >= 2, "Factory: Invalid max players");
        uint256 oldMax = maxPlayersPerTournament;
        maxPlayersPerTournament = _maxPlayers;
        emit MaxPlayersUpdated(oldMax, _maxPlayers);
    }

    /**
     * @notice Set minimum durations
     * @param _minCommitDuration Minimum commit duration in seconds
     * @param _minRevealDuration Minimum reveal duration in seconds
     */
    function setMinDurations(
        uint256 _minCommitDuration,
        uint256 _minRevealDuration
    ) external onlyOwner {
        require(_minCommitDuration > 0, "Factory: Invalid commit duration");
        require(_minRevealDuration > 0, "Factory: Invalid reveal duration");
        minCommitDuration = _minCommitDuration;
        minRevealDuration = _minRevealDuration;
        emit MinDurationsUpdated(_minCommitDuration, _minRevealDuration);
    }

    // ============ View Functions ============

    /**
     * @notice Get all tournament addresses
     * @return Array of tournament addresses
     */
    function getTournaments() external view returns (address[] memory) {
        return tournaments.values();
    }

    /**
     * @notice Get tournament count
     * @return Number of tournaments created
     */
    function getTournamentCount() external view returns (uint256) {
        return tournaments.length();
    }

    /**
     * @notice Check if address is a valid tournament
     * @param tournament Address to check
     * @return True if tournament was created by this factory
     */
    function isValidTournament(address tournament) external view returns (bool) {
        return tournaments.contains(tournament);
    }
}

