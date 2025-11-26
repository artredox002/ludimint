import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { getAddress, parseEther, encodePacked, keccak256, Address } from "viem";

describe("Tournament System", function () {
  // Deploy fixtures
  async function deployFixture() {
    const [owner, player1, player2, player3] = await hre.viem.getWalletClients();

    // Deploy mock ERC20 token
    const token = await hre.viem.deployContract("ERC20Mock", [
      "Test Token",
      "TEST",
      parseEther("1000000"),
    ]);

    // Mint tokens to players
    await token.write.transfer([player1.account.address, parseEther("1000")]);
    await token.write.transfer([player2.account.address, parseEther("1000")]);
    await token.write.transfer([player3.account.address, parseEther("1000")]);

    // Deploy ReputationNFT
    const reputationNFT = await hre.viem.deployContract("ReputationNFT", [
      owner.account.address,
      "LUDIMINT Badges",
      "LUDI",
      "https://ipfs.io/ipfs/",
    ]);

    // Deploy TournamentFactory
    const factory = await hre.viem.deployContract("TournamentFactory", [
      owner.account.address,
    ]);

    const publicClient = await hre.viem.getPublicClient();

    return {
      token,
      tokenAddress: token.address,
      factory,
      reputationNFT,
      owner,
      player1,
      player2,
      player3,
      publicClient,
    };
  }

  async function createTournament() {
    const { token, tokenAddress, factory, player1, player2, player3, publicClient } =
      await loadFixture(deployFixture);

    const entryFee = parseEther("1");
    const maxPlayers = 10n;
    const topK = 3n;
    const commitDuration = 3600n; // 1 hour
    const revealDuration = 3600n; // 1 hour

    const hash = await factory.write.createTournament([
      tokenAddress,
      entryFee,
      maxPlayers,
      topK,
      commitDuration,
      revealDuration,
    ]);

    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    // Get tournament address from event
    const logs = await publicClient.getLogs({
      address: factory.address,
      event: {
        type: "event",
        name: "TournamentCreated",
        inputs: [
          { type: "address", indexed: true, name: "creator" },
          { type: "address", indexed: true, name: "tournament" },
          { type: "address", indexed: false, name: "token" },
          { type: "uint256", indexed: false, name: "entryFee" },
          { type: "uint256", indexed: false, name: "maxPlayers" },
          { type: "uint256", indexed: false, name: "topK" },
        ],
      },
      fromBlock: receipt.blockNumber,
      toBlock: receipt.blockNumber,
    });

    const tournamentAddress = logs[0].args.tournament as Address;

    const tournament = await hre.viem.getContractAt("Tournament", tournamentAddress);

    return {
      tournament,
      tournamentAddress,
      token,
      tokenAddress,
      factory,
      entryFee,
      maxPlayers,
      topK,
      player1,
      player2,
      player3,
      publicClient,
    };
  }

  describe("TournamentFactory", function () {
    it("Should deploy factory", async function () {
      const { factory } = await loadFixture(deployFixture);
      expect(factory.address).to.be.a("string");
      expect(factory.address).to.match(/^0x[a-fA-F0-9]{40}$/);
    });

    it("Should create tournament", async function () {
      const { factory, tokenAddress, publicClient } = await loadFixture(deployFixture);

      const hash = await factory.write.createTournament([
        tokenAddress,
        parseEther("1"),
        10n,
        3n,
        3600n,
        3600n,
      ]);

      await publicClient.waitForTransactionReceipt({ hash });

      const tournaments = await factory.read.getTournaments();
      expect(tournaments.length).to.equal(1);
    });

    it("Should reject invalid parameters", async function () {
      const { factory, tokenAddress } = await loadFixture(deployFixture);

      await expect(
        factory.write.createTournament([
          tokenAddress,
          parseEther("0.001"), // Below minimum
          10n,
          3n,
          3600n,
          3600n,
        ])
      ).to.be.rejectedWith("Factory: Entry fee too low");
    });

    it("Should reject zero address token", async function () {
      const { factory } = await loadFixture(deployFixture);

      await expect(
        factory.write.createTournament([
          "0x0000000000000000000000000000000000000000" as Address,
          parseEther("1"),
          10n,
          3n,
          3600n,
          3600n,
        ])
      ).to.be.rejected; // Tournament contract will reject with "Invalid token address"
    });

    it("Should allow owner to update parameters", async function () {
      const { factory, owner } = await loadFixture(deployFixture);

      const hash = await factory.write.setMinEntryFee([parseEther("0.1")], {
        account: owner.account,
      });
      await expect(hash).to.be.a("string");

      expect(await factory.read.minEntryFee()).to.equal(parseEther("0.1"));
    });
  });

  describe("Tournament", function () {
    it("Should allow players to join", async function () {
      const {
        tournament,
        tournamentAddress,
        token,
        tokenAddress,
        entryFee,
        player1,
        publicClient,
      } = await loadFixture(createTournament);

      // Approve and join
      await token.write.approve([tournamentAddress, entryFee], {
        account: player1.account,
      });

      // Compute commit hash: keccak256(abi.encodePacked(playerAddress, uint256(tournamentAddress), secret, score))
      const secret = "mySecret123";
      const score = 100n;
      const packed = encodePacked(
        ["address", "uint256", "string", "uint256"],
        [player1.account.address, BigInt(tournamentAddress), secret, score]
      );
      const commitHash = keccak256(packed);

      const hash = await tournament.write.join([commitHash], {
        account: player1.account,
      });
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      expect(receipt.status).to.equal("success");
      expect(await tournament.read.isPlayer([player1.account.address])).to.be.true;
    });

    it("Should prevent duplicate joins", async function () {
      const {
        tournament,
        tournamentAddress,
        token,
        tokenAddress,
        entryFee,
        player1,
      } = await loadFixture(createTournament);

      await token.write.approve([tournamentAddress, entryFee], {
        account: player1.account,
      });
      const secret = "secret1";
      const score = 100n;
      const packed = encodePacked(
        ["address", "uint256", "string", "uint256"],
        [player1.account.address, BigInt(tournamentAddress), secret, score]
      );
      const commitHash = keccak256(packed);

      await tournament.write.join([commitHash], { account: player1.account });

      await expect(
        tournament.write.join([commitHash], { account: player1.account })
      ).to.be.rejectedWith("Tournament: Already joined");
    });

    it("Should prevent joining after commit phase", async function () {
      const {
        tournament,
        tournamentAddress,
        token,
        tokenAddress,
        entryFee,
        player1,
      } = await loadFixture(createTournament);

      // Move past commit phase
      await time.increase(3601n);

      await token.write.approve([tournamentAddress, entryFee], {
        account: player1.account,
      });
      const commitHash = keccak256(new TextEncoder().encode("secret1"));

      await expect(
        tournament.write.join([commitHash], { account: player1.account })
      ).to.be.rejectedWith("Tournament: Commit phase ended");
    });

    it("Should allow reveal during reveal phase", async function () {
      const {
        tournament,
        tournamentAddress,
        token,
        tokenAddress,
        entryFee,
        player1,
        publicClient,
      } = await loadFixture(createTournament);

      // Join
      await token.write.approve([tournamentAddress, entryFee], {
        account: player1.account,
      });
      const secret = "mySecret123";
      const score = 100n;
      const packed = encodePacked(
        ["address", "uint256", "string", "uint256"],
        [player1.account.address, BigInt(tournamentAddress), secret, score]
      );
      const commitHash = keccak256(packed);

      await tournament.write.join([commitHash], { account: player1.account });

      // Move to reveal phase
      await time.increase(3601n);

      // Reveal
      const hash = await tournament.write.reveal([secret, score], {
        account: player1.account,
      });
      await publicClient.waitForTransactionReceipt({ hash });

      expect(await tournament.read.scores([player1.account.address])).to.equal(score);
    });

    it("Should reject invalid reveal", async function () {
      const {
        tournament,
        tournamentAddress,
        token,
        tokenAddress,
        entryFee,
        player1,
      } = await loadFixture(createTournament);

      await token.write.approve([tournamentAddress, entryFee], {
        account: player1.account,
      });
      const secret = "secret1";
      const score = 100n;
      const packed = encodePacked(
        ["address", "uint256", "string", "uint256"],
        [player1.account.address, BigInt(tournamentAddress), secret, score]
      );
      const commitHash = keccak256(packed);
      await tournament.write.join([commitHash], { account: player1.account });

      await time.increase(3601n);

      await expect(
        tournament.write.reveal(["wrongSecret", score], {
          account: player1.account,
        })
      ).to.be.rejectedWith("Tournament: Commit mismatch");
    });

    it("Should finalize and determine winners", async function () {
      const {
        tournament,
        tournamentAddress,
        token,
        tokenAddress,
        entryFee,
        player1,
        player2,
        player3,
        publicClient,
      } = await loadFixture(createTournament);

      // Multiple players join and reveal
      const players = [player1, player2, player3];
      const scores = [300n, 200n, 100n];

      for (let i = 0; i < players.length; i++) {
        await token.write.approve([tournamentAddress, entryFee], {
          account: players[i].account,
        });
        const secret = `secret${i}`;
        const packed = encodePacked(
          ["address", "uint256", "string", "uint256"],
          [players[i].account.address, BigInt(tournamentAddress), secret, scores[i]]
        );
        const commitHash = keccak256(packed);
        await tournament.write.join([commitHash], { account: players[i].account });
      }

      // Move to reveal phase
      await time.increase(3601n);

      // Reveal
      for (let i = 0; i < players.length; i++) {
        await tournament.write.reveal([`secret${i}`, scores[i]], {
          account: players[i].account,
        });
      }

      // Move past reveal phase
      await time.increase(3601n);

      // Finalize
      const hash = await tournament.write.finalize();
      await publicClient.waitForTransactionReceipt({ hash });

      expect(await tournament.read.finalized()).to.be.true;
      expect(await tournament.read.winners([0n])).to.equal(
        getAddress(player1.account.address)
      ); // Highest score
      expect(await tournament.read.winners([1n])).to.equal(
        getAddress(player2.account.address)
      );
      expect(await tournament.read.winners([2n])).to.equal(
        getAddress(player3.account.address)
      );
    });

    it("Should allow winners to claim prizes", async function () {
      const {
        tournament,
        tournamentAddress,
        token,
        tokenAddress,
        entryFee,
        player1,
        publicClient,
      } = await loadFixture(createTournament);

      // Setup: join, reveal, finalize
      await token.write.approve([tournamentAddress, entryFee], {
        account: player1.account,
      });
      const secret = "secret1";
      const score = 100n;
      const packed = encodePacked(
        ["address", "uint256", "string", "uint256"],
        [player1.account.address, BigInt(tournamentAddress), secret, score]
      );
      const commitHash = keccak256(packed);

      await tournament.write.join([commitHash], { account: player1.account });
      await time.increase(3601n);
      await tournament.write.reveal([secret, score], { account: player1.account });
      await time.increase(3601n);
      await tournament.write.finalize();

      // Claim prize
      const balanceBefore = await token.read.balanceOf([player1.account.address]);
      const hash = await tournament.write.claimPrize({ account: player1.account });
      await publicClient.waitForTransactionReceipt({ hash });

      const balanceAfter = await token.read.balanceOf([player1.account.address]);
      expect(balanceAfter > balanceBefore).to.be.true;
    });

    it("Should prevent non-winners from claiming", async function () {
      const {
        tournament,
        tournamentAddress,
        token,
        tokenAddress,
        entryFee,
        player1,
        player2,
      } = await loadFixture(createTournament);

      // Only player1 joins and wins
      await token.write.approve([tournamentAddress, entryFee], {
        account: player1.account,
      });
      const secret = "secret1";
      const score = 100n;
      const packed = encodePacked(
        ["address", "uint256", "string", "uint256"],
        [player1.account.address, BigInt(tournamentAddress), secret, score]
      );
      const commitHash = keccak256(packed);

      await tournament.write.join([commitHash], { account: player1.account });
      await time.increase(3601n);
      await tournament.write.reveal([secret, score], { account: player1.account });
      await time.increase(3601n);
      await tournament.write.finalize();

      // Player2 tries to claim (not a winner)
      await expect(
        tournament.write.claimPrize({ account: player2.account })
      ).to.be.rejectedWith("Tournament: Not a winner or already claimed");
    });

    it("Should handle tournament with no players", async function () {
      const { tournament, publicClient } = await loadFixture(createTournament);

      // Move past reveal phase
      await time.increase(7201n);

      // Finalize empty tournament
      const hash = await tournament.write.finalize();
      await publicClient.waitForTransactionReceipt({ hash });

      expect(await tournament.read.finalized()).to.be.true;
    });

    it("Should enforce max players limit", async function () {
      const {
        tournament,
        tournamentAddress,
        token,
        entryFee,
        player1,
        player2,
        player3,
      } = await loadFixture(createTournament);

      // Get additional signers
      const allSigners = await hre.viem.getWalletClients();
      // Use unique players - skip first 3 (player1, player2, player3) and use next 7
      const uniquePlayers = allSigners.slice(0, 10).filter((_, i) => i >= 0);

      // Mint tokens to all players
      for (const player of uniquePlayers) {
        await token.write.transfer([player.account.address, parseEther("1000")]);
      }

      // Fill tournament to max (10 players) using unique players
      for (let i = 0; i < 10 && uniquePlayers[i]; i++) {
        const player = uniquePlayers[i];
        await token.write.approve([tournamentAddress, entryFee], {
          account: player.account,
        });
        const secret = `secret${i}`;
        const score = 100n;
        const packed = encodePacked(
          ["address", "uint256", "string", "uint256"],
          [player.account.address, BigInt(tournamentAddress), secret, score]
        );
        const commitHash = keccak256(packed);
        await tournament.write.join([commitHash], { account: player.account });
      }

      // Try to join when full - use player at index 10 (should exist in Hardhat)
      const extraPlayer = allSigners[10] || allSigners[9];
      await token.write.transfer([extraPlayer.account.address, parseEther("1000")]);
      await token.write.approve([tournamentAddress, entryFee], {
        account: extraPlayer.account,
      });
      const secret = "secret11";
      const score = 100n;
      const packed = encodePacked(
        ["address", "uint256", "string", "uint256"],
        [extraPlayer.account.address, BigInt(tournamentAddress), secret, score]
      );
      const commitHash = keccak256(packed);

      await expect(
        tournament.write.join([commitHash], { account: extraPlayer.account })
      ).to.be.rejectedWith("Tournament: Tournament full");
    });
  });

  describe("ReputationNFT", function () {
    it("Should mint badge to winner", async function () {
      const { reputationNFT, owner, player1, publicClient } =
        await loadFixture(deployFixture);
      
      // Create a mock tournament address for testing
      const tournamentAddress = "0x1234567890123456789012345678901234567890" as Address;

      const hash = await reputationNFT.write.mintBadge(
        [
          player1.account.address,
          tournamentAddress,
          "ipfs://QmTest123",
        ],
        { account: owner.account }
      );

      await publicClient.waitForTransactionReceipt({ hash });

      expect(await reputationNFT.read.ownerOf([1n])).to.equal(
        getAddress(player1.account.address)
      );
    });

    it("Should prevent duplicate badges", async function () {
      const { reputationNFT, owner, player1 } =
        await loadFixture(deployFixture);
      
      const tournamentAddress = "0x1234567890123456789012345678901234567890" as Address;

      await reputationNFT.write.mintBadge(
        [player1.account.address, tournamentAddress, "ipfs://QmTest123"],
        { account: owner.account }
      );

      await expect(
        reputationNFT.write.mintBadge(
          [player1.account.address, tournamentAddress, "ipfs://QmTest456"],
          { account: owner.account }
        )
      ).to.be.rejectedWith("ReputationNFT: Badge already minted");
    });

    it("Should allow batch minting", async function () {
      const {
        reputationNFT,
        owner,
        player1,
        player2,
        player3,
        publicClient,
      } = await loadFixture(deployFixture);
      
      const tournamentAddress = "0x1234567890123456789012345678901234567890" as Address;

      const winners = [
        player1.account.address,
        player2.account.address,
        player3.account.address,
      ];
      const uris = ["ipfs://QmTest1", "ipfs://QmTest2", "ipfs://QmTest3"];

      const hash = await reputationNFT.write.batchMintBadges(
        [winners, tournamentAddress, uris],
        { account: owner.account }
      );

      await publicClient.waitForTransactionReceipt({ hash });

      expect(await reputationNFT.read.ownerOf([1n])).to.equal(
        getAddress(player1.account.address)
      );
      expect(await reputationNFT.read.ownerOf([2n])).to.equal(
        getAddress(player2.account.address)
      );
      expect(await reputationNFT.read.ownerOf([3n])).to.equal(
        getAddress(player3.account.address)
      );
    });
  });
});
