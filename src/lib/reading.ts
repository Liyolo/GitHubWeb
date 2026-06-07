const CHINESE_CHARACTER_PATTERN = /[\u3400-\u9fff]/g;
const LATIN_WORD_PATTERN = /[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*/g;
const MARKDOWN_SYNTAX_PATTERN = /[`*_>#\[\]()!|:-]/g;

export const calculateReadingTime = (markdown: string, wordsPerMinute = 350) => {
  const plainText = markdown.replace(MARKDOWN_SYNTAX_PATTERN, " ");
  const chineseCharacterCount = plainText.match(CHINESE_CHARACTER_PATTERN)?.length ?? 0;
  const latinWordCount = plainText.match(LATIN_WORD_PATTERN)?.length ?? 0;
  const readableUnits = chineseCharacterCount + latinWordCount;

  return Math.max(1, Math.ceil(readableUnits / wordsPerMinute));
};
