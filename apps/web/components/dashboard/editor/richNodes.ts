import { Node, mergeAttributes } from "@tiptap/react";
import Paragraph from "@tiptap/extension-paragraph";
import Heading from "@tiptap/extension-heading";
import Image from "@tiptap/extension-image";

export type BlockAlign = "start" | "end" | "left" | "center" | "right";
export type BlockDirection = "ltr" | "rtl";
export type WidthPreset = "small" | "medium" | "full";

type MarkdownWriter = {
  write: (value: string) => void;
  closeBlock: (node: unknown) => void;
};

type SerializedNode = {
  attrs: Record<string, unknown>;
};

const WIDTH_PRESET_TO_MAX_WIDTH: Record<WidthPreset, string> = {
  small: "320px",
  medium: "680px",
  full: "100%",
};

export const parseAlign = (value: unknown): BlockAlign => {
  if (
    value === "start" ||
    value === "end" ||
    value === "left" ||
    value === "center" ||
    value === "right"
  ) {
    return value;
  }
  return "start";
};

export const parseBlockDirection = (value: unknown): BlockDirection | null => {
  if (value === "ltr" || value === "rtl") {
    return value;
  }
  return null;
};

export const parseWidthPreset = (value: unknown): WidthPreset => {
  if (value === "small" || value === "medium" || value === "full") {
    return value;
  }
  return "medium";
};

const encodeDirectiveValue = (value: string): string =>
  value.replaceAll("\\", "\\\\").replaceAll('"', '\\"').replaceAll("\n", " ");

const decodeDirectiveValue = (value: string): string =>
  value.replaceAll('\\"', '"').replaceAll("\\\\", "\\");

const buildDirective = (name: string, attrs: Record<string, string | undefined>): string => {
  const serializedAttrs = Object.entries(attrs)
    .filter(([, value]) => value && value.length > 0)
    .map(([key, value]) => `${key}="${encodeDirectiveValue(value || "")}"`)
    .join(" ");

  return `:::ns-${name}${serializedAttrs ? ` ${serializedAttrs}` : ""} :::`;
};

const stringAttr = (value: unknown, fallback = ""): string =>
  typeof value === "string" && value.length > 0 ? value : fallback;

const DIRECTIVE_RE = /^:::ns-([a-z-]+)\s*(.*?)\s*:::$/;
const DIRECTIVE_ATTR_RE = /([a-zA-Z][a-zA-Z0-9]*)="((?:\\.|[^"\\])*)"/g;

const parseDirectiveLine = (
  line: string,
): { name: string; attrs: Record<string, string> } | null => {
  const match = DIRECTIVE_RE.exec(line.trim());
  if (!match) return null;

  const [, name, rawAttrs] = match;
  const attrs: Record<string, string> = {};
  let attrMatch: RegExpExecArray | null;
  while ((attrMatch = DIRECTIVE_ATTR_RE.exec(rawAttrs)) !== null) {
    attrs[attrMatch[1]] = decodeDirectiveValue(attrMatch[2]);
  }

  return { name, attrs };
};

const escapeHtmlAttribute = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const directiveToEditorHtml = ({
  name,
  attrs,
}: {
  name: string;
  attrs: Record<string, string>;
}): string | null => {
  if (name === "image") {
    return `<img src="${escapeHtmlAttribute(attrs.src || "")}" alt="${escapeHtmlAttribute(
      attrs.alt || "",
    )}" data-width-preset="${parseWidthPreset(attrs.width)}" data-align="${parseAlign(
      attrs.align,
    )}">`;
  }

  if (name === "pdf") {
    return `<div data-type="pdf-embed" src="${escapeHtmlAttribute(
      attrs.src || "",
    )}" title="${escapeHtmlAttribute(attrs.title || "PDF")}" widthPreset="${parseWidthPreset(
      attrs.width,
    )}" align="${parseAlign(attrs.align)}"></div>`;
  }

  if (name === "video-link") {
    const parsed = parseVideoEmbed(attrs.url || "");
    return `<div data-type="video-embed" url="${escapeHtmlAttribute(
      attrs.url || "",
    )}" provider="${escapeHtmlAttribute(attrs.provider || "video")}" embedSrc="${escapeHtmlAttribute(
      parsed?.embedSrc || "",
    )}" widthPreset="${parseWidthPreset(attrs.width)}" align="${parseAlign(attrs.align)}"></div>`;
  }

  if (name === "attachment") {
    return `<div data-type="attachment-block" href="${escapeHtmlAttribute(
      attrs.href || "",
    )}" name="${escapeHtmlAttribute(attrs.name || "Attachment")}" mime="${escapeHtmlAttribute(
      attrs.mime || "application/octet-stream",
    )}" sizeBytes="${escapeHtmlAttribute(attrs.size || "0")}" align="${parseAlign(
      attrs.align,
    )}"></div>`;
  }

  return null;
};

export const noteshipDirectivesToEditorHtml = (markdown: string): string =>
  markdown
    .split(/\r?\n/)
    .map((line) => {
      const directive = parseDirectiveLine(line);
      if (!directive) return line;
      return directiveToEditorHtml(directive) ?? line;
    })
    .join("\n");

const replaceDirectiveParagraphs = (
  element: HTMLElement,
  directiveName: string,
  createElement: (attrs: Record<string, string>) => HTMLElement,
): void => {
  element.querySelectorAll("p").forEach((paragraph) => {
    const directive = parseDirectiveLine(paragraph.textContent || "");
    if (!directive || directive.name !== directiveName) return;
    paragraph.replaceWith(createElement(directive.attrs));
  });
};

const getAlignStyle = (align: BlockAlign): string => {
  if (align === "start") {
    return "text-align:start;";
  }
  if (align === "end") {
    return "text-align:end;";
  }
  return `text-align:${align};`;
};

const getBlockTextStyle = (align: BlockAlign, dir: BlockDirection | null): string => {
  const alignStyle = getAlignStyle(align);
  if (!dir) {
    return alignStyle;
  }
  return `${alignStyle}direction:${dir};unicode-bidi:isolate;`;
};

const getMediaContainerStyle = (align: BlockAlign, widthPreset: WidthPreset): string => {
  const widthStyle = `width:100%;max-width:${WIDTH_PRESET_TO_MAX_WIDTH[widthPreset]};`;

  if (align === "center") {
    return `${widthStyle}margin-left:auto;margin-right:auto;`;
  }
  if (align === "left") {
    return `${widthStyle}margin-left:0;margin-right:auto;`;
  }
  if (align === "right") {
    return `${widthStyle}margin-left:auto;margin-right:0;`;
  }
  if (align === "start") {
    return `${widthStyle}margin-inline-start:0;margin-inline-end:auto;`;
  }
  return `${widthStyle}margin-inline-start:auto;margin-inline-end:0;`;
};

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} bytes`;
  }
  const kb = bytes / 1024;
  return `${kb.toFixed(1)} KB`;
};

export type VideoEmbedInfo = {
  provider: string;
  embedSrc: string;
  canonicalUrl: string;
};

export const parseVideoEmbed = (rawUrl: string): VideoEmbedInfo | null => {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtu.be") {
    const id =
      host === "youtu.be"
        ? url.pathname.split("/").filter(Boolean)[0]
        : url.searchParams.get("v") || url.pathname.split("/").filter(Boolean).pop();
    if (!id) return null;
    return {
      provider: "youtube",
      canonicalUrl: rawUrl,
      embedSrc: `https://www.youtube.com/embed/${id}`,
    };
  }
  if (host === "vimeo.com") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    if (!id) return null;
    return {
      provider: "vimeo",
      canonicalUrl: rawUrl,
      embedSrc: `https://player.vimeo.com/video/${id}`,
    };
  }
  if (host === "loom.com") {
    const parts = url.pathname.split("/").filter(Boolean);
    const id = parts[0] === "share" ? parts[1] : undefined;
    if (!id) return null;
    return { provider: "loom", canonicalUrl: rawUrl, embedSrc: `https://www.loom.com/embed/${id}` };
  }
  if (host === "drive.google.com") {
    const match = url.pathname.match(/\/file\/d\/([^/]+)/);
    const id = match?.[1] || url.searchParams.get("id");
    if (!id) return null;
    return {
      provider: "google-drive",
      canonicalUrl: rawUrl,
      embedSrc: `https://drive.google.com/file/d/${id}/preview`,
    };
  }
  return null;
};

export const toObsidianMarkdown = (markdown: string): string => {
  const lines = markdown.split(/\r?\n/);
  return lines
    .map((line) => {
      const directive = parseDirectiveLine(line.trim());
      if (!directive) return line;

      if (directive.name === "image") {
        const alt = directive.attrs.alt || "image";
        return `![${alt}](${directive.attrs.src || ""})`;
      }
      if (directive.name === "pdf") {
        const title = directive.attrs.title || "PDF";
        return `[${title}](${directive.attrs.src || ""})`;
      }
      if (directive.name === "video-link") {
        const provider = directive.attrs.provider || "video";
        return `[Video (${provider})](${directive.attrs.url || ""})`;
      }
      if (directive.name === "attachment") {
        const name = directive.attrs.name || "attachment";
        const href = directive.attrs.href || "";
        if ((directive.attrs.mime || "").startsWith("image/")) {
          return `![${name}](${href})`;
        }
        return `[${name}](${href})`;
      }
      return line;
    })
    .join("\n");
};

export const AlignedParagraph = Paragraph.extend({
  draggable: true,
  addAttributes() {
    return {
      ...(this.parent?.() || {}),
      align: {
        default: "start",
        parseHTML: (element: HTMLElement) => parseAlign(element.getAttribute("data-align")),
        renderHTML: (attributes: { align?: BlockAlign; dir?: BlockDirection | null }) => {
          const align = parseAlign(attributes.align);
          const dir = parseBlockDirection(attributes.dir);
          return {
            "data-align": align,
            ...(dir ? { "data-dir": dir } : {}),
            style: getBlockTextStyle(align, dir),
          };
        },
      },
      dir: {
        default: null,
        parseHTML: (element: HTMLElement) =>
          parseBlockDirection(element.getAttribute("data-dir") || element.getAttribute("dir")),
      },
    };
  },
});

export const AlignedHeading = Heading.extend({
  draggable: true,
  addAttributes() {
    return {
      ...(this.parent?.() || {}),
      align: {
        default: "start",
        parseHTML: (element: HTMLElement) => parseAlign(element.getAttribute("data-align")),
        renderHTML: (attributes: { align?: BlockAlign; dir?: BlockDirection | null }) => {
          const align = parseAlign(attributes.align);
          const dir = parseBlockDirection(attributes.dir);
          return {
            "data-align": align,
            ...(dir ? { "data-dir": dir } : {}),
            style: getBlockTextStyle(align, dir),
          };
        },
      },
      dir: {
        default: null,
        parseHTML: (element: HTMLElement) =>
          parseBlockDirection(element.getAttribute("data-dir") || element.getAttribute("dir")),
      },
    };
  },
});

export const RichImage = Image.extend({
  addAttributes() {
    return {
      ...(this.parent?.() || {}),
      widthPreset: {
        default: "medium",
        parseHTML: (element: HTMLElement) =>
          parseWidthPreset(element.getAttribute("data-width-preset")),
      },
      align: {
        default: "start",
        parseHTML: (element: HTMLElement) => parseAlign(element.getAttribute("data-align")),
      },
    };
  },
  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }) {
    const align = parseAlign(HTMLAttributes.align);
    const widthPreset = parseWidthPreset(HTMLAttributes.widthPreset);
    const attrs = mergeAttributes(HTMLAttributes, {
      "data-align": align,
      "data-width-preset": widthPreset,
      style: `${getMediaContainerStyle(align, widthPreset)}display:block;height:auto;`,
    });

    return ["img", attrs];
  },
  addStorage() {
    return {
      markdown: {
        serialize(state: MarkdownWriter, node: SerializedNode) {
          state.write(
            buildDirective("image", {
              src: stringAttr(node.attrs.src),
              alt: stringAttr(node.attrs.alt),
              width: parseWidthPreset(node.attrs.widthPreset),
              align: parseAlign(node.attrs.align),
            }),
          );
          state.closeBlock(node);
        },
        parse: {
          updateDOM(element: HTMLElement) {
            replaceDirectiveParagraphs(element, "image", (attrs) => {
              const img = document.createElement("img");
              img.setAttribute("src", attrs.src || "");
              img.setAttribute("alt", attrs.alt || "");
              img.setAttribute("data-width-preset", parseWidthPreset(attrs.width));
              img.setAttribute("data-align", parseAlign(attrs.align));
              return img;
            });
          },
        },
      },
    };
  },
});

export const PdfEmbedNode = Node.create({
  name: "pdfEmbed",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,
  addAttributes() {
    return {
      src: { default: "" },
      title: { default: "PDF" },
      widthPreset: { default: "medium" },
      align: { default: "start" },
    };
  },
  parseHTML() {
    return [{ tag: "div[data-type='pdf-embed']" }];
  },
  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }) {
    const align = parseAlign(HTMLAttributes.align);
    const widthPreset = parseWidthPreset(HTMLAttributes.widthPreset);
    const attrs = mergeAttributes(HTMLAttributes, {
      "data-type": "pdf-embed",
      style: getMediaContainerStyle(align, widthPreset),
      class: "rounded-xl border border-[rgba(15,23,42,0.14)] bg-[#f8fafc] p-3",
    });
    return [
      "div",
      attrs,
      ["div", { class: "mb-2 text-xs text-[#475569]" }, HTMLAttributes.title || "PDF"],
      [
        "iframe",
        {
          src: HTMLAttributes.src,
          class: "h-[360px] w-full rounded-md border border-[rgba(15,23,42,0.12)] bg-white",
        },
      ],
      [
        "div",
        { class: "mt-2 text-[11px] text-[#5b6474]" },
        "PDF content is not available for semantic search yet.",
      ],
    ];
  },
  addStorage() {
    return {
      markdown: {
        serialize(state: MarkdownWriter, node: SerializedNode) {
          state.write(
            buildDirective("pdf", {
              src: stringAttr(node.attrs.src),
              title: stringAttr(node.attrs.title, "PDF"),
              width: parseWidthPreset(node.attrs.widthPreset),
              align: parseAlign(node.attrs.align),
            }),
          );
          state.closeBlock(node);
        },
        parse: {
          updateDOM(element: HTMLElement) {
            replaceDirectiveParagraphs(element, "pdf", (attrs) => {
              const wrapper = document.createElement("div");
              wrapper.setAttribute("data-type", "pdf-embed");
              wrapper.setAttribute("src", attrs.src || "");
              wrapper.setAttribute("title", attrs.title || "PDF");
              wrapper.setAttribute("widthPreset", parseWidthPreset(attrs.width));
              wrapper.setAttribute("align", parseAlign(attrs.align));
              return wrapper;
            });
          },
        },
      },
    };
  },
});

export const VideoEmbedNode = Node.create({
  name: "videoEmbed",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,
  addAttributes() {
    return {
      url: { default: "" },
      embedSrc: { default: "" },
      provider: { default: "video" },
      widthPreset: { default: "medium" },
      align: { default: "start" },
    };
  },
  parseHTML() {
    return [{ tag: "div[data-type='video-embed']" }];
  },
  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }) {
    const align = parseAlign(HTMLAttributes.align);
    const widthPreset = parseWidthPreset(HTMLAttributes.widthPreset);
    const attrs = mergeAttributes(HTMLAttributes, {
      "data-type": "video-embed",
      style: getMediaContainerStyle(align, widthPreset),
      class: "rounded-xl border border-[rgba(15,23,42,0.14)] bg-[#f8fafc] p-3",
    });
    return [
      "div",
      attrs,
      [
        "iframe",
        {
          src: HTMLAttributes.embedSrc,
          class: "h-[320px] w-full rounded-md border border-[rgba(15,23,42,0.12)] bg-black/90",
          allow:
            "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
          allowfullscreen: "true",
        },
      ],
      [
        "a",
        {
          href: HTMLAttributes.url,
          class: "mt-2 inline-block text-xs font-medium text-[var(--ns-accent)] underline",
          target: "_blank",
          rel: "noreferrer",
        },
        "Open original video link",
      ],
    ];
  },
  addStorage() {
    return {
      markdown: {
        serialize(state: MarkdownWriter, node: SerializedNode) {
          state.write(
            buildDirective("video-link", {
              url: stringAttr(node.attrs.url),
              provider: stringAttr(node.attrs.provider, "video"),
              width: parseWidthPreset(node.attrs.widthPreset),
              align: parseAlign(node.attrs.align),
            }),
          );
          state.closeBlock(node);
        },
        parse: {
          updateDOM(element: HTMLElement) {
            replaceDirectiveParagraphs(element, "video-link", (attrs) => {
              const wrapper = document.createElement("div");
              wrapper.setAttribute("data-type", "video-embed");
              wrapper.setAttribute("url", attrs.url || "");
              wrapper.setAttribute("provider", attrs.provider || "video");
              const parsed = parseVideoEmbed(attrs.url || "");
              wrapper.setAttribute("embedSrc", parsed?.embedSrc || "");
              wrapper.setAttribute("widthPreset", parseWidthPreset(attrs.width));
              wrapper.setAttribute("align", parseAlign(attrs.align));
              return wrapper;
            });
          },
        },
      },
    };
  },
});

export const AttachmentBlockNode = Node.create({
  name: "attachmentBlock",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,
  addAttributes() {
    return {
      href: { default: "" },
      name: { default: "Attachment" },
      mime: { default: "application/octet-stream" },
      sizeBytes: { default: "0" },
      align: { default: "start" },
    };
  },
  parseHTML() {
    return [{ tag: "div[data-type='attachment-block']" }];
  },
  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }) {
    const align = parseAlign(HTMLAttributes.align);
    const attrs = mergeAttributes(HTMLAttributes, {
      "data-type": "attachment-block",
      style: `${getMediaContainerStyle(align, "full")}max-width:100%;`,
      class: "rounded-xl border border-[rgba(15,23,42,0.14)] bg-white p-3",
    });
    const isPdf = String(HTMLAttributes.mime || "").toLowerCase() === "application/pdf";
    return [
      "div",
      attrs,
      ["div", { class: "text-xs uppercase tracking-[0.08em] text-[#64748b]" }, "Attachment"],
      [
        "a",
        {
          href: HTMLAttributes.href,
          class:
            "mt-1 inline-flex items-center gap-2 text-sm font-semibold text-[var(--ns-accent)] hover:underline",
          target: "_blank",
          rel: "noreferrer",
        },
        String(HTMLAttributes.name || "Attachment"),
      ],
      [
        "div",
        { class: "mt-1 text-[11px] text-[#64748b]" },
        `${formatBytes(Number(HTMLAttributes.sizeBytes || "0"))} | ${String(HTMLAttributes.mime || "file")}`,
      ],
      isPdf
        ? [
            "div",
            { class: "mt-2 text-[11px] text-[#5b6474]" },
            "PDF content is not available for semantic search yet.",
          ]
        : ["span"],
    ];
  },
  addStorage() {
    return {
      markdown: {
        serialize(state: MarkdownWriter, node: SerializedNode) {
          state.write(
            buildDirective("attachment", {
              href: stringAttr(node.attrs.href),
              name: stringAttr(node.attrs.name, "Attachment"),
              mime: stringAttr(node.attrs.mime, "application/octet-stream"),
              size: String(node.attrs.sizeBytes || "0"),
              align: parseAlign(node.attrs.align),
            }),
          );
          state.closeBlock(node);
        },
        parse: {
          updateDOM(element: HTMLElement) {
            replaceDirectiveParagraphs(element, "attachment", (attrs) => {
              const wrapper = document.createElement("div");
              wrapper.setAttribute("data-type", "attachment-block");
              wrapper.setAttribute("href", attrs.href || "");
              wrapper.setAttribute("name", attrs.name || "Attachment");
              wrapper.setAttribute("mime", attrs.mime || "application/octet-stream");
              wrapper.setAttribute("sizeBytes", attrs.size || "0");
              wrapper.setAttribute("align", parseAlign(attrs.align));
              return wrapper;
            });
          },
        },
      },
    };
  },
});
