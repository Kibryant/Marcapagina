import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import type { Book } from '@marcapagina/shared';
import { forwardRef, useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';
import { FontSize, Radius, Spacing } from '@/constants/Tokens';
import { Button } from './Button';
import { NumberStepper } from './NumberStepper';

interface ReadingLogSheetProps {
  books: Book[];
  onSave: (bookId: string, pages: number) => void;
  loading?: boolean;
}

export const ReadingLogSheet = forwardRef<
  BottomSheetModal,
  ReadingLogSheetProps
>(({ books, onSave, loading = false }, ref) => {
  const [selectedBookIndex, setSelectedBookIndex] = useState(0);
  const [pagesRead, setPagesRead] = useState(10);

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];

  const snapPoints = useMemo(() => ['50%', '75%'], []);

  const currentBook = books[selectedBookIndex];

  const handleSave = () => {
    if (currentBook) {
      onSave(currentBook.id, pagesRead);
    }
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.5}
      />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: theme.bg }}
      handleIndicatorStyle={{ backgroundColor: theme.muted }}
    >
      <BottomSheetView style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            Registrar Leitura
          </Text>
        </View>

        <View style={styles.content}>
          <Text style={[styles.label, { color: theme.mutedForeground }]}>
            Selecione o livro
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.booksRow}
            contentContainerStyle={styles.booksContent}
          >
            {books.map((book, index) => (
              <Pressable
                key={book.id}
                onPress={() => setSelectedBookIndex(index)}
                style={[
                  styles.bookOption,
                  {
                    backgroundColor: theme.surface,
                    borderColor:
                      selectedBookIndex === index
                        ? theme.primary
                        : theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.bookTitle,
                    {
                      color:
                        selectedBookIndex === index ? theme.text : theme.muted,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {book.title}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <NumberStepper
            label="Quantas páginas você leu?"
            value={pagesRead}
            onChange={setPagesRead}
            min={1}
          />

          <Button
            title="Salvar Registro"
            onPress={handleSave}
            loading={loading}
            style={styles.saveButton}
          />
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  contentContainer: {
    padding: Spacing.xl,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '800',
  },
  content: {
    width: '100%',
  },
  label: {
    fontSize: FontSize.md,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  booksRow: {
    marginBottom: Spacing.xl,
  },
  booksContent: {
    paddingRight: Spacing.xl,
  },
  bookOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginRight: Spacing.sm,
    maxWidth: 200,
    justifyContent: 'center',
  },
  bookTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  saveButton: {
    marginTop: Spacing.md,
  },
});
