/**
 * MiniPay integration utilities
 */

/**
 * Check if MiniPay is available
 */
export function isMiniPayAvailable(): boolean {
  if (typeof window === 'undefined') return false
  // @ts-ignore
  return window.ethereum?.isMiniPay === true
}

/**
 * Generate MiniPay payment deeplink
 */
export function generatePaymentDeeplink(
  recipient: string,
  amount: string,
  currency: string = "cUSD",
  memo?: string
): string {
  const params = new URLSearchParams({
    recipient,
    amount,
    currency,
  })
  
  if (memo) {
    params.append('memo', memo)
  }
  
  return `minipay://pay?${params.toString()}`
}

/**
 * Generate MiniPay connect deeplink
 */
export function generateConnectDeeplink(callbackUrl?: string): string {
  const params = new URLSearchParams()
  if (callbackUrl) {
    params.append('callback', callbackUrl)
  }
  
  return `minipay://connect?${params.toString()}`
}

/**
 * Open MiniPay payment
 */
export function openMiniPayPayment(
  recipient: string,
  amount: string,
  currency: string = "cUSD",
  memo?: string
): void {
  const deeplink = generatePaymentDeeplink(recipient, amount, currency, memo)
  window.location.href = deeplink
}

/**
 * Open MiniPay connect
 */
export function openMiniPayConnect(callbackUrl?: string): void {
  const deeplink = generateConnectDeeplink(callbackUrl)
  window.location.href = deeplink
}

/**
 * Get Celo Alfajores faucet URL
 */
export function getFaucetUrl(): string {
  return "https://faucet.celo.org/alfajores"
}

