const CHINESE_CHARACTER_PATTERN = /[\u3400-\u9fff]/g;
const LATIN_WORD_PATTERN = /[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*/g;
const MARKDOWN_SYNTAX_PATTERN = /[`*_>#\[\]()!|:-]/g;
const MARKDOWN_LINK_PATTERN = /!?\[([^\]]*)\]\([^)]+\)/g;
const MARKDOWN_REFERENCE_LINK_PATTERN = /!?\[([^\]]*)\]\[[^\]]*\]/g;
const MARKDOWN_REFERENCE_DEFINITION_PATTERN = /^[ \t]{0,3}\[[^\]\r\n]+\]:[ \t]*(?:\S+|<[^>\r\n]*>)(?:[ \t]+(?:"[^"\r\n]*"|'[^'\r\n]*'|\([^)\r\n]*\)))?[ \t]*$/gm;
const HTML_COMMENT_PATTERN = /<!--[\s\S]*?-->/g;
const HTML_HIDDEN_CONTENT_PATTERN = /<(script|style)\b[\s\S]*?<\/\1>/gi;
const HTML_TAG_PATTERN = /<[^>]+>/g;
const BARE_URL_PATTERN = /\b(?:https?:\/\/|www\.)\S+/gi;

export const calculateReadingTime = (markdown: string, wordsPerMinute = 350) => {
  const plainText = markdown
    .replace(MARKDOWN_REFERENCE_DEFINITION_PATTERN, " ")
    .replace(MARKDOWN_LINK_PATTERN, " $1 ")
    .replace(MARKDOWN_REFERENCE_LINK_PATTERN, " $1 ")
    .replace(HTML_COMMENT_PATTERN, " ")
    .replace(HTML_HIDDEN_CONTENT_PATTERN, " ")
    .replace(HTML_TAG_PATTERN, " ")
    .replace(BARE_URL_PATTERN, " ")
    .replace(MARKDOWN_SYNTAX_PATTERN, " ");
  const chineseCharacterCount = plainText.match(CHINESE_CHARACTER_PATTERN)?.length ?? 0;
  const latinWordCount = plainText.match(LATIN_WORD_PATTERN)?.length ?? 0;
  const readableUnits = chineseCharacterCount + latinWordCount;

  return Math.max(1, Math.ceil(readableUnits / wordsPerMinute));
};
