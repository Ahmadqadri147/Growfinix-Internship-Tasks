export const APP_NAME = 'AI Image Generation Studio';
export const APP_SHORT_NAME = 'Image Studio';
export const APP_DESCRIPTION =
  'A directed AI image generation studio. Compose with style, light, surface and format controls, then render with FLUX.';
export const APP_VERSION = '2.0.0';

export const ARCHIVE_USER_ID = 'studio-archive';
export const SESSION_COOKIE = 'studio_session';

export const STYLES = [
  'Realistic',
  'Photorealistic',
  'Anime',
  'Cyberpunk',
  'Oil Painting',
  'Watercolor',
  'Fantasy',
  '3D Render',
  'Pixar',
  'Comic',
  'Pixel Art',
] as const;

export const LIGHTING = [
  'Studio',
  'Natural',
  'Golden Hour',
  'Sunset',
  'Neon',
  'Soft',
  'Cinematic',
  'Volumetric',
] as const;

export const TEXTURES = [
  'Smooth',
  'Rough',
  'Metallic',
  'Wood',
  'Glass',
  'Stone',
  'Fabric',
  'Leather',
  'Paper',
] as const;

export const BACKGROUNDS = [
  'Forest',
  'Mountains',
  'Ocean',
  'Space',
  'City',
  'Minimal',
  'Abstract',
  'White Studio',
] as const;

export const CAMERA_ANGLES = [
  'Portrait',
  'Close-up',
  'Wide',
  'Top View',
  'Low Angle',
  'Bird Eye',
  'Macro',
] as const;

export const ASPECT_RATIOS = ['1:1', '4:3', '3:2', '16:9', '9:16'] as const;

export const IMAGE_SIZES = [
  '512x512',
  '768x768',
  '1024x1024',
  '768x576',
  '1024x768',
  '768x512',
  '1024x680',
  '768x432',
  '1024x576',
  '432x768',
  '576x1024',
  '1024x1792',
  '1792x1024',
] as const;

export const QUALITIES = ['standard', 'hd', 'ultra'] as const;

export const SORT_OPTIONS = ['newest', 'oldest', 'favorites'] as const;

export const SCOPES = ['all', 'mine', 'archive'] as const;

export const SIZE_BY_RATIO: Record<string, string[]> = {
  '1:1': ['512x512', '768x768', '1024x1024'],
  '4:3': ['768x576', '1024x768'],
  '3:2': ['768x512', '1024x680'],
  '16:9': ['768x432', '1024x576', '1792x1024'],
  '9:16': ['432x768', '576x1024', '1024x1792'],
};

export const RATIO_BY_SIZE: Record<string, string> = {
  '512x512': '1:1',
  '768x768': '1:1',
  '1024x1024': '1:1',
  '768x576': '4:3',
  '1024x768': '4:3',
  '768x512': '3:2',
  '1024x680': '3:2',
  '768x432': '16:9',
  '1024x576': '16:9',
  '1792x1024': '16:9',
  '432x768': '9:16',
  '576x1024': '9:16',
  '1024x1792': '9:16',
};

export const DEFAULT_SIZE_BY_RATIO: Record<string, string> = {
  '1:1': '1024x1024',
  '4:3': '1024x768',
  '3:2': '1024x680',
  '16:9': '1024x576',
  '9:16': '576x1024',
};

export const DEFAULT_FORM = {
  prompt: '',
  subject: '',
  style: 'Realistic',
  lighting: 'Studio',
  texture: 'Smooth',
  colorPalette: '',
  background: '',
  cameraAngle: 'Portrait',
  negativePrompt: '',
  imageSize: '1024x1024',
  aspectRatio: '1:1',
  quality: 'standard',
  seed: '',
  creativity: 7,
  n: 1,
} as const;

export const EXAMPLE_PROMPTS = [
  'A glass observatory above a sea of clouds at dusk, wide shot, soft volumetric light',
  'Still life of ripe figs on a pewter plate, north window light, quiet shadows',
  'A lone runner on a rain-slick bridge before sunrise, cinematic haze',
] as const;

export const MAX_PROMPT_LENGTH = 4000;
export const MIN_PROMPT_LENGTH = 10;
export const MAX_IMAGES_PER_REQUEST = 5;
export const GALLERY_PAGE_SIZE = 24;
