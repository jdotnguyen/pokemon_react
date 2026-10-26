import { useCallback } from 'react';
import { FlatList, View } from 'react-native';

/**
 * Web stand-in for FlashList: FlatList with the one layout difference smoothed over. FlashList gives
 * every cell an equal share of the row; FlatList doesn't, so each cell is wrapped at 1/numColumns
 * width (which also keeps an odd last tile at half width, as FlashList does).
 *
 * FlatList's default render window is ~10 screens either side, which would mount (and fetch details for)
 * far more tiles than FlashList does. A one-screen buffer each side keeps it close to FlashList.
 */
export function VirtualList({ numColumns = 1, renderItem, ...props }) {
  const width = `${100 / numColumns}%`;
  const renderCell = useCallback(
    (info) => (numColumns > 1 ? <View style={{ width }}>{renderItem(info)}</View> : renderItem(info)),
    [numColumns, renderItem, width]
  );
  return (
    <FlatList
      numColumns={numColumns}
      renderItem={renderCell}
      windowSize={3}
      initialNumToRender={20}
      maxToRenderPerBatch={10}
      {...props}
    />
  );
}
