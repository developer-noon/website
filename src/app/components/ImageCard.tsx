import type { CSSProperties, ReactNode } from 'react';

type ImageCardProps = {
  image: string;
  children: ReactNode;
  className?: string;
  as?: 'div' | 'article' | 'section';
};

export default function ImageCard({ image, children, className = '', as = 'div' }: ImageCardProps) {
  const Tag = as;
  const style = { '--image-card': `url("${image}")` } as CSSProperties;

  return (
    <Tag className={`image-card ${className}`} style={style}>
      <div className="image-card-content">{children}</div>
    </Tag>
  );
}
