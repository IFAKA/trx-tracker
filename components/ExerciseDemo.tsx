'use client';

import { Play } from 'lucide-react';

interface ExerciseDemoProps {
  youtubeId: string;
  title: string;
}

export function ExerciseDemo({ youtubeId, title }: ExerciseDemoProps) {
  const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;

  return (
    <a
      href={`https://www.youtube.com/watch?v=${youtubeId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="relative block w-full max-w-[280px] rounded-lg overflow-hidden group"
      aria-label={`Watch ${title} demo on YouTube`}
    >
      <img
        src={thumbnailUrl}
        alt={`${title} demonstration`}
        className="w-full aspect-video object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-active:bg-black/50 transition-colors">
        <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
          <Play className="w-5 h-5 text-black fill-black ml-0.5" />
        </div>
      </div>
    </a>
  );
}
