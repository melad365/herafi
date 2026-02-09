"use client"

import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination } from "swiper/modules"

// Import Swiper styles
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"

interface GigImageGalleryProps {
  images: string[]
  title: string
}

export default function GigImageGallery({
  images,
  title,
}: GigImageGalleryProps) {
  // No images - show placeholder
  if (!images || images.length === 0) {
    return (
      <div className="bg-gray-100 rounded-lg overflow-hidden aspect-video flex items-center justify-center">
        <div className="text-center text-gray-500">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-2">No images available</p>
        </div>
      </div>
    )
  }

  // Single image - no carousel controls
  if (images.length === 1) {
    return (
      <div className="bg-gray-100 rounded-lg overflow-hidden aspect-video">
        <img
          src={images[0]}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  // Multiple images - use Swiper carousel
  return (
    <div className="rounded-lg overflow-hidden">
      <Swiper
        modules={[Navigation, Pagination]}
        navigation
        pagination={{ clickable: true }}
        spaceBetween={0}
        slidesPerView={1}
        className="gig-image-swiper"
      >
        {images.map((image, index) => (
          <SwiperSlide key={index}>
            <div className="aspect-video bg-gray-100">
              <img
                src={image}
                alt={`${title} - Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
