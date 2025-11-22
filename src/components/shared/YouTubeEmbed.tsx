

import React, { useState } from 'react';

interface YouTubeEmbedProps {
  videoId: string;
  title: string;
  className?: string;
}

export const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ videoId, title, className = '' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

  const handlePlay = () => {
    setIsPlaying(true);
  };

  return (
    <div className={`relative w-full max-w-4xl mx-auto ${className}`}>
      <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl bg-black">
        {isPlaying ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&vq=hd1080`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <>
            {/* Thumbnail */}
            <img 
              src={thumbnailUrl} 
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
              loading="lazy"
            />
            
            {/* Play Button */}
            <button
              onClick={handlePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/10 transition-colors group cursor-pointer"
              aria-label="Play video"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-devil-red flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                <svg 
                  viewBox="0 0 24 24" 
                  fill="white" 
                  className="w-8 h-8 sm:w-10 sm:h-10 ml-1"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
