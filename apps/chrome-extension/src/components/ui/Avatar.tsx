import { useState, useEffect } from 'react'
import { Text } from '../../utils'

interface TableImageProps {
  src: string
  alt: string
}

export default function Avatar({ src, alt }: TableImageProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [srcImage, setSrcImage] = useState<string | null>(src)

  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    let url = src as string

    if (Text.isBase64(src)) {
      url = `data:image/png;base64,${src}`
    }

    /**
     * Valida si la imagen tiene el siguiente formato:
     * - `"<img src=\"drawing-2410307485e7cce828e24becd31a0c681c143274.png\" class=\"drawing\">"`
     * Si la imagen tiene el siguiente formato se debe extraer el valor del src de la imagen
     * - `drawing-2410307485e7cce828e24becd31a0c681c143274.png`
     */
    const hasHtmlFormat = src.includes('src=')

    if (hasHtmlFormat) {
      const regex = /src="([^"]*)"/
      const match = regex.exec(src)
      url = match ? (match[1] as string) : (src as string)
    }

    const img = new Image()
    setSrcImage(url)
    img.src = url

    img.onload = () => {
      setImageLoaded(true)
    }
    img.onerror = () => {
      setImageError(true)
    }
  }, [src])

  return (
    <div
      className="relative"
      data-custom={`${isHovering}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="relative h-[40px] w-[40px] overflow-hidden rounded-full bg-gray-200">
        {!imageError && (
          <img
            src={srcImage || ''}
            alt={alt}
            className={`h-full w-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onError={() => setImageError(true)}
          />
        )}

        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
          </div>
        )}

        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              ></path>
            </svg>
          </div>
        )}
      </div>

      {isHovering && !imageError && (
        <div className="absolute left-[150px] bottom-full mb-2 transform -translate-x-1/2 w-[200px] h-[200px] overflow-hidden rounded-lg shadow-lg duration-300">
          <div className="relative">
            <img
              src={srcImage || ''}
              alt={alt}
              className="h-[200px] w-[200px] object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
              <span className="text-white text-sm">Click to enlarge</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
