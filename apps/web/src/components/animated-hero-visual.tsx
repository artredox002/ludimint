"use client"

import { useEffect, useRef } from "react"

type OrbitNode = {
  angle: number
  radius: number
  size: number
  speed: number
  hue: number
}

export function AnimatedHeroVisual() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    let width = canvas.clientWidth
    let height = canvas.clientHeight

    const setCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    setCanvasSize()
    window.addEventListener("resize", setCanvasSize)

    const nodes: OrbitNode[] = Array.from({ length: 9 }, (_, index) => ({
      angle: Math.random() * Math.PI * 2,
      radius: 80 + Math.random() * 140,
      size: 5 + Math.random() * 10,
      speed: 0.00012 + Math.random() * 0.0004,
      hue: 160 + index * 18,
    }))

    let animationFrame: number
    let lastTime = performance.now()

    const draw = (timestamp: number) => {
      const delta = timestamp - lastTime
      lastTime = timestamp

      context.clearRect(0, 0, width, height)

      const backgroundGradient = context.createRadialGradient(
        width / 2,
        height / 2,
        Math.min(width, height) * 0.15,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.9,
      )
      backgroundGradient.addColorStop(0, "rgba(0, 209, 199, 0.18)")
      backgroundGradient.addColorStop(0.5, "rgba(8, 20, 24, 0.4)")
      backgroundGradient.addColorStop(1, "rgba(8, 20, 24, 0)")
      context.fillStyle = backgroundGradient
      context.fillRect(0, 0, width, height)

      context.save()
      context.translate(width / 2, height / 2)

      nodes.forEach((node, index) => {
        node.angle += node.speed * delta
        const x = Math.cos(node.angle) * node.radius
        const y = Math.sin(node.angle) * node.radius * 0.6

        const gradient = context.createRadialGradient(x, y, 0, x, y, node.size * 3)
        gradient.addColorStop(0, `hsla(${node.hue}, 90%, 70%, 0.9)`)
        gradient.addColorStop(1, `hsla(${node.hue}, 80%, 40%, 0)`)

        context.beginPath()
        context.fillStyle = gradient
        context.shadowColor = `hsla(${node.hue}, 90%, 70%, 0.6)`
        context.shadowBlur = 20
        context.arc(x, y, node.size, 0, Math.PI * 2)
        context.fill()

        const connector = nodes[(index + 2) % nodes.length]
        const connectorX = Math.cos(connector.angle) * connector.radius
        const connectorY = Math.sin(connector.angle) * connector.radius * 0.6

        context.beginPath()
        context.moveTo(x, y)
        context.lineTo(connectorX, connectorY)
        context.strokeStyle = `hsla(${node.hue}, 80%, 60%, 0.08)`
        context.lineWidth = 1
        context.stroke()
      })

      context.restore()

      animationFrame = requestAnimationFrame(draw)
    }

    animationFrame = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener("resize", setCanvasSize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "20px",
        display: "block",
      }}
    />
  )
}

