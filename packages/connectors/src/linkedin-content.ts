export const LINKEDIN_DEFAULT_MAX_CHARS = 3000;
export const LINKEDIN_DEFAULT_COMMENT_MAX_CHARS = 1250;

const MARKDOWN_LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;
const MARKDOWN_IMAGE_RE = /!\[[^\]]*\]\([^)]+\)/g;
const MARKDOWN_HEADING_RE = /^\s{0,3}#{1,6}\s+/gm;
const MARKDOWN_LIST_RE = /^\s*[-*+]\s+/gm;
const MARKDOWN_NUMBERED_LIST_RE = /^\s*\d+\.\s+/gm;
const MARKDOWN_BLOCKQUOTE_RE = /^\s*>\s?/gm;
const MARKDOWN_CODE_FENCE_RE = /```[\s\S]*?```/g;
const MARKDOWN_INLINE_CODE_RE = /`([^`]+)`/g;
const MARKDOWN_STYLE_RE = /[*_~]/g;

export const normalizeLinkedInContent = (markdown: string): string => {
  const normalized = markdown
    .replace(/\r\n/g, "\n")
    .replace(MARKDOWN_IMAGE_RE, "")
    .replace(MARKDOWN_CODE_FENCE_RE, "")
    .replace(MARKDOWN_LINK_RE, (_, text: string, url: string) => `${text} (${url})`)
    .replace(MARKDOWN_HEADING_RE, "")
    .replace(MARKDOWN_LIST_RE, "- ")
    .replace(MARKDOWN_NUMBERED_LIST_RE, "1. ")
    .replace(MARKDOWN_BLOCKQUOTE_RE, "")
    .replace(MARKDOWN_INLINE_CODE_RE, "$1")
    .replace(MARKDOWN_STYLE_RE, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return normalized;
};

export const validateLinkedInContent = (
  text: string,
  maxChars = LINKEDIN_DEFAULT_MAX_CHARS,
): { ok: true; charCount: number } | { ok: false; charCount: number; reason: string } => {
  const charCount = [...text].length;
  if (charCount === 0) {
    return { ok: false, charCount, reason: "Post content is empty after LinkedIn preprocessing." };
  }

  if (charCount > maxChars) {
    return {
      ok: false,
      charCount,
      reason: `Post exceeds LinkedIn limit (${charCount}/${maxChars} chars).`,
    };
  }

  return { ok: true, charCount };
};

const splitBySentenceOrParagraph = (value: string): string[] =>
  value
    .split(/\n{2,}|(?<=[.!?؟])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

export const splitLinkedInOverflowToComments = (
  text: string,
  maxChars = LINKEDIN_DEFAULT_MAX_CHARS,
  commentMaxChars = LINKEDIN_DEFAULT_COMMENT_MAX_CHARS,
): { root: string; comments: string[] } => {
  const normalized = text.trim();
  if ([...normalized].length <= maxChars) {
    return { root: normalized, comments: [] };
  }

  const units = splitBySentenceOrParagraph(normalized);
  const rootParts: string[] = [];
  let unitIndex = 0;
  let rootLength = 0;

  while (unitIndex < units.length) {
    const unit = units[unitIndex];
    const unitLength = [...unit].length;
    const nextLength = rootLength === 0 ? unitLength : rootLength + 2 + unitLength;
    if (nextLength > maxChars) {
      break;
    }
    rootParts.push(unit);
    rootLength = nextLength;
    unitIndex += 1;
  }

  const root = rootParts.join("\n\n").trim();
  if (!root) {
    throw new Error("Unable to build a valid root post from content.");
  }

  const comments: string[] = [];
  let currentComment = "";
  while (unitIndex < units.length) {
    const unit = units[unitIndex];
    const unitLength = [...unit].length;
    if (unitLength > commentMaxChars) {
      throw new Error(
        `A single paragraph/sentence is too long for LinkedIn comments (${unitLength}/${commentMaxChars}).`,
      );
    }

    const next = currentComment ? `${currentComment}\n\n${unit}` : unit;
    if ([...next].length > commentMaxChars && currentComment) {
      comments.push(currentComment);
      currentComment = unit;
    } else {
      currentComment = next;
    }
    unitIndex += 1;
  }

  if (currentComment) {
    comments.push(currentComment);
  }

  return { root, comments };
};
