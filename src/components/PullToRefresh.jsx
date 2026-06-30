import { useState, useRef } from 'react'

function PullToRefresh({ onRefresh, children }) {
  const [pullDistance, setPullDistance] = useState(0)
  const [refrescando, setRefrescando] = useState(false)
  const startY = useRef(null)
  const UMBRAL = 70

  const onTouchStart = (e) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY
    }
  }

  const onTouchMove = (e) => {
    if (startY.current === null || refrescando) return
    const diff = e.touches[0].clientY - startY.current
    if (diff > 0 && window.scrollY === 0) {
      setPullDistance(Math.min(diff, 100))
    }
  }

  const onTouchEnd = async () => {
    if (pullDistance > UMBRAL && !refrescando) {
      setRefrescando(true)
      await onRefresh()
      setRefrescando(false)
    }
    setPullDistance(0)
    startY.current = null
  }

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div style={{
        height: refrescando ? '50px' : `${pullDistance}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: refrescando ? 'height 0.2s ease' : 'none',
        overflow: 'hidden'
      }}>
        <i
          className="ti ti-refresh"
          style={{
            fontSize: '20px',
            color: 'var(--accent)',
            transform: refrescando ? 'none' : `rotate(${pullDistance * 3}deg)`,
            animation: refrescando ? 'spin 0.8s linear infinite' : 'none'
          }}
        ></i>
      </div>
      {children}
    </div>
  )
}

export default PullToRefresh