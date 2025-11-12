import { useState, useRef, useEffect } from "react"
import { ConfigForm, type Config } from "@/components/ConfigForm"
import { useAutoRedeem } from "@/hooks/useAutoRedeem"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Github } from "lucide-react"

export function AutoRedeemApp() {
  const [config, setConfig] = useState<Config | null>(null)
  const [cachedConfig, setCachedConfig] = useState<Partial<Config> | null>(null)
  const { isRunning, balance, maxRedeemable, botAddress, logs, error, start, stop } =
    useAutoRedeem(config)
  const logsContainerRef = useRef<HTMLDivElement>(null)

  const handleConfigSubmit = (newConfig: Config) => {
    if (isRunning) {
      stop()
    }
    setConfig(newConfig)
    setCachedConfig(newConfig)
  }

  const handleStart = () => {
    if (config) {
      start()
    }
  }

  const formatBigInt = (value: bigint | null) => {
    if (value === null) return "—"
    return value.toString()
  }

  const getLogIcon = (type: string) => {
    switch (type) {
      case "success":
        return "✅"
      case "error":
        return "❌"
      case "redeem":
        return "🎯"
      default:
        return "ℹ️"
    }
  }

  // Auto-scroll to bottom when logs update (only scroll the logs container, not the whole page)
  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight
    }
  }, [logs])

  return (
    <div className="container mx-auto p-4 max-w-4xl space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Auto-Redeem Rescue</h1>
        <p className="text-muted-foreground">
          Continuously attempts to withdraw funds from ERC-4626 compliant vaults
        </p>
      </div>

      {!config ? (
        <ConfigForm onSubmit={handleConfigSubmit} initialConfig={cachedConfig || undefined} />
      ) : (
        <div className="space-y-6">
          {/* Configuration Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Current Configuration</CardTitle>
              <CardDescription>You can stop and reconfigure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Vault:</span>{" "}
                  <span className="font-mono text-xs">{config.vault}</span>
                </div>
                <div>
                  <span className="font-medium">Receiver:</span>{" "}
                  <span className="font-mono text-xs">{config.receiver}</span>
                </div>
                {botAddress && (
                  <div>
                    <span className="font-medium">Bot Address:</span>{" "}
                    <span className="font-mono text-xs">{botAddress}</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleStart}
                  disabled={isRunning}
                  variant="default"
                >
                  Start Auto-Redeem
                </Button>
                <Button
                  onClick={stop}
                  disabled={!isRunning}
                  variant="destructive"
                >
                  Stop
                </Button>
                <Button
                  onClick={() => {
                    stop()
                    setConfig(null)
                  }}
                  variant="outline"
                >
                  Reconfigure
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Status Card */}
          {isRunning && (
            <Card>
              <CardHeader>
                <CardTitle>Current Status</CardTitle>
                <CardDescription>Real-time monitoring information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Balance</div>
                    <div className="text-2xl font-bold">
                      {formatBigInt(balance)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Max Redeemable</div>
                    <div className="text-2xl font-bold">
                      {formatBigInt(maxRedeemable)}
                    </div>
                  </div>
                </div>
                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <div className="text-sm font-medium text-destructive">
                      Error: {error}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Logs Card */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction Logs</CardTitle>
              <CardDescription>Recent activity records</CardDescription>
            </CardHeader>
            <CardContent>
              <div ref={logsContainerRef} className="space-y-2 max-h-96 overflow-y-auto">
                {logs.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No logs yet
                  </div>
                ) : (
                  logs.map((log, index) => (
                    <div
                      key={index}
                      className="flex gap-2 text-sm border-b border-border pb-2 last:border-0"
                    >
                      <span className="shrink-0">{getLogIcon(log.type)}</span>
                      <span className="text-muted-foreground font-mono text-xs shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="flex-1">{log.message}</span>
                      {log.hash && (
                        <div>
                          tx hash: {log.hash}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* GitHub Link Footer */}
      <div className="pt-8 pb-4 text-center border-t">
        <a
          href="https://github.com/OneSavieLabs/auto-redeem"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Github className="h-4 w-4" />
          <span>View on GitHub</span>
        </a>
      </div>
    </div>
  )
}

