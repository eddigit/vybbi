import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface ImageItem {
  id: string;
  url: string;
  description?: string | null;
  position_y?: number;
}

interface ImageGallerySliderProps {
  images: ImageItem[];
  selectedIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageGallerySlider({ images, selectedIndex, isOpen, onClose }: ImageGallerySliderProps) {
  const [currentIndex, setCurrentIndex] = useState(selectedIndex);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") goToPrevious();
    if (e.key === "ArrowRight") goToNext();
    if (e.key === "Escape") onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/90 border-none">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Previous button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-40 text-white hover:bg-white/20"
            onClick={goToPrevious}
            disabled={images.length <= 1}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>

          {/* Next button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-40 text-white hover:bg-white/20"
            onClick={goToNext}
            disabled={images.length <= 1}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>

          {/* Image display */}
          <div className="flex items-center justify-center w-full h-[80vh]">
            {images[currentIndex] && (
              <img
                src={images[currentIndex].url}
                alt={images[currentIndex].description || 'Image'}
                className="max-w-full max-h-full object-contain"
                style={{
                  objectPosition: images[currentIndex].position_y 
                    ? `center ${images[currentIndex].position_y}%` 
                    : 'center'
                }}
              />
            )}
          </div>

          {/* Image counter */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Image description */}
          {images[currentIndex]?.description && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg max-w-md text-center text-sm">
              {images[currentIndex].description}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}