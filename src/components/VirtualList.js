// Virtualized list used by the grids and long lists. FlashList on iOS/Android;
// VirtualList.web.js swaps in FlatList on web, where FlashList adds ~78 KB.
export { FlashList as VirtualList } from '@shopify/flash-list';
