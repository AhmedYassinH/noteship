import type { Lang } from "./dashboard";

export type EditorUiStrings = {
  hintWriteSlash: string;
  importMd: string;
  exportMd: string;
  exportObsidian: string;
  ltr: string;
  rtl: string;
  setLtr: string;
  setRtl: string;
  alignLeft: string;
  alignCenter: string;
  alignRight: string;
  bytesLabel: string;
  kbLabel: string;
  filterSlashCommands: string;
  findBlock: string;
  filterBlockMenuAria: string;
  noMatchingBlocks: string;
  words: string;
  size: string;
  blockActions: string;
  moveUp: string;
  moveDown: string;
  duplicate: string;
  delete: string;
  dragToReorder: string;
  blockActionsTitle: string;
  blockSelectedForDrag: string;
  blockReordered: string;
  pasteVideoUrlPrompt: string;
  unsupportedVideoProvider: string;
  videoUploadsUnsupported: string;
  selectImageFile: string;
  selectPdfFile: string;
  imageUploadLimit: string;
  embeddedPdfLimit: string;
  attachedPdfLimit: string;
  pdfSemanticSearchNote: string;
  uploadExpired: string;
  markdownImportLimit: string;
  markdownImported: string;
  preparingEmbeddedAssets: string;
  commands: {
    paragraph: string;
    heading1: string;
    heading2: string;
    heading3: string;
    bulletList: string;
    numberedList: string;
    quote: string;
    codeBlock: string;
    divider: string;
    embedImage: string;
    attachImage: string;
    embedPdf: string;
    attachPdf: string;
    embedVideoLink: string;
  };
};

export const editorUiCopy: Record<Lang, EditorUiStrings> = {
  en: {
    hintWriteSlash: "Write or type '/'",
    importMd: "Import .md",
    exportMd: "Export .md",
    exportObsidian: "Export Obsidian",
    ltr: "LTR",
    rtl: "RTL",
    setLtr: "Set direction to LTR",
    setRtl: "Set direction to RTL",
    alignLeft: "Align left",
    alignCenter: "Align center",
    alignRight: "Align right",
    bytesLabel: "bytes",
    kbLabel: "KB",
    filterSlashCommands: "Filter slash commands",
    findBlock: "Find block",
    filterBlockMenuAria: "Filter block menu",
    noMatchingBlocks: "No matching blocks",
    words: "Words",
    size: "Size",
    blockActions: "Block actions",
    moveUp: "Move up",
    moveDown: "Move down",
    duplicate: "Duplicate",
    delete: "Delete",
    dragToReorder: "Drag to reorder block",
    blockActionsTitle: "Block actions",
    blockSelectedForDrag: "Block selected. Drag the block in the editor to reorder.",
    blockReordered: "Block reordered.",
    pasteVideoUrlPrompt: "Paste a video URL (YouTube, Vimeo, Loom, or Google Drive preview)",
    unsupportedVideoProvider:
      "Unsupported video provider. Use YouTube, Vimeo, Loom, or Google Drive preview links.",
    videoUploadsUnsupported: "Video uploads are not supported yet. Embed a link instead.",
    selectImageFile: "Please select an image file.",
    selectPdfFile: "Please select a PDF file.",
    imageUploadLimit: "Image uploads are limited to 5 MB per file.",
    embeddedPdfLimit: "Embedded PDFs are limited to 1 MB.",
    attachedPdfLimit: "Attached PDFs are limited to 5 MB.",
    pdfSemanticSearchNote: "PDF content is not available for semantic search yet.",
    uploadExpired: "Upload link expired after 3 minutes. Choose the file again to retry.",
    markdownImportLimit: "Markdown imports are limited to 500 KB.",
    markdownImported: "Markdown imported.",
    preparingEmbeddedAssets: "Preparing embedded assets...",
    commands: {
      paragraph: "Paragraph",
      heading1: "Heading 1",
      heading2: "Heading 2",
      heading3: "Heading 3",
      bulletList: "Bullet List",
      numberedList: "Numbered List",
      quote: "Quote",
      codeBlock: "Code Block",
      divider: "Divider",
      embedImage: "Embed Image",
      attachImage: "Attach Image",
      embedPdf: "Embed PDF",
      attachPdf: "Attach PDF",
      embedVideoLink: "Embed Video Link",
    },
  },
  ar: {
    hintWriteSlash: "اكتب أو استخدم '/'",
    importMd: "استيراد .md",
    exportMd: "تصدير .md",
    exportObsidian: "تصدير Obsidian",
    ltr: "LTR",
    rtl: "RTL",
    setLtr: "تحويل الاتجاه إلى LTR",
    setRtl: "تحويل الاتجاه إلى RTL",
    alignLeft: "محاذاة لليسار",
    alignCenter: "محاذاة للوسط",
    alignRight: "محاذاة لليمين",
    bytesLabel: "بايت",
    kbLabel: "ك.ب",
    filterSlashCommands: "تصفية أوامر /",
    findBlock: "بحث عن كتلة",
    filterBlockMenuAria: "تصفية قائمة الكتل",
    noMatchingBlocks: "لا توجد كتل مطابقة",
    words: "الكلمات",
    size: "الحجم",
    blockActions: "إجراءات الكتلة",
    moveUp: "نقل للأعلى",
    moveDown: "نقل للأسفل",
    duplicate: "نسخ",
    delete: "حذف",
    dragToReorder: "اسحب لإعادة ترتيب الكتلة",
    blockActionsTitle: "إجراءات الكتلة",
    blockSelectedForDrag: "تم تحديد الكتلة. اسحبها داخل المحرر لإعادة الترتيب.",
    blockReordered: "تمت إعادة ترتيب الكتلة.",
    pasteVideoUrlPrompt: "ألصق رابط فيديو (YouTube أو Vimeo أو Loom أو معاينة Google Drive)",
    unsupportedVideoProvider:
      "موفر الفيديو غير مدعوم. استخدم روابط YouTube أو Vimeo أو Loom أو معاينة Google Drive.",
    videoUploadsUnsupported: "رفع الفيديو غير مدعوم حالياً. أدرج رابطاً بدلاً من ذلك.",
    selectImageFile: "يرجى اختيار ملف صورة.",
    selectPdfFile: "يرجى اختيار ملف PDF.",
    imageUploadLimit: "الحد الأقصى لرفع الصور هو 5 ميغابايت لكل ملف.",
    embeddedPdfLimit: "الحد الأقصى لتضمين PDF هو 1 ميغابايت.",
    attachedPdfLimit: "الحد الأقصى لإرفاق PDF هو 5 ميغابايت.",
    pdfSemanticSearchNote: "محتوى PDF غير متاح للبحث الدلالي حالياً.",
    uploadExpired: "انتهت صلاحية رابط الرفع بعد 3 دقائق. اختر الملف مرة أخرى للمحاولة.",
    markdownImportLimit: "الحد الأقصى لاستيراد Markdown هو 500 كيلوبايت.",
    markdownImported: "تم استيراد ملف Markdown.",
    preparingEmbeddedAssets: "جاري تجهيز الأصول المضمنة...",
    commands: {
      paragraph: "فقرة",
      heading1: "عنوان 1",
      heading2: "عنوان 2",
      heading3: "عنوان 3",
      bulletList: "قائمة نقطية",
      numberedList: "قائمة مرقمة",
      quote: "اقتباس",
      codeBlock: "كتلة كود",
      divider: "فاصل",
      embedImage: "تضمين صورة",
      attachImage: "إرفاق صورة",
      embedPdf: "تضمين PDF",
      attachPdf: "إرفاق PDF",
      embedVideoLink: "تضمين رابط فيديو",
    },
  },
};
