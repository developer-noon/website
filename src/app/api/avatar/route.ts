import { NextRequest } from 'next/server';

function escapeXml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&apos;',
      '"': '&quot;',
    };

    return entities[character];
  });
}

export function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get('name')?.trim() || 'User';
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  const safeInitials = escapeXml(initials || 'U');
  const image = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="64" fill="#ABFFAE"/><text x="64" y="68" fill="#0B353B" font-family="Arial, sans-serif" font-size="44" font-weight="700" text-anchor="middle" dominant-baseline="middle">${safeInitials}</text></svg>`;

  return new Response(image, {
    headers: {
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      'Content-Type': 'image/svg+xml',
    },
  });
}
