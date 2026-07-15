import React from 'react';
import { cn } from '../utils/cn';

const Skeleton = ({ className, height, width, borderRadius }) => {
  const style = {};
  if (height) style.height = height;
  if (width) style.width = width;
  if (borderRadius) style.borderRadius = borderRadius;

  return (
    <div
      className={cn('skeleton', className)}
      style={style}
    />
  );
};

const ImageSkeleton = () => {
  return (
    <div className="masonry-item">
      <div className="glass rounded-2xl overflow-hidden">
        <Skeleton
          height="300px"
          width="100%"
          className="rounded-t-2xl"
        />
        <div className="p-4 space-y-2">
          <Skeleton height="16px" width="60%" />
          <Skeleton height="14px" width="80%" />
          <Skeleton height="12px" width="40%" />
        </div>
      </div>
    </div>
  );
};

const CardSkeleton = ({ variant = 'image' }) => {
  if (variant === 'image') {
    return <ImageSkeleton />;
  }

  return (
    <div className="masonry-item">
      <div className="glass rounded-2xl p-6">
        <div className="space-y-4">
          <Skeleton height="12px" width="30%" />
          <Skeleton height="24px" width="90%" />
          <Skeleton height="16px" width="70%" />
          <div className="flex gap-2">
            <Skeleton height="32px" width="80px" borderRadius="8px" />
            <Skeleton height="32px" width="80px" borderRadius="8px" />
          </div>
        </div>
      </div>
    </div>
  );
};

const TextSkeleton = ({ lines = 3, className }) => {
  return (
    <div className={cn('space-y-2', className)}>
      {[...Array(lines)].map((_, i) => (
        <Skeleton key={i} height="16px" width={i === 0 ? '40%' : '100%'} />
      ))}
    </div>
  );
};

const ButtonSkeleton = () => {
  return <Skeleton height="40px" width="120px" borderRadius="8px" />;
};

const AvatarSkeleton = () => {
  return <Skeleton height="48px" width="48px" borderRadius="50%" />;
};

const ChatSkeleton = () => {
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <AvatarSkeleton />
        <div className="space-y-2 flex-1">
          <Skeleton height="20px" width="60px" />
          <TextSkeleton lines={2} />
        </div>
      </div>
      <div className="flex gap-3 justify-end">
        <Skeleton height="20px" width="60px" />
        <AvatarSkeleton />
        <div className="space-y-2 flex-1">
          <Skeleton height="20px" width="40%" />
          <TextSkeleton lines={1} />
        </div>
      </div>
    </div>
  );
};

export { Skeleton, ImageSkeleton, CardSkeleton, TextSkeleton, ButtonSkeleton, AvatarSkeleton, ChatSkeleton };