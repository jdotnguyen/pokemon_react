import { File, Paths } from 'expo-file-system';

// Native persistence: one JSON file per key in the app's document directory.
const fileFor = (key) => new File(Paths.document, `pokedex-${key}.json`);

export async function readRaw(key) {
  const file = fileFor(key);
  return file.exists ? file.text() : null;
}

export async function writeRaw(key, json) {
  const file = fileFor(key);
  if (!file.exists) file.create();
  await file.write(json);
}
