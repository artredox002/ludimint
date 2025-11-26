// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

/**
 * @title Tournament
 * @notice Core tournament contract implementing commit-reveal pattern for skill-based competitions
 * @dev Manages tournament lifecycle: Open -> Commit Phase -> Reveal Phase -> Finalized
 * @dev Uses commit-reveal to prevent cheating and ensure fair score submission
 */
contract Tournament is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;
    using EnumerableSet for EnumerableSet.AddressSet;

    // ============ State Variables ============

    /// @notice ERC20 token used for entry fees and prizes
    IERC20 public immutable token;

    /// @notice Entry fee per player (in token units)
    uint256 public immutable entryFee;

    /// @notice Maximum number of players allowed
    uint256 public immutable maxPlayers;

    /// @notice Number of top players to reward (topK)
    uint256 public immutable topK;

    /// @notice Tournament creator/owner
    address public immutable creator;

    /// @notice Timestamp when commit phase ends
    uint256 public immutable commitEndTime;

    /// @notice Timestamp when reveal phase ends
    uint256 public immutable revealEndTime;

    /// @notice Whether tournament has been finalized
    bool public finalized;

    /// @notice Total prize pool accumulated from entry fees
    uint256 public prizePool;

    /// @notice Set of all players who joined
    EnumerableSet.AddressSet private players;

    /// @notice Mapping from player address to their commit hash
    mapping(address => bytes32) public commits;

    /// @notice Mapping from player address to their revealed score
    mapping(address => uint256) public scores;

    /// @notice Mapping from player address to whether they've claimed their prize
    mapping(address => bool) public prizeClaimed;

    /// @notice Mapping from player address to whether they've revealed
    mapping(address => bool) public hasRevealed;

    /// @notice Array of winners (top K players)
    address[] public winners;

    /// @notice Mapping from winner address to prize amount
    mapping(address => uint256) public prizeAmounts;

    // ============ Events ============

    event PlayerJoined(address indexed player, bytes32 indexed commitHash, uint256 entryFee);
    event PlayerRevealed(address indexed player, uint256 score, bytes32 indexed commitHash);
    event TournamentFinalized(address[] winners, uint256[] prizeAmounts);
    event PrizeClaimed(address indexed winner, uint256 amount);
    event EmergencyWithdraw(address indexed to, uint256 amount);

    // ============ Modifiers ============

    /// @notice Ensures tournament is in commit phase
    modifier onlyCommitPhase() {
        require(block.timestamp <= commitEndTime, "Tournament: Commit phase ended");
        require(!finalized, "Tournament: Already finalized");
        _;
    }

    /// @notice Ensures tournament is in reveal phase
    modifier onlyRevealPhase() {
        require(block.timestamp > commitEndTime, "Tournament: Commit phase not ended");
        require(block.timestamp <= revealEndTime, "Tournament: Reveal phase ended");
        require(!finalized, "Tournament: Already finalized");
        _;
    }

    /// @notice Ensures reveal phase has ended
    modifier onlyAfterReveal() {
        require(block.timestamp > revealEndTime, "Tournament: Reveal phase not ended");
        require(!finalized, "Tournament: Already finalized");
        _;
    }

    // ============ Constructor ============

    /**
     * @notice Creates a new tournament
     * @param _token ERC20 token address for entry fees
     * @param _entryFee Entry fee amount in token units
     * @param _maxPlayers Maximum number of players
     * @param _topK Number of top players to reward
     * @param _commitDurationSeconds Duration of commit phase in seconds
     * @param _revealDurationSeconds Duration of reveal phase in seconds
     * @param _creator Tournament creator address
     */
    constructor(
        address _token,
        uint256 _entryFee,
        uint256 _maxPlayers,
        uint256 _topK,
        uint256 _commitDurationSeconds,
        uint256 _revealDurationSeconds,
        address _creator
    ) Ownable(_creator) {
        require(_token != address(0), "Tournament: Invalid token address");
        require(_entryFee > 0, "Tournament: Entry fee must be > 0");
        require(_maxPlayers >= 2, "Tournament: Need at least 2 players");
        require(_topK > 0 && _topK <= _maxPlayers, "Tournament: Invalid topK");
        require(_commitDurationSeconds > 0, "Tournament: Invalid commit duration");
        require(_revealDurationSeconds > 0, "Tournament: Invalid reveal duration");
        require(_creator != address(0), "Tournament: Invalid creator");

        token = IERC20(_token);
        entryFee = _entryFee;
        maxPlayers = _maxPlayers;
        topK = _topK;
        creator = _creator;

        uint256 startTime = block.timestamp;
        commitEndTime = startTime + _commitDurationSeconds;
        revealEndTime = commitEndTime + _revealDurationSeconds;
    }

    // ============ Public Functions ============

    /**
     * @notice Join tournament by submitting commit hash and paying entry fee
     * @dev Commit hash should be keccak256(abi.encodePacked(playerAddress, tournamentId, secret, score))
     * @param commitHash The hash of the player's secret and score
     */
    function join(bytes32 commitHash) external nonReentrant onlyCommitPhase {
        require(commitHash != bytes32(0), "Tournament: Invalid commit hash");
        require(!players.contains(msg.sender), "Tournament: Already joined");
        require(players.length() < maxPlayers, "Tournament: Tournament full");

        // Transfer entry fee from player
        token.safeTransferFrom(msg.sender, address(this), entryFee);

        // Record player and commit
        players.add(msg.sender);
        commits[msg.sender] = commitHash;
        prizePool += entryFee;

        emit PlayerJoined(msg.sender, commitHash, entryFee);
    }

    /**
     * @notice Reveal secret and score during reveal phase
     * @dev Verifies commit hash matches the revealed data
     * @param secret The secret used to generate the commit hash
     * @param score The player's score
     */
    function reveal(string calldata secret, uint256 score) external nonReentrant onlyRevealPhase {
        require(players.contains(msg.sender), "Tournament: Not a player");
        require(!hasRevealed[msg.sender], "Tournament: Already revealed");
        require(commits[msg.sender] != bytes32(0), "Tournament: No commit found");

        // Recompute commit hash: keccak256(abi.encodePacked(msg.sender, uint256(uint160(address(this))), secret, score))
        // This matches frontend encoding: address, tournamentId (as uint256), secret, score
        bytes32 computedHash = keccak256(
            abi.encodePacked(msg.sender, uint256(uint160(address(this))), secret, score)
        );

        // Verify commit matches
        require(computedHash == commits[msg.sender], "Tournament: Commit mismatch");

        // Record score
        scores[msg.sender] = score;
        hasRevealed[msg.sender] = true;

        emit PlayerRevealed(msg.sender, score, commits[msg.sender]);
    }

    /**
     * @notice Finalize tournament and determine winners
     * @dev Can be called by anyone after reveal phase ends
     * @dev Calculates top K players and their prize amounts
     */
    function finalize() external nonReentrant onlyAfterReveal {
        require(!finalized, "Tournament: Already finalized");

        finalized = true;

        uint256 playerCount = players.length();
        if (playerCount == 0) {
            emit TournamentFinalized(new address[](0), new uint256[](0));
            return;
        }

        // Get all players who revealed
        address[] memory revealedPlayers = new address[](playerCount);
        uint256[] memory revealedScores = new uint256[](playerCount);
        uint256 revealedCount = 0;

        for (uint256 i = 0; i < playerCount; i++) {
            address player = players.at(i);
            if (hasRevealed[player]) {
                revealedPlayers[revealedCount] = player;
                revealedScores[revealedCount] = scores[player];
                revealedCount++;
            }
        }

        if (revealedCount == 0) {
            emit TournamentFinalized(new address[](0), new uint256[](0));
            return;
        }

        // Sort players by score (bubble sort for small arrays, gas efficient for tournaments)
        for (uint256 i = 0; i < revealedCount - 1; i++) {
            for (uint256 j = 0; j < revealedCount - i - 1; j++) {
                if (revealedScores[j] < revealedScores[j + 1]) {
                    // Swap scores
                    uint256 tempScore = revealedScores[j];
                    revealedScores[j] = revealedScores[j + 1];
                    revealedScores[j + 1] = tempScore;

                    // Swap addresses
                    address tempAddr = revealedPlayers[j];
                    revealedPlayers[j] = revealedPlayers[j + 1];
                    revealedPlayers[j + 1] = tempAddr;
                }
            }
        }

        // Determine winners (top K)
        uint256 winnerCount = revealedCount < topK ? revealedCount : topK;
        winners = new address[](winnerCount);
        uint256[] memory amounts = new uint256[](winnerCount);

        if (winnerCount > 0 && prizePool > 0) {
            // Split prize pool equally among winners
            uint256 prizePerWinner = prizePool / winnerCount;
            uint256 remainder = prizePool % winnerCount; // Handle rounding

            for (uint256 i = 0; i < winnerCount; i++) {
                winners[i] = revealedPlayers[i];
                prizeAmounts[revealedPlayers[i]] = prizePerWinner + (i == 0 ? remainder : 0);
                amounts[i] = prizeAmounts[revealedPlayers[i]];
            }
        }

        emit TournamentFinalized(winners, amounts);
    }

    /**
     * @notice Claim prize by a winner
     * @dev Winners must call this to receive their prize (pull pattern for gas optimization)
     */
    function claimPrize() external nonReentrant {
        require(finalized, "Tournament: Not finalized");
        require(prizeAmounts[msg.sender] > 0, "Tournament: Not a winner or already claimed");
        require(!prizeClaimed[msg.sender], "Tournament: Prize already claimed");

        uint256 amount = prizeAmounts[msg.sender];
        prizeClaimed[msg.sender] = true;

        token.safeTransfer(msg.sender, amount);

        emit PrizeClaimed(msg.sender, amount);
    }

    /**
     * @notice Emergency withdraw function (owner only)
     * @dev Only for hackathon/demo purposes - should have timelock in production
     * @param to Address to withdraw to
     */
    function emergencyWithdraw(address to) external onlyOwner {
        require(to != address(0), "Tournament: Invalid address");
        require(!finalized || block.timestamp > revealEndTime + 30 days, "Tournament: Too early for emergency");

        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "Tournament: No balance");

        token.safeTransfer(to, balance);

        emit EmergencyWithdraw(to, balance);
    }

    // ============ View Functions ============

    /**
     * @notice Get all player addresses
     * @return Array of player addresses
     */
    function getPlayers() external view returns (address[] memory) {
        return players.values();
    }

    /**
     * @notice Get player count
     * @return Number of players
     */
    function getPlayerCount() external view returns (uint256) {
        return players.length();
    }

    /**
     * @notice Check if address is a player
     * @param player Address to check
     * @return True if player has joined
     */
    function isPlayer(address player) external view returns (bool) {
        return players.contains(player);
    }

    /**
     * @notice Get tournament status
     * @return phase Current phase (0=Open, 1=Commit, 2=Reveal, 3=Finalized)
     * @return playerCount Current number of players
     * @return isFull Whether tournament is full
     */
    function getStatus() external view returns (uint8 phase, uint256 playerCount, bool isFull) {
        playerCount = players.length();
        isFull = playerCount >= maxPlayers;

        if (finalized) {
            phase = 3; // Finalized
        } else if (block.timestamp > revealEndTime) {
            phase = 3; // Can be finalized
        } else if (block.timestamp > commitEndTime) {
            phase = 2; // Reveal phase
        } else {
            phase = 1; // Commit phase
        }
    }
}

