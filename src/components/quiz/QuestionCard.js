import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { formatName } from '../../lib/format';
import { colors } from '../../theme';
import { artworkUrl } from '../../lib/sprites';

export const QUIZ_GOOD = '#1E9E6A';
export const QUIZ_BAD = colors.danger;

/** A "Who's that Pokémon?" round: the silhouette (revealed once answered) and four name buttons. */
export default function QuestionCard({ question, picked, onChoose }) {
  const answered = picked != null;
  const isCorrect = answered && picked === question.answer.id;

  return (
    <View>
      <View style={styles.stage}>
        <Image
          key={`${question.answer.id}-${answered}`}
          source={{ uri: artworkUrl(question.answer.id) }}
          style={styles.art}
          contentFit="contain"
          tintColor={answered ? undefined : colors.ink}
          cachePolicy="memory-disk"
        />
      </View>
      <Text style={[styles.result, answered && { color: isCorrect ? QUIZ_GOOD : QUIZ_BAD }]}>
        {!answered ? 'Pick a name' : isCorrect ? "That's right!" : `It's ${formatName(question.answer.name)}`}
      </Text>

      <View style={styles.options}>
        {question.options.map((o) => {
          const isAnswer = o.id === question.answer.id;
          const isPicked = o.id === picked;
          return (
            <Pressable
              key={o.id}
              onPress={() => onChoose(o.id)}
              disabled={answered}
              style={[
                styles.option,
                answered && isAnswer && styles.optionRight,
                answered && isPicked && !isAnswer && styles.optionWrong,
                answered && !isAnswer && !isPicked && styles.optionDim,
              ]}
              accessibilityRole="button"
            >
              <Text style={[styles.optionText, answered && (isAnswer || isPicked) && styles.optionTextOn]}>
                {formatName(o.name)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card, borderRadius: 28, height: 280, marginTop: 14 },
  art: { width: 240, height: 240 },
  result: { textAlign: 'center', fontSize: 18, fontWeight: '800', color: colors.body, marginTop: 16 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  option: { width: '48%', flexGrow: 1, borderRadius: 14, backgroundColor: colors.fill, paddingVertical: 16, alignItems: 'center' },
  optionRight: { backgroundColor: QUIZ_GOOD },
  optionWrong: { backgroundColor: QUIZ_BAD },
  optionDim: { opacity: 0.45 },
  optionText: { fontSize: 16, fontWeight: '700', color: colors.ink },
  optionTextOn: { color: '#fff' },
});
