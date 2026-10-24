// Expo reads app.json first and hands it to this file as `config`. The only thing added here is the
// web base URL, needed when the PWA is hosted under a sub-path (e.g. GitHub Pages at /pokemon_react).
//
//   EXPO_BASE_URL=/pokemon_react yarn build:web
//
// Leave EXPO_BASE_URL unset for native builds and for a site served at the domain root.
module.exports = ({ config }) => {
  const trimmed = (process.env.EXPO_BASE_URL || '').trim().replace(/^\/+|\/+$/g, '');
  if (!trimmed) return config;
  return { ...config, experiments: { ...config.experiments, baseUrl: `/${trimmed}` } };
};
