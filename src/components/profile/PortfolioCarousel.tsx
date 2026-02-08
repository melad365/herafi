"use client"

import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination } from "swiper/modules"

// Import Swiper styles
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"

interface PortfolioImage {
  id: string
  imageUrl: string
  caption: string | null
}

interface PortfolioCarouselProps {
  images: PortfolioImage[]
}

export default function PortfolioCarousel({
  images,
}: PortfolioCarouselProps) {
  // Don't render if no images
  if (!images || images.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Portfolio</h2>

      <Swiper
        modules={[Navigation, Pagination]}
        navigation
        pagination={{ clickable: true }}
        spaceBetween={20}
        slidesPerView={1}
        breakpoints={{
          640: {
            slidesPerView: 1,
          },
          768: {
            slidesPerView: 2,
          },
          1024: {
            slidesPerView: 3,
          },
        }}
        className="portfolio-swiper"
      >
        {images.map((image) => (
          <SwiperSlide key={image.id}>
            <div className="pb-6">
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-2">
                <img
                  src={image.imageUrl}
                  alt={image.caption || "Portfolio image"}
                  className="w-full h-full object-cover"
                />
              </div>
              {image.caption && (
                <p className="text-sm text-gray-600 text-center">
                  {image.caption}
                </p>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
