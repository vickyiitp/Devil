import { API_URL } from '../api/cms';

export function resolveContentMedia(html?: string): string | undefined {
  if (!html) return html;

  // Replace src="/uploads/..." with absolute URL
  const fixed = html.replace(/src=("|')\/uploads\//g, `src=$1${API_URL}/uploads/`);
  return fixed.replace(/src=("|')uploads\//g, `src=$1${API_URL}/uploads/`);
}

export default resolveContentMedia;
