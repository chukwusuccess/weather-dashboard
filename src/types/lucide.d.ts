/** Lucide icons loaded from CDN in index.html (global `lucide`). */

interface LucideCreateIconsOptions {
  nameAttr?: string;
  attrs?: Record<string, string>;
  root?: Element | Document;
  inTemplates?: boolean;
}

interface LucideGlobal {
  createIcons(options?: LucideCreateIconsOptions): void;
}

declare const lucide: LucideGlobal;
