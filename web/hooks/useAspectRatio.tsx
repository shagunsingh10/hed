import { useEffect, useState } from 'react'

const usePageAspectRatio = () => {
  const [aspectRatio, setAspectRatio] = useState(calculateAspectRatio())

  useEffect(() => {
    const handleResize = () => {
      setAspectRatio(calculateAspectRatio())
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  function calculateAspectRatio() {
    const browserZoomLevel = Math.round(window.devicePixelRatio * 100)
    return (window.innerWidth / window.innerHeight) * (100 / browserZoomLevel)
  }

  return aspectRatio
}

export default usePageAspectRatio
