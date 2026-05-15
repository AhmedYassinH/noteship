export const LINKEDIN_API_MAX_IMAGES_PER_POST = 20;

const DIRECTIVE_RE = /^:::ns-([a-z-]+)\s*(.*?)\s*:::$/gm;
const DIRECTIVE_ATTR_RE = /([a-zA-Z][a-zA-Z0-9]*)="((?:\\.|[^"\\])*)"/g;
const MARKDOWN_IMAGE_RE = /!\[([^\]]*)\]\(([^)]+)\)/g;

const decodeDirectiveValue = (value: string): string =>
  value.replaceAll('\\"', '"').replaceAll("\\\\", "\\");

type ParsedDirective = {
  name: string;
  attrs: Record<string, string>;
};

const parseDirective = (raw: string): ParsedDirective | null => {
  const match = /^:::ns-([a-z-]+)\s*(.*?)\s*:::$/.exec(raw.trim());
  if (!match) return null;

  const [, name, rawAttrs] = match;
  const attrs: Record<string, string> = {};
  let attrMatch: RegExpExecArray | null;
  while ((attrMatch = DIRECTIVE_ATTR_RE.exec(rawAttrs)) !== null) {
    attrs[attrMatch[1]] = decodeDirectiveValue(attrMatch[2]);
  }

  return { name, attrs };
};

type LinkedInImageMedia = {
  type: "image";
  url: string;
  altText?: string;
};

type LinkedInPdfMedia = {
  type: "pdf";
  url: string;
  title?: string;
};

export type LinkedInExtractedMedia = LinkedInImageMedia | LinkedInPdfMedia;

export type LinkedInResolvedMediaManifest =
  | { type: "none" }
  | { type: "images"; images: LinkedInImageMedia[] }
  | { type: "pdf"; pdf: LinkedInPdfMedia };

export type LinkedInMediaValidationErrorCode =
  | "LINKEDIN_MEDIA_MIX_NOT_ALLOWED"
  | "LINKEDIN_MULTIPLE_PDFS_NOT_ALLOWED"
  | "LINKEDIN_TOO_MANY_IMAGES";

export type LinkedInMediaValidationResult =
  | { ok: true; media: LinkedInResolvedMediaManifest }
  | {
      ok: false;
      code: LinkedInMediaValidationErrorCode;
      message: string;
    };

const normalizeUrl = (value: string): string => value.trim();

const dedupeMedia = (items: LinkedInExtractedMedia[]): LinkedInExtractedMedia[] => {
  const seen = new Set<string>();
  const deduped: LinkedInExtractedMedia[] = [];
  for (const item of items) {
    const key = `${item.type}:${item.url}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(item);
  }
  return deduped;
};

export const extractLinkedInMediaFromMarkdown = (markdown: string): LinkedInExtractedMedia[] => {
  const items: LinkedInExtractedMedia[] = [];

  let directiveMatch: RegExpExecArray | null;
  while ((directiveMatch = DIRECTIVE_RE.exec(markdown)) !== null) {
    const parsed = parseDirective(directiveMatch[0]);
    if (!parsed) continue;

    if (parsed.name === "image") {
      const src = normalizeUrl(parsed.attrs.src ?? "");
      if (!src) continue;
      items.push({
        type: "image",
        url: src,
        altText: (parsed.attrs.alt ?? "").trim() || undefined,
      });
      continue;
    }

    if (parsed.name === "pdf") {
      const src = normalizeUrl(parsed.attrs.src ?? "");
      if (!src) continue;
      items.push({
        type: "pdf",
        url: src,
        title: (parsed.attrs.title ?? "").trim() || undefined,
      });
      continue;
    }

    if (parsed.name === "attachment") {
      const href = normalizeUrl(parsed.attrs.href ?? "");
      const mime = (parsed.attrs.mime ?? "").toLowerCase();
      const title = (parsed.attrs.name ?? "").trim() || undefined;
      if (!href) continue;

      if (mime.startsWith("image/")) {
        items.push({ type: "image", url: href, altText: title });
      } else if (mime === "application/pdf") {
        items.push({ type: "pdf", url: href, title });
      }
    }
  }

  let markdownImageMatch: RegExpExecArray | null;
  while ((markdownImageMatch = MARKDOWN_IMAGE_RE.exec(markdown)) !== null) {
    const altText = (markdownImageMatch[1] ?? "").trim() || undefined;
    const src = normalizeUrl(markdownImageMatch[2] ?? "");
    if (!src) continue;
    items.push({ type: "image", url: src, altText });
  }

  return dedupeMedia(items);
};

export const validateLinkedInMediaManifest = (
  extracted: LinkedInExtractedMedia[],
  maxImagesPerPost: number,
): LinkedInMediaValidationResult => {
  const pdfs = extracted.filter((item) => item.type === "pdf");
  const images = extracted.filter((item) => item.type === "image");

  if (pdfs.length > 0 && images.length > 0) {
    return {
      ok: false,
      code: "LINKEDIN_MEDIA_MIX_NOT_ALLOWED",
      message:
        "LinkedIn posts can include either images or one PDF, but not both in the same post.",
    };
  }

  if (pdfs.length > 1) {
    return {
      ok: false,
      code: "LINKEDIN_MULTIPLE_PDFS_NOT_ALLOWED",
      message: "LinkedIn posts support only one PDF document per post.",
    };
  }

  const cappedMax = Math.max(1, Math.min(maxImagesPerPost, LINKEDIN_API_MAX_IMAGES_PER_POST));
  if (images.length > cappedMax) {
    return {
      ok: false,
      code: "LINKEDIN_TOO_MANY_IMAGES",
      message: `Too many images selected (${images.length}/${cappedMax}). Remove extra images before publishing.`,
    };
  }

  if (images.length > 0) {
    return { ok: true, media: { type: "images", images } };
  }

  if (pdfs.length === 1) {
    return { ok: true, media: { type: "pdf", pdf: pdfs[0] } };
  }

  return { ok: true, media: { type: "none" } };
};
