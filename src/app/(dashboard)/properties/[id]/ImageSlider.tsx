'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Home, ChevronLeft, ChevronRight } from 'lucide-react'

interface SliderImage {
  id: string
  image_url: string
  is_thumbnail: boolean
}

interface Props {
  images: SliderImage[]
  title: string
}

export function ImageSlider({ images, title }: Props) {
  const [current, setCurrent] = useState(0)
  const touchStartX = useRef<number | null>(null)

  if (images.length === 0) {
    return (
      <div className="w-full aspect-[4/3] bg-slate-100 flex items-center justify-center text-slate-300">
        <Home size={48} />
      </div>
    )
  }

  function prev() {
    setCurrent((c) => (c === 0 ? images.length - 1 : c - 1))
  }

  function next() {
    setCurrent((c) => (c === images.length - 1 ? 0 : c + 1))
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) {
      diff > 0 ? next() : prev()
    }
    touchStartX.current = null
  }

  return (
    <div
      className="relative w-full aspect-[4/3] bg-black select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 이미지 */}
      <Image
        src={images[current].image_url}
        alt={`${title} ${current + 1}/${images.length}`}
        fill
        className="object-contain"
        sizes="100vw"
        priority={current === 0}
      />

      {/* 이전/다음 버튼 (이미지 2장 이상일 때만) */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white"
            aria-label="이전 사진"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white"
            aria-label="다음 사진"
          >
            <ChevronRight size={20} />
          </button>

          {/* N / 전체 카운터 */}
          <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">
            {current + 1} / {images.length}
          </span>

          {/* 하단 인디케이터 점 */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all ${
                  i === current
                    ? 'w-4 h-1.5 bg-white'
                    : 'w-1.5 h-1.5 bg-white/50'
                }`}
                aria-label={`${i + 1}번 사진`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
