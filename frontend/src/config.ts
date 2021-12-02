export function getEnv(name: string) {
  return window?.configs?.[name] || import.meta.env['VITE_' + name];
}

const SLIDE_API_URL = getEnv('SLIDE_API_URL');
const BASE_API_URL = getEnv('BASE_API_URL');
const SLIDE_IMAGE_URL = getEnv('SLIDE_IMAGE_URL');
const APP_LOGO_URL = getEnv('APP_LOGO_URL');
const SLIDE_URL = `${SLIDE_IMAGE_URL}/pyramids`;

const getSlideUrl = (slide_id: string) => {
  return `${SLIDE_URL}/${slide_id}/dzi.dzi`;
};

const getThumbnailUrl = (slide_id: string) => {
  return `${SLIDE_URL}/${slide_id}/thumbnail.jpeg`;
};

export { BASE_API_URL, SLIDE_API_URL, SLIDE_IMAGE_URL, SLIDE_URL, getSlideUrl, getThumbnailUrl, APP_LOGO_URL };
