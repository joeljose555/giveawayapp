import { normalizeComments } from '../utils/commentParser.js';

function avatarUrl(username) {
  return `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(username)}`;
}

const RAW = [
  { username: 'maya_creates', comment: 'Would love to win! @bestie @squad' },
  { username: 'jordan.k', comment: 'Entered! Good luck everyone' },
  { username: 'sofia_travels', comment: 'Me please @travelbuddy' },
  { username: 'dev_alex', comment: 'This is amazing @coders @react' },
  { username: 'luna.art', comment: 'Pick me! @luna @studio' },
  { username: 'marcus_fit', comment: 'Lets goooo' },
  { username: 'priya_reads', comment: 'Been following forever @bookclub' },
  { username: 'noah_waves', comment: 'Surf giveaway yes please @crew' },
  { username: 'emma_bakes', comment: 'Count me in @kitchen @sweets' },
  { username: 'liam_music', comment: 'Huge fan! @band @fans' },
  { username: 'zara_style', comment: 'Need this in my life @fashion' },
  { username: 'omar_codes', comment: 'Thanks for doing this @devs' },
  { username: 'nina_plants', comment: 'Plant mom energy @green' },
  { username: 'tyler_games', comment: 'RNG bless me @guild' },
  { username: 'chloe_sketch', comment: 'Art account here! @draw' },
];

const normalized = normalizeComments(RAW);
export const DUMMY_COMMENTS = normalized.map((c) => ({
  ...c,
  avatarUrl: avatarUrl(c.username),
}));

export const LOAD_DELAY_MS = 900;
