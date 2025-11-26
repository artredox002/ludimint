// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ReputationNFT
 * @notice ERC-721 contract for minting reputation badges to tournament winners
 * @dev Badges are minted when winners claim prizes
 */
contract ReputationNFT is ERC721URIStorage, Ownable {
    // ============ State Variables ============

    /// @notice Token ID counter
    uint256 private _tokenIdCounter;

    /// @notice Mapping from tournament address to badge metadata URI
    mapping(address => string) public tournamentBadgeURIs;

    /// @notice Mapping from token ID to tournament address
    mapping(uint256 => address) public tokenToTournament;

    /// @notice Mapping from tournament address to token ID (for tracking)
    mapping(address => mapping(address => uint256)) public tournamentWinnerTokens;

    /// @notice Base URI for token metadata
    string private _baseTokenURI;

    // ============ Events ============

    event BadgeMinted(
        address indexed winner,
        address indexed tournament,
        uint256 indexed tokenId,
        string tokenURI
    );

    event TournamentBadgeURIUpdated(address indexed tournament, string uri);
    event BaseURIUpdated(string newBaseURI);

    // ============ Constructor ============

    constructor(
        address _owner,
        string memory name,
        string memory symbol,
        string memory baseTokenURI
    ) ERC721(name, symbol) Ownable(_owner) {
        _baseTokenURI = baseTokenURI;
    }

    // ============ Public Functions ============

    /**
     * @notice Mint a badge to a tournament winner
     * @dev Can only be called by authorized contracts (e.g., Tournament contract)
     * @param winner Address of the winner
     * @param tournament Address of the tournament
     * @param tokenURI Metadata URI for the badge
     * @return tokenId The minted token ID
     */
    function mintBadge(
        address winner,
        address tournament,
        string memory tokenURI
    ) external onlyOwner returns (uint256) {
        require(winner != address(0), "ReputationNFT: Invalid winner");
        require(tournament != address(0), "ReputationNFT: Invalid tournament");
        require(
            tournamentWinnerTokens[tournament][winner] == 0,
            "ReputationNFT: Badge already minted"
        );

        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;

        _safeMint(winner, tokenId);
        _setTokenURI(tokenId, tokenURI);
        tokenToTournament[tokenId] = tournament;
        tournamentWinnerTokens[tournament][winner] = tokenId;

        emit BadgeMinted(winner, tournament, tokenId, tokenURI);

        return tokenId;
    }

    /**
     * @notice Batch mint badges for multiple winners
     * @param winners Array of winner addresses
     * @param tournament Tournament address
     * @param tokenURIs Array of metadata URIs (must match winners length)
     * @return tokenIds Array of minted token IDs
     */
    function batchMintBadges(
        address[] calldata winners,
        address tournament,
        string[] calldata tokenURIs
    ) external onlyOwner returns (uint256[] memory) {
        require(winners.length == tokenURIs.length, "ReputationNFT: Length mismatch");
        require(tournament != address(0), "ReputationNFT: Invalid tournament");

        uint256[] memory tokenIds = new uint256[](winners.length);

        for (uint256 i = 0; i < winners.length; i++) {
            require(winners[i] != address(0), "ReputationNFT: Invalid winner");
            require(
                tournamentWinnerTokens[tournament][winners[i]] == 0,
                "ReputationNFT: Badge already minted"
            );

            _tokenIdCounter++;
            uint256 tokenId = _tokenIdCounter;

            _safeMint(winners[i], tokenId);
            _setTokenURI(tokenId, tokenURIs[i]);
            tokenToTournament[tokenId] = tournament;
            tournamentWinnerTokens[tournament][winners[i]] = tokenId;

            emit BadgeMinted(winners[i], tournament, tokenId, tokenURIs[i]);

            tokenIds[i] = tokenId;
        }

        return tokenIds;
    }

    // ============ Owner Functions ============

    /**
     * @notice Set base URI for token metadata
     * @param baseURI New base URI
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
        emit BaseURIUpdated(baseURI);
    }

    /**
     * @notice Set badge URI for a specific tournament
     * @param tournament Tournament address
     * @param uri Metadata URI
     */
    function setTournamentBadgeURI(address tournament, string memory uri) external onlyOwner {
        require(tournament != address(0), "ReputationNFT: Invalid tournament");
        tournamentBadgeURIs[tournament] = uri;
        emit TournamentBadgeURIUpdated(tournament, uri);
    }

    // ============ View Functions ============

    /**
     * @notice Get total number of badges minted
     * @return Total supply
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }

    /**
     * @notice Check if winner has a badge for a tournament
     * @param winner Winner address
     * @param tournament Tournament address
     * @return True if badge exists
     */
    function hasBadge(address winner, address tournament) external view returns (bool) {
        return tournamentWinnerTokens[tournament][winner] != 0;
    }

    /**
     * @notice Get badge token ID for a winner in a tournament
     * @param winner Winner address
     * @param tournament Tournament address
     * @return Token ID (0 if not found)
     */
    function getBadgeTokenId(address winner, address tournament) external view returns (uint256) {
        return tournamentWinnerTokens[tournament][winner];
    }

    /**
     * @notice Override base URI
     */
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
}

