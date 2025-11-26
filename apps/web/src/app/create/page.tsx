"use client"

import { useState, useEffect } from "react"
import { useAccount } from "wagmi"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { PlusCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { TransactionStatus } from "@/components/transaction-status"
import { useCreateTournament } from "@/hooks/use-create-tournament"

export default function CreatePage() {
  const { isConnected } = useAccount()
  const router = useRouter()
  const { createTournament, isCreating, tournamentAddress, txHash, isSuccess } = useCreateTournament()
  const [formData, setFormData] = useState({
    entryFee: "",
    maxPlayers: "",
    topK: "",
    commitDurationHours: "",
    revealDurationHours: "",
  })

  // Redirect on success
  useEffect(() => {
    if (isSuccess && tournamentAddress) {
      toast.success("Tournament created successfully!")
      router.push(`/tournaments/${tournamentAddress}`)
    }
  }, [isSuccess, tournamentAddress, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isConnected) {
      toast.error("Please connect your wallet first")
      return
    }

    // Validate form
    const entryFee = parseFloat(formData.entryFee)
    const maxPlayers = parseInt(formData.maxPlayers)
    const topK = parseInt(formData.topK)
    const commitDurationHours = parseFloat(formData.commitDurationHours)
    const revealDurationHours = parseFloat(formData.revealDurationHours)

    if (isNaN(entryFee) || entryFee <= 0) {
      toast.error("Please enter a valid entry fee")
      return
    }

    if (isNaN(maxPlayers) || maxPlayers < 2) {
      toast.error("Maximum players must be at least 2")
      return
    }

    if (isNaN(topK) || topK < 1 || topK > maxPlayers) {
      toast.error("Top K must be between 1 and max players")
      return
    }

    if (isNaN(commitDurationHours) || commitDurationHours < 1) {
      toast.error("Commit duration must be at least 1 hour")
      return
    }

    if (isNaN(revealDurationHours) || revealDurationHours < 1) {
      toast.error("Reveal duration must be at least 1 hour")
      return
    }

    // Create tournament
    await createTournament({
      entryFee: entryFee.toString(),
      maxPlayers,
      topK,
      commitDurationSeconds: Math.floor(commitDurationHours * 3600),
      revealDurationSeconds: Math.floor(revealDurationHours * 3600),
    })
  }

  return (
    <div className="min-h-screen bg-bg-900 text-fg-100">
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/tournaments"
            className="inline-flex items-center gap-2 text-fg-80 hover:text-primary-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Tournaments</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-600/10 rounded-lg">
              <PlusCircle className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-fg-100 mb-2">
                Create Tournament
              </h1>
              <p className="text-fg-80">
                Set up a new tournament and start competing
              </p>
            </div>
          </div>
        </div>

        {/* Transaction Status */}
        {txHash && (
          <div className="mb-6">
            <TransactionStatus
              hash={txHash}
              description="Creating tournament..."
              onSuccess={() => {
                toast.success("Tournament created successfully!")
                router.push("/tournaments")
              }}
            />
          </div>
        )}

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Tournament Details</CardTitle>
            <CardDescription>
              Fill in the information below to create your tournament
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="entryFee">Entry Fee (cUSD)</Label>
                  <Input
                    id="entryFee"
                    name="entryFee"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.entryFee}
                    onChange={handleChange}
                    placeholder="e.g. 2.50"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxPlayers">Max Players</Label>
                  <Input
                    id="maxPlayers"
                    name="maxPlayers"
                    type="number"
                    min="2"
                    max="200"
                    value={formData.maxPlayers}
                    onChange={handleChange}
                    placeholder="e.g. 64"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="topK">Top K Winners</Label>
                <Input
                  id="topK"
                  name="topK"
                  type="number"
                  min="1"
                  value={formData.topK}
                  onChange={handleChange}
                  placeholder="e.g. 3"
                  required
                />
                <p className="text-xs text-muted">Number of top players who will share the prize pool</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="commitDurationHours">Commit Phase Duration (Hours)</Label>
                  <Input
                    id="commitDurationHours"
                    name="commitDurationHours"
                    type="number"
                    step="0.5"
                    min="1"
                    value={formData.commitDurationHours}
                    onChange={handleChange}
                    placeholder="e.g. 24"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="revealDurationHours">Reveal Phase Duration (Hours)</Label>
                  <Input
                    id="revealDurationHours"
                    name="revealDurationHours"
                    type="number"
                    step="0.5"
                    min="1"
                    value={formData.revealDurationHours}
                    onChange={handleChange}
                    placeholder="e.g. 24"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  disabled={isCreating || !isConnected}
                  isLoading={isCreating}
                >
                  {isCreating ? "Creating..." : "Create Tournament"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  asChild
                  className="flex-1"
                >
                  <Link href="/tournaments">Cancel</Link>
                </Button>
              </div>

              {!isConnected && (
                <div className="p-4 bg-warning-500/10 border border-warning-500/20 rounded-md">
                  <p className="text-sm text-warning-500">
                    Please connect your wallet to create a tournament
                  </p>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
