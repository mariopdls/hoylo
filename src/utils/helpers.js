// Utilidades para debounce, throttle y otros helpers comunes

export function debounce(func, wait) {
  let timeoutId
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeoutId)
      func(...args)
    }
    clearTimeout(timeoutId)
    timeoutId = setTimeout(later, wait)
  }
}

export function useDebounce(value, wait) {
  const [debouncedValue, setDebouncedValue] = window.React?.useState(value)
  
  window.React?.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, wait)

    return () => clearTimeout(handler)
  }, [value, wait])

  return debouncedValue
}

// Throttle para eventos que se disparan muy frecuentemente (resize, scroll)
export function throttle(func, limit) {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}
