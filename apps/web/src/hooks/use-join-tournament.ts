/**
 * Hook for joining a tournament
 * Handles token approval and join transaction
 */

import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt, useAccount, usePublicClient } from "wagmi";
import { toast } from "sonner";
import { formatEther } from "viem";
import { tournamentABI, erc20ABI } from "@/lib/contracts/instances";
import { getFriendlyErrorMessage } from "@/lib/errors";

export interface JoinTournamentParams {
  tournamentAddress: `0x${string}`;
  commitHash: `0x${string}`;
  tokenAddress: `0x${string}`;
  entryFee: bigint;
}

export function useJoinTournament() {
  const [isJoining, setIsJoining] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [approvalTxHash, setApprovalTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [justApproved, setJustApproved] = useState(false);
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });
  const { isLoading: isApprovalConfirming, isSuccess: isApprovalSuccess } = useWaitForTransactionReceipt({ hash: approvalTxHash });

  const joinTournament = async (params: JoinTournamentParams) => {
    if (!address) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!publicClient) {
      toast.error("Unable to connect to the network");
      return;
    }

    if (!params.tokenAddress || !params.entryFee || params.entryFee <= 0n) {
      toast.error("Invalid tournament token configuration");
      return;
    }

    // Validate commit hash format
    if (!params.commitHash || !params.commitHash.startsWith('0x') || params.commitHash.length !== 66) {
      toast.error("Invalid commit hash format. Please play the game again to generate a new commit hash.");
      console.error('[Join Tournament] Invalid commit hash:', params.commitHash);
      return;
    }
    
    // Normalize commit hash
    const normalizedCommitHash = params.commitHash.toLowerCase() as `0x${string}`;

    setIsJoining(true);
    setTxHash(undefined);
    setApprovalTxHash(undefined);

    try {
      // Quick sanity-check: ensure the token contract exists on this chain.
      try {
        const tokenBytecode = await publicClient.getBytecode({ address: params.tokenAddress });
        if (!tokenBytecode || tokenBytecode === "0x") {
          toast.error("Tournament token is not deployed on this network. Please recreate the tournament with a valid ERC20 token.");
          setIsJoining(false);
          return;
        }
      } catch (tokenCodeError) {
        console.warn("[Join Tournament] Could not verify token bytecode:", tokenCodeError);
        // Continue anyway – if the token truly doesn't exist the transaction will revert,
        // but if this was a transient RPC issue there's no need to block the user here.
      }

      // Pre-validate tournament state before joining
      try {
        const [isPlayer, playerCount, maxPlayers, finalized, commitEndTime] = await Promise.all([
          publicClient.readContract({
            address: params.tournamentAddress,
            abi: tournamentABI,
            functionName: "isPlayer",
            args: [address],
          }),
          publicClient.readContract({
            address: params.tournamentAddress,
            abi: tournamentABI,
            functionName: "getPlayerCount",
          }),
          publicClient.readContract({
            address: params.tournamentAddress,
            abi: tournamentABI,
            functionName: "maxPlayers",
          }),
          publicClient.readContract({
            address: params.tournamentAddress,
            abi: tournamentABI,
            functionName: "finalized",
          }),
          publicClient.readContract({
            address: params.tournamentAddress,
            abi: tournamentABI,
            functionName: "commitEndTime",
          }),
        ])

        if (isPlayer) {
          toast.error("You have already joined this tournament");
          setIsJoining(false);
          return;
        }

        if (finalized) {
          toast.error("Tournament has already been finalized");
          setIsJoining(false);
          return;
        }

        const now = BigInt(Math.floor(Date.now() / 1000));
        if (now > commitEndTime) {
          toast.error("Commit phase has ended. You can no longer join this tournament.");
          setIsJoining(false);
          return;
        }

        if (playerCount >= maxPlayers) {
          toast.error("Tournament is already full");
          setIsJoining(false);
          return;
        }
      } catch (validationError) {
        console.warn("Could not validate tournament state:", validationError);
        // Continue anyway, let the contract revert with a clearer message
      }

      // Check token balance (non-blocking - if it fails, continue anyway)
      try {
        const balance = await publicClient.readContract({
          address: params.tokenAddress,
          abi: erc20ABI,
          functionName: "balanceOf",
          args: [address],
        }) as bigint;

        if (balance < params.entryFee) {
          toast.error(`Insufficient balance. You need ${formatEther(params.entryFee)} tokens but have ${formatEther(balance)}`);
          setIsJoining(false);
          return;
        }
      } catch (balanceError) {
        // Non-blocking: if balance check fails, continue anyway
        // The transaction will fail with a clearer error if balance is insufficient
        // Silently continue - these warnings are expected for some token contracts
      }

      // Check if we have a pending or confirmed approval transaction
      // If approval is already confirmed, try to verify allowance (non-blocking)
      if (approvalTxHash && isApprovalSuccess) {
        console.log('[Join Tournament] Approval already confirmed, checking allowance...');
        // Wait a bit for state to be fully updated
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Try to verify allowance was actually set (non-blocking)
        try {
          const confirmedAllowance = await publicClient.readContract({
            address: params.tokenAddress,
            abi: erc20ABI,
            functionName: "allowance",
            args: [address, params.tournamentAddress],
          }) as bigint;
          
          if (confirmedAllowance < params.entryFee) {
            toast.error("Approval confirmed but allowance insufficient. Please approve again.");
            console.error('[Join Tournament] Confirmed approval but insufficient allowance:', {
              allowance: confirmedAllowance.toString(),
              required: params.entryFee.toString(),
            });
            setIsJoining(false);
            return;
          }
          
          console.log('[Join Tournament] Allowance verified after confirmed approval:', confirmedAllowance.toString());
          setJustApproved(true); // Mark as approved so we skip the final check
        } catch (allowanceError) {
          // If we can't read allowance, proceed anyway since approval succeeded
          const errorMsg = allowanceError instanceof Error ? allowanceError.message : String(allowanceError);
          if (errorMsg.includes("returned no data") || errorMsg.includes("not a contract")) {
            console.warn('[Join Tournament] Cannot read allowance (RPC/contract issue), but approval succeeded. Proceeding with join.');
          } else {
            console.warn('[Join Tournament] Could not verify allowance after confirmed approval:', allowanceError);
          }
          // Continue anyway - the transaction will fail if allowance is insufficient
          setJustApproved(true); // Mark as approved so we proceed
        }
      } else {
        // Check current allowance (non-blocking - if it fails, we'll approve anyway)
        let allowance: bigint = 0n
        try {
          const allowanceResult = await publicClient.readContract({
            address: params.tokenAddress,
            abi: erc20ABI,
            functionName: "allowance",
            args: [address, params.tournamentAddress],
          })
          allowance = (allowanceResult as bigint) ?? 0n
          console.log('[Join Tournament] Current allowance:', allowance.toString(), 'Required:', params.entryFee.toString())
        } catch (allowanceError) {
          console.warn('[Join Tournament] Could not check allowance, will approve:', allowanceError);
          // If allowance check fails, assume we need to approve
          allowance = 0n
        }

        // Approve max uint256 to avoid allowance issues - this is a common pattern
        // Users can revoke approval later if needed
        const maxApproval = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")

        if (allowance < params.entryFee) {
          toast.info("Approving token spending in your wallet...");
          try {
            console.log('[Join Tournament] Approving max amount for tournament:', {
              tournamentAddress: params.tournamentAddress,
              entryFee: params.entryFee.toString(),
              maxApproval: maxApproval.toString(),
            })
            
            // Try to approve max uint256 first
            const approveHash = await writeContractAsync({
              address: params.tokenAddress,
              abi: erc20ABI,
              functionName: "approve",
              args: [params.tournamentAddress, maxApproval],
            });
            
            if (!approveHash) {
              toast.error("Failed to submit approval transaction. Please try again.");
              setIsJoining(false);
              return;
            }
            
            setApprovalTxHash(approveHash);
            setJustApproved(true);
            toast.info("Waiting for approval confirmation...");
            
            const approvalReceipt = await publicClient.waitForTransactionReceipt({ hash: approveHash });
            
            if (!approvalReceipt || approvalReceipt.status === "reverted") {
              toast.error("Approval transaction failed or was reverted");
              setJustApproved(false);
              setIsJoining(false);
              return;
            }
            
            console.log('[Join Tournament] Approval receipt:', {
              status: approvalReceipt.status,
              blockNumber: approvalReceipt.blockNumber,
              transactionHash: approvalReceipt.transactionHash,
            });
            
            toast.success("Approval confirmed! Verifying allowance...");
            
            // Wait for an additional block to ensure state is updated
            try {
              const currentBlock = await publicClient.getBlockNumber();
              console.log('[Join Tournament] Current block:', currentBlock);
              // Wait for next block - use watchBlockNumber instead
              await new Promise<void>((resolve) => {
                const unwatch = publicClient.watchBlockNumber({
                  onBlockNumber: (blockNumber) => {
                    if (blockNumber >= currentBlock + 1n) {
                      unwatch();
                      resolve();
                    }
                  },
                });
                // Timeout after 10 seconds
                setTimeout(() => {
                  unwatch();
                  resolve();
                }, 10000);
              });
              console.log('[Join Tournament] Waited for next block');
            } catch (blockWaitError) {
              console.warn('[Join Tournament] Could not wait for next block:', blockWaitError);
              // Continue anyway
            }
            
            // Try to verify allowance was actually set before proceeding
            // If we can't read allowance (RPC/contract issues), we'll proceed anyway since approval succeeded
            // The join transaction will fail naturally if allowance is really insufficient
            let verifiedAllowance = false;
            let allowanceReadFailed = false;
            const maxAllowanceChecks = 3; // Reduced attempts since RPC issues are persistent
            
            for (let checkAttempt = 1; checkAttempt <= maxAllowanceChecks; checkAttempt++) {
              try {
                console.log(`[Join Tournament] Verifying allowance (attempt ${checkAttempt}/${maxAllowanceChecks})...`);
                const currentAllowance = await publicClient.readContract({
                  address: params.tokenAddress,
                  abi: erc20ABI,
                  functionName: "allowance",
                  args: [address, params.tournamentAddress],
                }) as bigint;
                
                console.log('[Join Tournament] Current allowance:', currentAllowance.toString(), 'Required:', params.entryFee.toString());
                
                if (currentAllowance >= params.entryFee) {
                  verifiedAllowance = true;
                  console.log('[Join Tournament] Allowance verified successfully!');
                  toast.success("Allowance verified! Proceeding to join...");
                  break;
                } else {
                  // We successfully read the allowance and it's insufficient
                  console.warn(`[Join Tournament] Allowance insufficient (${currentAllowance.toString()} < ${params.entryFee.toString()}), attempt ${checkAttempt}/${maxAllowanceChecks}`);
                  if (checkAttempt < maxAllowanceChecks) {
                    // Wait before retrying - maybe it needs more time
                    await new Promise(resolve => setTimeout(resolve, 3000));
                  } else {
                    // Final attempt failed - allowance is truly insufficient
                    toast.error(`Token allowance insufficient: ${formatEther(currentAllowance)} < ${formatEther(params.entryFee)}. Please approve again.`);
                    console.error('[Join Tournament] Allowance insufficient after all attempts');
                    setIsJoining(false);
                    return;
                  }
                }
              } catch (allowanceCheckError) {
                // Allowance read failed - could be RPC issue, contract issue, etc.
                console.warn(`[Join Tournament] Allowance check failed (attempt ${checkAttempt}/${maxAllowanceChecks}):`, allowanceCheckError);
                allowanceReadFailed = true;
                
                // If this is a persistent read failure (not just timing), don't retry too much
                const errorMsg = allowanceCheckError instanceof Error ? allowanceCheckError.message : String(allowanceCheckError);
                if (errorMsg.includes("returned no data") || errorMsg.includes("not a contract")) {
                  // RPC/contract read issue - don't block, proceed with join
                  console.warn('[Join Tournament] Cannot read allowance (RPC/contract issue), but approval succeeded. Proceeding with join - transaction will fail if allowance is insufficient.');
                  break;
                }
                
                if (checkAttempt < maxAllowanceChecks) {
                  // Wait before retrying for transient errors
                  await new Promise(resolve => setTimeout(resolve, 2000));
                }
              }
            }
            
            // Only block if we successfully read allowance and it was insufficient
            // If we couldn't read it at all, proceed anyway (approval succeeded, join will fail naturally if needed)
            if (!verifiedAllowance && !allowanceReadFailed) {
              // This shouldn't happen, but handle it
              console.warn('[Join Tournament] Could not verify allowance, but approval succeeded. Proceeding with join transaction.');
              toast.info("Proceeding with join transaction. If it fails, please try approving again.");
            } else if (allowanceReadFailed && !verifiedAllowance) {
              // Couldn't read allowance but approval succeeded - proceed anyway
              console.warn('[Join Tournament] Could not read allowance due to RPC/contract issues, but approval transaction succeeded. Proceeding with join.');
              toast.info("Approval confirmed. Proceeding with join transaction...");
            }
            
            console.log('[Join Tournament] Approval confirmed, proceeding with join transaction');
          } catch (approvalError) {
            console.error('[Join Tournament] Approval error:', approvalError);
            const errorMsg = getFriendlyErrorMessage(approvalError, "Failed to approve token spending");
            toast.error(errorMsg);
            setIsJoining(false);
            return;
          }
      } else {
        console.log('[Join Tournament] Sufficient allowance already exists:', allowance.toString())
      }
      }

      // Final allowance verification before joining (if we just approved)
      // This is a best-effort check - if it fails due to RPC issues, we proceed anyway
      if (justApproved || approvalTxHash) {
        try {
          const finalAllowance = await publicClient.readContract({
            address: params.tokenAddress,
            abi: erc20ABI,
            functionName: "allowance",
            args: [address, params.tournamentAddress],
          }) as bigint;
          
          if (finalAllowance < params.entryFee) {
            toast.error(`Insufficient allowance: ${formatEther(finalAllowance)} < ${formatEther(params.entryFee)}. Please approve again.`);
            console.error('[Join Tournament] Final allowance check failed:', {
              allowance: finalAllowance.toString(),
              required: params.entryFee.toString(),
            });
            setIsJoining(false);
            return;
          }
          
          console.log('[Join Tournament] Final allowance verified:', finalAllowance.toString());
        } catch (finalCheckError) {
          // If we can't read allowance (RPC/contract issue), proceed anyway
          // The join transaction will fail naturally if allowance is insufficient
          const errorMsg = finalCheckError instanceof Error ? finalCheckError.message : String(finalCheckError);
          if (errorMsg.includes("returned no data") || errorMsg.includes("not a contract")) {
            console.warn('[Join Tournament] Cannot read allowance for final check (RPC/contract issue), but approval succeeded. Proceeding with join.');
          } else {
            console.warn('[Join Tournament] Final allowance check failed, but proceeding:', finalCheckError);
          }
          // Continue anyway - the transaction will fail if allowance is insufficient
        }
      }

      // Always send join transaction (whether approval was needed or not)
      toast.info("Preparing join transaction...");
      
      // Retry mechanism for join transaction (in case of timing issues after approval)
      let joinAttempts = 0;
      const maxJoinAttempts = 3;
      let joinHash: `0x${string}` | undefined = undefined;
      
      while (joinAttempts < maxJoinAttempts && !joinHash) {
        joinAttempts++;
        
        if (joinAttempts > 1) {
          console.log(`[Join Tournament] Retry attempt ${joinAttempts} of ${maxJoinAttempts}`);
          toast.info(`Retrying join transaction (attempt ${joinAttempts}/${maxJoinAttempts})...`);
          // Wait longer between retries
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
        
        // Simulate the join transaction first to catch errors early
        if (address && publicClient) {
          try {
            console.log(`[Join Tournament] Simulating join transaction (attempt ${joinAttempts})...`, {
              tournamentAddress: params.tournamentAddress,
              commitHash: normalizedCommitHash,
              entryFee: params.entryFee.toString(),
            });
            
            const simulationResult = await publicClient.simulateContract({
              account: address,
              address: params.tournamentAddress,
              abi: tournamentABI,
              functionName: "join",
              args: [normalizedCommitHash],
            });
            
            console.log('[Join Tournament] Simulation successful:', simulationResult);
          } catch (simulateError) {
            console.error(`[Join Tournament] Simulation failed (attempt ${joinAttempts}):`, simulateError);
            
            // Check if it's an allowance error specifically
            const errorMsg = getFriendlyErrorMessage(simulateError, "Cannot join tournament");
            const errorString = JSON.stringify(simulateError);
            const errorMessage = simulateError instanceof Error ? simulateError.message : String(simulateError);
            
            const isAllowanceError = errorString.includes("allowance") || 
                                    errorString.includes("SafeERC20") || 
                                    errorString.includes("SafeERC20FailedOperation") ||
                                    errorMessage.includes("allowance") ||
                                    errorMessage.includes("SafeERC20") ||
                                    errorMessage.includes("SafeERC20FailedOperation");
            
            if (isAllowanceError && joinAttempts < maxJoinAttempts) {
              console.warn(`[Join Tournament] Allowance error on attempt ${joinAttempts}, verifying and retrying...`);
              
              // Re-check allowance before retrying (if we can read it)
              try {
                const retryAllowance = await publicClient.readContract({
                  address: params.tokenAddress,
                  abi: erc20ABI,
                  functionName: "allowance",
                  args: [address, params.tournamentAddress],
                }) as bigint;
                
                console.log('[Join Tournament] Allowance on retry:', retryAllowance.toString(), 'Required:', params.entryFee.toString());
                
                if (retryAllowance < params.entryFee) {
                  console.warn('[Join Tournament] Allowance still insufficient, waiting longer...');
                  // Wait longer and check again
                  await new Promise(resolve => setTimeout(resolve, 5000));
                  
                  // Check one more time
                  const finalRetryAllowance = await publicClient.readContract({
                    address: params.tokenAddress,
                    abi: erc20ABI,
                    functionName: "allowance",
                    args: [address, params.tournamentAddress],
                  }) as bigint;
                  
                  if (finalRetryAllowance < params.entryFee) {
                    toast.error("Token allowance not detected. Please approve the token again.");
                    console.error('[Join Tournament] Allowance still insufficient after wait:', {
                      allowance: finalRetryAllowance.toString(),
                      required: params.entryFee.toString(),
                    });
                    setIsJoining(false);
                    return;
                  }
                }
              } catch (allowanceRetryError) {
                // If we can't read allowance (RPC issue), proceed with retry anyway
                // The simulation will fail again if allowance is really insufficient
                const errorMsg = allowanceRetryError instanceof Error ? allowanceRetryError.message : String(allowanceRetryError);
                if (errorMsg.includes("returned no data") || errorMsg.includes("not a contract")) {
                  console.warn('[Join Tournament] Cannot read allowance (RPC issue), but proceeding with retry. Simulation will fail if allowance is insufficient.');
                } else {
                  console.warn('[Join Tournament] Could not check allowance on retry:', allowanceRetryError);
                }
                // Continue with retry - don't block
              }
              
              // Wait before retry
              await new Promise(resolve => setTimeout(resolve, 3000));
              continue; // Retry
            } else if (isAllowanceError) {
              // Final attempt - check allowance one more time (if we can read it)
              try {
                const finalAllowance = await publicClient.readContract({
                  address: params.tokenAddress,
                  abi: erc20ABI,
                  functionName: "allowance",
                  args: [address, params.tournamentAddress],
                }) as bigint;
                
                if (finalAllowance < params.entryFee) {
                  toast.error(`Token allowance insufficient: ${formatEther(finalAllowance)} < ${formatEther(params.entryFee)}. Please approve the token again.`);
                } else {
                  toast.error("Token transfer failed despite sufficient allowance. Please try again or contact support.");
                }
              } catch (finalCheckError) {
                // If we can't read allowance, give a generic error message
                const errorMsg = finalCheckError instanceof Error ? finalCheckError.message : String(finalCheckError);
                if (errorMsg.includes("returned no data") || errorMsg.includes("not a contract")) {
                  toast.error("Cannot verify token allowance due to network issues. Please try the join transaction again - if it fails, approve the token again.");
                } else {
                  toast.error("Token allowance issue persists. Please manually approve the token in your wallet and try again.");
                }
              }
              
              console.error('[Join Tournament] Allowance error after all retries:', {
                error: simulateError,
                tournamentAddress: params.tournamentAddress,
                tokenAddress: params.tokenAddress,
                entryFee: params.entryFee.toString(),
              });
              setIsJoining(false);
              return;
            } else {
              toast.error(errorMsg);
              setIsJoining(false);
              return;
            }
          }
        }

        toast.info("Submitting join transaction to your wallet...");
        
        try {
          console.log(`[Join Tournament] Calling writeContractAsync (attempt ${joinAttempts})...`, {
            tournamentAddress: params.tournamentAddress,
            commitHash: normalizedCommitHash,
          });
          
          joinHash = await writeContractAsync({
            address: params.tournamentAddress,
            abi: tournamentABI,
            functionName: "join",
            args: [normalizedCommitHash],
          });
          
          console.log('[Join Tournament] writeContractAsync result:', joinHash);
          
          if (joinHash) {
            break; // Success, exit retry loop
          }
        } catch (writeError) {
          console.error(`[Join Tournament] writeContractAsync error (attempt ${joinAttempts}):`, writeError);
          
          const errorString = JSON.stringify(writeError);
          const errorMessage = writeError instanceof Error ? writeError.message : String(writeError);
          const isAllowanceError = errorString.includes("allowance") || 
                                  errorString.includes("SafeERC20") || 
                                  errorString.includes("SafeERC20FailedOperation") ||
                                  errorMessage.includes("allowance") ||
                                  errorMessage.includes("SafeERC20") ||
                                  errorMessage.includes("SafeERC20FailedOperation");
          
          if (isAllowanceError && joinAttempts < maxJoinAttempts) {
            console.warn(`[Join Tournament] Allowance error on write (attempt ${joinAttempts}), checking and retrying...`);
            
            // Check allowance before retrying (if we can read it)
            try {
              const writeRetryAllowance = await publicClient.readContract({
                address: params.tokenAddress,
                abi: erc20ABI,
                functionName: "allowance",
                args: [address, params.tournamentAddress],
              }) as bigint;
              
              console.log('[Join Tournament] Allowance on write retry:', writeRetryAllowance.toString());
              
              if (writeRetryAllowance < params.entryFee) {
                toast.error("Token allowance insufficient. Please approve again.");
                setIsJoining(false);
                return;
              }
            } catch (allowanceCheckError) {
              // If we can't read allowance (RPC issue), proceed with retry anyway
              const errorMsg = allowanceCheckError instanceof Error ? allowanceCheckError.message : String(allowanceCheckError);
              if (errorMsg.includes("returned no data") || errorMsg.includes("not a contract")) {
                console.warn('[Join Tournament] Cannot read allowance (RPC issue), but proceeding with write retry.');
              } else {
                console.warn('[Join Tournament] Could not check allowance on write retry:', allowanceCheckError);
              }
              // Continue with retry - don't block
            }
            
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 3000));
            continue; // Retry
          }
          
          const errorMsg = getFriendlyErrorMessage(writeError, "Failed to submit join transaction");
          toast.error(errorMsg);
          setIsJoining(false);
          throw writeError; // Re-throw to be caught by outer catch
        }
      }
      
      if (!joinHash) {
        toast.error("Failed to submit join transaction after multiple attempts. Please try again.");
        setIsJoining(false);
        return;
      }
      
      setTxHash(joinHash);
      toast.success("Join transaction submitted! Please confirm in your wallet.");
    } catch (err) {
      console.error("Error joining tournament:", err);
      const errorMsg = getFriendlyErrorMessage(err, "Failed to join tournament");
      toast.error(errorMsg);
      setIsJoining(false);
    }
  };

  // Handle success
  useEffect(() => {
    if (isSuccess) {
      toast.success("Successfully joined tournament!");
      setIsJoining(false);
    }
  }, [isSuccess]);

  // Handle errors
  useEffect(() => {
    if (error) {
      console.error("Join tournament error:", error);
      toast.error(getFriendlyErrorMessage(error, "Failed to join tournament"));
      setIsJoining(false);
    }
  }, [error]);

  return {
    joinTournament,
    isJoining: isJoining || isPending || isConfirming,
    txHash,
    approvalTxHash,
    isSuccess,
    error,
  };
}

