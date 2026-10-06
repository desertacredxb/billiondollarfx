"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Pilcrow,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Subscript,
  Superscript,
  Link2,
  Link2Off,
  Image as ImageIcon,
  List,
  ListOrdered,
  IndentIncrease,
  IndentDecrease,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Quote,
  Code2,
  Minus,
  Palette,
  Highlighter,
  Eraser,
  Undo,
  Redo,
  ArrowLeft,
  Globe,
  HelpCircle,
  Settings,
  Save,
  Loader2,
  Plus,
  X,
  Calendar,
  FileText,
  Clock,
  Hash,
  Check,
  ToggleLeft,
  ToggleRight,
  Eye,
  ExternalLink,
  PenLine,
  Columns2,
  FileCode,
  Maximize2,
  Minimize2,
  AlertTriangle,
  CheckCircle,
  Trash2,
  ChevronDown,
  Table as TableIcon,
  Type,
} from "lucide-react";

interface FAQ {
  question: string;
  answer: string;
}

interface BlogEditorWorkspaceProps {
  blogId?: string;
}

type ImageSize = "small" | "medium" | "large" | "full" | "custom";

const IMAGE_WIDTHS: Record<Exclude<ImageSize, "custom">, string> = {
  small: "320px",
  medium: "520px",
  large: "760px",
  full: "100%",
};

const escapeAttr = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

const CONTAINER_TAGS = new Set([
  "ul", "ol", "blockquote", "figure", "table", "thead", "tbody", "tfoot",
  "tr", "div", "section", "article",
]);
const LEAF_BLOCK_TAGS = new Set([
  "p", "h1", "h2", "h3", "h4", "h5", "h6", "li", "figcaption", "th", "td", "pre",
]);
const VOID_BLOCK_TAGS = new Set(["hr"]);

/**
 * Pretty-prints editor HTML for the source view: containers are indented,
 * block elements get their own line, inline markup and <pre> content are left
 * untouched so the rendered output doesn't change.
 */
function formatHtml(html: string): string {
  const tokens = html.split(/(<[^>]+>)/g).filter(Boolean);
  const pad = (n: number) => "  ".repeat(Math.max(0, n));
  let out = "";
  let depth = 0;
  let atLineStart = true;
  let inPre = false;

  for (const tok of tokens) {
    const tag = tok.match(/^<\s*(\/)?\s*([a-zA-Z0-9]+)/);

    if (inPre) {
      out += tok;
      if (tag && tag[1] && tag[2].toLowerCase() === "pre") {
        inPre = false;
        atLineStart = true;
      }
      continue;
    }

    if (!tag) {
      // Text node — drop pure whitespace between blocks, keep it inline
      if (!tok.trim()) {
        if (!atLineStart) out += tok;
        continue;
      }
      if (atLineStart) out += `\n${pad(depth)}`;
      out += atLineStart ? tok.replace(/^\s+/, "") : tok;
      atLineStart = false;
      continue;
    }

    const isClose = !!tag[1];
    const name = tag[2].toLowerCase();

    if (CONTAINER_TAGS.has(name)) {
      if (isClose) depth--;
      out += `\n${pad(depth)}${tok}`;
      if (!isClose) depth++;
      atLineStart = true;
    } else if (LEAF_BLOCK_TAGS.has(name)) {
      if (isClose) {
        out += tok;
        atLineStart = true;
      } else {
        out += `\n${pad(depth)}${tok}`;
        atLineStart = false;
        if (name === "pre") inPre = true;
      }
    } else if (VOID_BLOCK_TAGS.has(name)) {
      out += `\n${pad(depth)}${tok}`;
      atLineStart = true;
    } else {
      // Inline tag (a, strong, img, br, span…)
      if (atLineStart) out += `\n${pad(depth)}`;
      out += tok;
      atLineStart = false;
    }
  }

  return out.trim();
}

/** Accepts "400", "400px" or "60%"; returns a CSS width or null if invalid. */
function normalizeWidth(raw: string): string | null {
  const v = raw.trim();
  if (/^\d+$/.test(v)) return `${v}px`;
  if (/^\d+(\.\d+)?(px|%)$/.test(v)) return v;
  return null;
}
type ImageAlign = "left" | "center" | "right";
type ViewMode = "write" | "split" | "preview" | "html";

interface ConfirmState {
  title: string;
  message: React.ReactNode;
  confirmLabel: string;
  tone: "primary" | "danger";
  onConfirm: () => void;
}

const FONT_SIZES_PX = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64];

const BLOCK_FORMATS: { tag: string; label: string; className: string }[] = [
  { tag: "p", label: "Paragraph", className: "text-xs font-medium" },
  { tag: "h1", label: "Heading 1", className: "text-xl font-black" },
  { tag: "h2", label: "Heading 2", className: "text-lg font-black" },
  { tag: "h3", label: "Heading 3", className: "text-base font-bold" },
  { tag: "h4", label: "Heading 4", className: "text-sm font-bold" },
  { tag: "h5", label: "Heading 5", className: "text-xs font-bold" },
  { tag: "h6", label: "Heading 6", className: "text-[11px] font-bold uppercase tracking-wide" },
  { tag: "blockquote", label: "Quote", className: "text-xs italic" },
  { tag: "pre", label: "Code Block", className: "text-xs font-mono" },
];

const TABLE_GRID = 8;

const VIEW_MODES: { key: ViewMode; label: string; icon: React.ReactNode }[] = [
  { key: "write", label: "Write", icon: <PenLine className="w-3.5 h-3.5" /> },
  { key: "split", label: "Split", icon: <Columns2 className="w-3.5 h-3.5" /> },
  { key: "preview", label: "Preview", icon: <Eye className="w-3.5 h-3.5" /> },
  { key: "html", label: "HTML", icon: <FileCode className="w-3.5 h-3.5" /> },
];

/* Shared theme class strings */
const CARD = "bg-[#121829] border border-[#1e293b] rounded-2xl shadow-sm";
const LABEL =
  "block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5";
const INPUT =
  "w-full text-xs text-slate-100 font-semibold bg-[#0a0f1c] border border-[#1e293b] rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:border-[#927948] placeholder:text-slate-500 transition-colors";

/* ---------------------------------------------------------------------- */
/* Small reusable UI primitives                                           */
/* ---------------------------------------------------------------------- */

function Tooltip({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative group/tip inline-flex ${className}`}>
      {children}
      <span className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-[#1e293b] bg-[#0a0f1c] px-2.5 py-1.5 text-[10px] font-bold tracking-wide text-slate-100 opacity-0 shadow-xl transition-opacity duration-150 group-hover/tip:opacity-100">
        {label}
      </span>
    </div>
  );
}

function ToolbarButton({
  icon,
  label,
  onClick,
  onMouseDown,
  active = false,
  disabled = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: (e: React.MouseEvent) => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <Tooltip label={label}>
      <button
        type="button"
        disabled={disabled}
        onMouseDown={(e) => {
          e.preventDefault();
          onMouseDown?.(e);
        }}
        onClick={onClick}
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-30 ${
          active
            ? "bg-[#927948] text-white"
            : "text-slate-400 hover:bg-[#1e293b] hover:text-slate-100"
        }`}
      >
        {icon}
      </button>
    </Tooltip>
  );
}

function ToolbarDivider() {
  return <div className="mx-1 h-5 w-px shrink-0 bg-[#1e293b]" />;
}

/**
 * Themed popover dropdown. Trigger and menu use onMouseDown preventDefault so
 * the editor never loses its text selection while the menu is used.
 */
function Dropdown({
  trigger,
  title,
  children,
  align = "left",
  panelClassName = "",
  className = "",
  triggerClassName,
  onOpen,
  disabled = false,
}: {
  trigger: React.ReactNode;
  title?: string;
  children: (close: () => void) => React.ReactNode;
  align?: "left" | "right";
  panelClassName?: string;
  className?: string;
  triggerClassName?: string;
  onOpen?: () => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        title={title}
        disabled={disabled}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          if (!open) onOpen?.();
          setOpen((v) => !v);
        }}
        className={
          triggerClassName ??
          `flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
            open
              ? "border-[#927948] bg-[#927948]/10 text-[#927948]"
              : "border-[#1e293b] bg-[#0a0f1c] text-slate-200 hover:border-[#927948]/60"
          }`
        }
      >
        {trigger}
        <ChevronDown
          className={`w-3 h-3 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          onMouseDown={(e) => {
            // keep editor selection, but allow typing into inputs inside the menu
            if (!(e.target as HTMLElement).closest("input")) e.preventDefault();
          }}
          className={`absolute top-full z-[55] mt-1.5 rounded-xl border border-[#1e293b] bg-[#121829] p-1.5 shadow-2xl shadow-black/50 animate-scaleUp ${
            align === "right" ? "right-0" : "left-0"
          } ${panelClassName}`}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

function MenuItem({
  children,
  onSelect,
  active = false,
  danger = false,
  disabled = false,
}: {
  children: React.ReactNode;
  onSelect: () => void;
  active?: boolean;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onSelect}
      className={`flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-1.5 text-left transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
        danger
          ? "text-rose-400 hover:bg-rose-500/10"
          : active
            ? "bg-[#927948]/15 text-[#927948]"
            : "text-slate-200 hover:bg-[#1e293b]"
      }`}
    >
      <span className="min-w-0 flex-1">{children}</span>
      {active && <Check className="w-3.5 h-3.5 shrink-0" />}
    </button>
  );
}

/** Themed replacement for a native <select>. */
function ThemedSelect<T extends string>({
  value,
  options,
  onChange,
  placeholder = "Select…",
  className = "",
  fullWidth = false,
}: {
  value: T | "";
  options: { value: T; label: string; dot?: string }[];
  onChange: (v: T) => void;
  placeholder?: string;
  className?: string;
  fullWidth?: boolean;
}) {
  const current = options.find((o) => o.value === value);
  return (
    <Dropdown
      className={`${fullWidth ? "w-full" : ""} ${className}`}
      panelClassName={fullWidth ? "w-full" : "min-w-[180px]"}
      align={fullWidth ? "left" : "right"}
      triggerClassName={`flex items-center justify-between gap-2 rounded-xl border border-[#1e293b] bg-[#0a0f1c] px-3.5 py-2.5 text-xs font-bold text-slate-200 hover:border-[#927948]/60 transition-colors cursor-pointer ${
        fullWidth ? "w-full" : ""
      }`}
      trigger={
        <span className="flex items-center gap-2 truncate">
          {current?.dot && (
            <span className={`w-2 h-2 rounded-full ${current.dot}`} />
          )}
          {current ? (
            current.label
          ) : (
            <span className="text-slate-500">{placeholder}</span>
          )}
        </span>
      }
    >
      {(close) =>
        options.map((o) => (
          <MenuItem
            key={o.value}
            active={o.value === value}
            onSelect={() => {
              onChange(o.value);
              close();
            }}
          >
            <span className="flex items-center gap-2 text-xs font-bold">
              {o.dot && <span className={`w-2 h-2 rounded-full ${o.dot}`} />}
              {o.label}
            </span>
          </MenuItem>
        ))
      }
    </Dropdown>
  );
}

function ToggleRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="flex w-full items-center justify-between gap-3 rounded-xl border border-[#1e293b] bg-[#0a0f1c] px-3.5 py-2.5 text-left transition-colors hover:border-[#927948]/50 cursor-pointer"
    >
      <span>
        <span className="block text-xs font-bold text-slate-200">{label}</span>
        {hint && (
          <span className="block text-[10px] font-semibold text-slate-500">
            {hint}
          </span>
        )}
      </span>
      {value ? (
        <ToggleRight className="w-6 h-6 text-[#927948] shrink-0" />
      ) : (
        <ToggleLeft className="w-6 h-6 text-slate-600 shrink-0" />
      )}
    </button>
  );
}

function ConfirmDialog({
  state,
  onCancel,
}: {
  state: ConfirmState;
  onCancel: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const danger = state.tone === "danger";
  return (
    <div className="fixed inset-0 z-[70] bg-[#0a0f1c]/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#121829] rounded-2xl border border-[#1e293b] shadow-2xl max-w-sm w-full p-6 space-y-4 animate-scaleUp">
        <div
          className={`flex items-center gap-3 ${danger ? "text-rose-400" : "text-[#927948]"}`}
        >
          {danger ? (
            <AlertTriangle className="w-6 h-6 shrink-0" />
          ) : (
            <CheckCircle className="w-6 h-6 shrink-0" />
          )}
          <h3 className="text-sm font-black tracking-tight text-white">
            {state.title}
          </h3>
        </div>
        <div className="text-xs text-slate-400 font-medium leading-relaxed">
          {state.message}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-bold bg-[#1e293b] hover:bg-[#2e3d52] text-slate-200 px-4 py-2 rounded-xl cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            autoFocus
            onClick={state.onConfirm}
            className={`text-xs font-black uppercase text-white px-4 py-2 rounded-xl tracking-wider cursor-pointer ${
              danger
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-[#927948] hover:bg-[#a68c56]"
            }`}
          >
            {state.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Main component                                                         */
/* ---------------------------------------------------------------------- */

export default function BlogEditorWorkspace({
  blogId,
}: BlogEditorWorkspaceProps) {
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const hasInitializedContent = useRef(false);
  const pendingContentRef = useRef<string | null>(null);

  const [loading, setLoading] = useState(blogId ? true : false);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "content" | "seo" | "faqs" | "publish"
  >("content");
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [stats, setStats] = useState({ words: 0, chars: 0 });

  // Editor view state
  const [viewMode, setViewMode] = useState<ViewMode>("write");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [contentHtml, setContentHtml] = useState("");
  const [htmlSource, setHtmlSource] = useState("");
  const [currentBlock, setCurrentBlock] = useState("p");
  const [customFontPx, setCustomFontPx] = useState("");
  const [tableHover, setTableHover] = useState({ rows: 0, cols: 0 });
  const [tableWithHeader, setTableWithHeader] = useState(true);
  const [tableCell, setTableCell] = useState<HTMLTableCellElement | null>(null);

  // Confirmation + unsaved-changes tracking
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const markDirty = useCallback(() => setIsDirty(true), []);

  // Modal state (replaces window.prompt / window.alert everywhere)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageSourceMode, setImageSourceMode] = useState<"url" | "upload">(
    "url",
  );
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [imageAltInput, setImageAltInput] = useState("");
  const [imageCaptionInput, setImageCaptionInput] = useState("");
  const [imageSize, setImageSize] = useState<ImageSize>("medium");
  const [imageCustomWidth, setImageCustomWidth] = useState("");
  const [imageAlign, setImageAlign] = useState<ImageAlign>("center");
  const [imageTitleInput, setImageTitleInput] = useState("");
  const [imageLinkInput, setImageLinkInput] = useState("");
  const [imageLinkNewTab, setImageLinkNewTab] = useState(true);
  const [imageRounded, setImageRounded] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // When set, the image modal edits this existing element instead of inserting
  const editingImageRef = useRef<HTMLElement | null>(null);
  const [isEditingImage, setIsEditingImage] = useState(false);

  const selectedFilePreview = useMemo(
    () => (selectedFile ? URL.createObjectURL(selectedFile) : null),
    [selectedFile],
  );
  useEffect(
    () => () => {
      if (selectedFilePreview) URL.revokeObjectURL(selectedFilePreview);
    },
    [selectedFilePreview],
  );

  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrlInput, setLinkUrlInput] = useState("");
  const [linkTextInput, setLinkTextInput] = useState("");
  const [linkNewTab, setLinkNewTab] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    shortDescription: "",
    category: "",
    coverImage: "",
    coverAlt: "",
    status: "draft" as "draft" | "published" | "archived",
    author: "Admin Panel",
    tagsString: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywordsString: "",
    canonicalUrl: "",
    scheduledAt: "",
    featured: false,
    allowComments: true,
  });
  const [faqs, setFaqs] = useState<FAQ[]>([]);

  useEffect(() => {
    if (blogId) fetchBlogDetails();
  }, [blogId]);

  // Warn before closing/reloading the tab with unsaved changes
  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  // Esc exits fullscreen (when no dialog is open)
  useEffect(() => {
    if (!isFullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (
        e.key === "Escape" &&
        !confirmState &&
        !isImageModalOpen &&
        !isLinkModalOpen
      ) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isFullscreen, confirmState, isImageModalOpen, isLinkModalOpen]);

  const fetchBlogDetails = async () => {
    try {
      const res = await fetch(`/api/blogs/${blogId}`);
      const data = await res.json();
      if (data.success) {
        const blog = data.data || data;
        setFormData({
          title: blog.title,
          slug: blog.slug || slugify(blog.title || ""),
          shortDescription: blog.shortDescription,
          category: blog.category,
          coverImage: blog.coverImage,
          coverAlt: blog.coverAlt || "",
          status: blog.status,
          author: blog.author || "Admin Panel",
          tagsString: blog.tags?.join(", ") || "",
          metaTitle: blog.metaTitle || "",
          metaDescription: blog.metaDescription || "",
          metaKeywordsString: blog.metaKeywords?.join(", ") || "",
          canonicalUrl: blog.canonicalUrl || "",
          scheduledAt: blog.scheduledAt ? blog.scheduledAt.slice(0, 16) : "",
          featured: !!blog.featured,
          allowComments: blog.allowComments !== false,
        });
        setSlugTouched(!!blog.slug);
        setFaqs(blog.faqs || []);
        // The editor isn't mounted yet (loading screen is showing), so stash the
        // content and inject it once the editor renders — see effect below.
        pendingContentRef.current = blog.content || "";
      } else {
        triggerAlert("error", "Failed to retrieve article details.");
      }
    } catch (err) {
      triggerAlert("error", "Network sync configuration failure.");
    } finally {
      setLoading(false);
    }
  };

  const triggerAlert = (type: "success" | "error", message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  function slugify(text: string) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  /* ------------------------- Editor stats (word/char/read time) + preview sync ------------------------- */
  const updateStats = useCallback(() => {
    const text = editorRef.current?.innerText?.trim() || "";
    const words = text.length ? text.split(/\s+/).length : 0;
    setStats({ words, chars: text.length });
  }, []);

  const syncContent = useCallback(() => {
    updateStats();
    setContentHtml(editorRef.current?.innerHTML || "");
  }, [updateStats]);

  // Load fetched article content into the editor once it has mounted
  useEffect(() => {
    if (loading || pendingContentRef.current === null || !editorRef.current)
      return;
    editorRef.current.innerHTML = pendingContentRef.current;
    pendingContentRef.current = null;
    hasInitializedContent.current = true;
    syncContent();
  }, [loading, syncContent]);

  const readTimeMinutes = useMemo(
    () => Math.max(1, Math.round(stats.words / 200)),
    [stats.words],
  );

  /* ------------------------- View mode switching ------------------------- */
  const switchViewMode = (mode: ViewMode) => {
    if (mode === viewMode) return;
    const editor = editorRef.current;
    // Leaving HTML mode: push edited source back into the rich editor
    if (viewMode === "html" && editor) {
      editor.innerHTML = htmlSource;
      syncContent();
    }
    // Entering HTML mode: load current editor markup into the source view
    if (mode === "html") {
      setHtmlSource(formatHtml(editor?.innerHTML || ""));
    }
    setViewMode(mode);
  };

  /* ------------------------- Selection save/restore (fixes lost-focus insert bugs) ------------------------- */
  const saveSelection = useCallback(() => {
    const sel = window.getSelection();
    if (
      sel &&
      sel.rangeCount > 0 &&
      editorRef.current &&
      editorRef.current.contains(sel.anchorNode)
    ) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
      // Reflect the caret's block type (p / h1…h6 / blockquote / pre) in the toolbar
      const block = (document.queryCommandValue("formatBlock") || "")
        .toLowerCase()
        .replace(/[<>]/g, "");
      setCurrentBlock(block || "p");
    }
  }, []);

  /** Returns the current selection range inside the editor (live or last saved). */
  const getEditorRange = useCallback((): Range | null => {
    const editor = editorRef.current;
    if (!editor) return null;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editor.contains(sel.anchorNode)) {
      return sel.getRangeAt(0);
    }
    if (
      savedRangeRef.current &&
      editor.contains(savedRangeRef.current.startContainer)
    ) {
      return savedRangeRef.current;
    }
    return null;
  }, []);

  const restoreSelection = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const range = getEditorRange();
    editor.focus();
    if (range) {
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [getEditorRange]);

  const insertHtmlAtCursor = useCallback(
    (html: string) => {
      const editor = editorRef.current;
      if (!editor) return;
      editor.focus();
      const sel = window.getSelection();
      const range =
        savedRangeRef.current &&
        editor.contains(savedRangeRef.current.startContainer)
          ? savedRangeRef.current
          : (() => {
              const r = document.createRange();
              r.selectNodeContents(editor);
              r.collapse(false);
              return r;
            })();
      sel?.removeAllRanges();
      sel?.addRange(range);
      document.execCommand("insertHTML", false, html);
      savedRangeRef.current = null;
      syncContent();
      markDirty();
    },
    [syncContent, markDirty],
  );

  const executeCommand = (command: string, value: string = "") => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    syncContent();
    markDirty();
  };

  const applyColor = (command: "foreColor" | "hiliteColor", color: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    const sel = window.getSelection();
    if (
      savedRangeRef.current &&
      editor.contains(savedRangeRef.current.startContainer)
    ) {
      sel?.removeAllRanges();
      sel?.addRange(savedRangeRef.current);
    }
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand(
      command,
      false,
      color === "transparent" ? "inherit" : color,
    );
    syncContent();
    markDirty();
  };

  const applyBlockFormat = (tag: string) => {
    restoreSelection();
    document.execCommand("formatBlock", false, `<${tag}>`);
    setCurrentBlock(tag);
    syncContent();
    markDirty();
  };

  /**
   * execCommand("fontSize") only supports 1–7, so apply size 7 as a marker and
   * swap every resulting <font size="7"> for a span with the exact pixel size.
   */
  const applyFontSizePx = (px: number) => {
    const editor = editorRef.current;
    if (!editor || !px || px < 6 || px > 200) return;
    restoreSelection();
    document.execCommand("styleWithCSS", false, "false");
    document.execCommand("fontSize", false, "7");
    editor.querySelectorAll('font[size="7"]').forEach((font) => {
      const span = document.createElement("span");
      span.style.fontSize = `${px}px`;
      span.innerHTML = font.innerHTML;
      font.replaceWith(span);
    });
    syncContent();
    markDirty();
  };

  /* ------------------------- Tables ------------------------- */
  const getCurrentCell = (): HTMLTableCellElement | null => {
    const range = getEditorRange();
    if (!range) return null;
    let node: Node | null = range.startContainer;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;
    const cell = (node as HTMLElement | null)?.closest?.("td, th") as
      | HTMLTableCellElement
      | null;
    return cell && editorRef.current?.contains(cell) ? cell : null;
  };

  const insertTable = (rows: number, cols: number) => {
    const cellStyle = 'style="border:1px solid #1e293b;padding:8px 12px;"';
    const head = tableWithHeader
      ? `<thead><tr>${Array.from({ length: cols }, (_, i) => `<th ${cellStyle}>Header ${i + 1}</th>`).join("")}</tr></thead>`
      : "";
    const bodyRows = Array.from(
      { length: rows },
      () =>
        `<tr>${Array.from({ length: cols }, () => `<td ${cellStyle}><br></td>`).join("")}</tr>`,
    ).join("");
    insertHtmlAtCursor(
      `<table style="width:100%;border-collapse:collapse;">${head}<tbody>${bodyRows}</tbody></table><p><br></p>`,
    );
  };

  const afterTableEdit = () => {
    syncContent();
    markDirty();
    setTableCell(null);
  };

  const newCellLike = (ref: HTMLTableCellElement, inHead: boolean) => {
    const cell = document.createElement(inHead ? "th" : "td");
    cell.setAttribute("style", ref.getAttribute("style") || "");
    cell.innerHTML = "<br>";
    return cell;
  };

  const addTableRow = (cell: HTMLTableCellElement, below: boolean) => {
    const row = cell.parentElement as HTMLTableRowElement;
    const table = row.closest("table");
    if (!table) return;
    const newRow = document.createElement("tr");
    Array.from(row.cells).forEach((c) => newRow.appendChild(newCellLike(c, false)));
    if (row.parentElement?.tagName === "THEAD") {
      // Rows added from the header always go to the top of the body
      const body = table.tBodies[0] || table.appendChild(document.createElement("tbody"));
      body.prepend(newRow);
    } else if (below) {
      row.after(newRow);
    } else {
      row.before(newRow);
    }
    afterTableEdit();
  };

  const addTableColumn = (cell: HTMLTableCellElement, right: boolean) => {
    const table = cell.closest("table");
    if (!table) return;
    const idx = cell.cellIndex;
    Array.from(table.rows).forEach((row) => {
      const ref = row.cells[Math.min(idx, row.cells.length - 1)];
      if (!ref) return;
      const fresh = newCellLike(ref, row.parentElement?.tagName === "THEAD");
      if (fresh.tagName === "TH") fresh.textContent = "Header";
      if (right) ref.after(fresh);
      else ref.before(fresh);
    });
    afterTableEdit();
  };

  const deleteTableRow = (cell: HTMLTableCellElement) => {
    const table = cell.closest("table");
    const row = cell.parentElement;
    if (!table || !row) return;
    if (table.rows.length <= 1) table.remove();
    else row.remove();
    afterTableEdit();
  };

  const deleteTableColumn = (cell: HTMLTableCellElement) => {
    const table = cell.closest("table");
    if (!table) return;
    const idx = cell.cellIndex;
    if ((cell.parentElement as HTMLTableRowElement).cells.length <= 1) {
      table.remove();
    } else {
      Array.from(table.rows).forEach((row) => row.cells[idx]?.remove());
    }
    afterTableEdit();
  };

  const requestDeleteTable = (cell: HTMLTableCellElement) => {
    const table = cell.closest("table");
    if (!table) return;
    setConfirmState({
      title: "Delete Table?",
      message: "The whole table and its contents will be removed.",
      confirmLabel: "Delete",
      tone: "danger",
      onConfirm: () => {
        table.remove();
        afterTableEdit();
        setConfirmState(null);
      },
    });
  };

  /* ------------------------- Link modal ------------------------- */
  const openLinkModal = () => {
    saveSelection();
    const sel = window.getSelection();
    const selectedText = sel && sel.rangeCount > 0 ? sel.toString() : "";
    setLinkTextInput(selectedText);
    setLinkUrlInput("");
    setLinkNewTab(true);
    setIsLinkModalOpen(true);
  };

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrlInput.trim()) return;
    const safeText = (linkTextInput.trim() || linkUrlInput.trim())
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    const targetAttrs = linkNewTab
      ? ' target="_blank" rel="noopener noreferrer"'
      : "";
    const html = `<a href="${linkUrlInput.trim()}"${targetAttrs} class="text-[#927948] underline underline-offset-2 font-semibold">${safeText}</a>&nbsp;`;
    insertHtmlAtCursor(html);
    setIsLinkModalOpen(false);
  };

  const removeLink = () => {
    editorRef.current?.focus();
    document.execCommand("unlink");
    syncContent();
    markDirty();
  };

  /* ------------------------- Image modal (with Blogger-style size / alignment) ------------------------- */
  const resetImageForm = () => {
    setImageUrlInput("");
    setImageAltInput("");
    setImageCaptionInput("");
    setImageTitleInput("");
    setImageLinkInput("");
    setImageLinkNewTab(true);
    setImageRounded(true);
    setImageSize("medium");
    setImageCustomWidth("");
    setImageAlign("center");
    setSelectedFile(null);
    setImageSourceMode("url");
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    setSelectedFile(null);
    editingImageRef.current = null;
    setIsEditingImage(false);
  };

  const openImageModal = () => {
    saveSelection();
    resetImageForm();
    editingImageRef.current = null;
    setIsEditingImage(false);
    setIsImageModalOpen(true);
  };

  /** Opens the image modal pre-filled from an image already in the editor. */
  const openImageEditor = (el: HTMLElement) => {
    const img = (el.tagName === "IMG" ? el : el.querySelector("img")) as
      | HTMLImageElement
      | null;
    if (!img) return;

    resetImageForm();
    setImageUrlInput(img.getAttribute("src") || "");
    setImageAltInput(img.getAttribute("alt") || "");
    setImageTitleInput(img.getAttribute("title") || "");
    setImageCaptionInput(el.querySelector("figcaption")?.textContent || "");
    setImageRounded(
      el.dataset.rounded ? el.dataset.rounded === "true" : img.classList.contains("rounded-xl"),
    );

    const anchor = img.closest("a");
    if (anchor && el.contains(anchor)) {
      setImageLinkInput(anchor.getAttribute("href") || "");
      setImageLinkNewTab(anchor.getAttribute("target") === "_blank");
    }

    // Size: prefer data attribute, otherwise infer from max-width
    const width = el.style.maxWidth || img.style.maxWidth || "";
    const preset = (Object.keys(IMAGE_WIDTHS) as (keyof typeof IMAGE_WIDTHS)[]).find(
      (k) => IMAGE_WIDTHS[k] === width,
    );
    const dataSize = el.dataset.size as ImageSize | undefined;
    if (dataSize === "custom" || (!dataSize && !preset && width)) {
      setImageSize("custom");
      setImageCustomWidth(width);
    } else {
      setImageSize(dataSize || preset || "medium");
    }

    // Alignment: prefer data attribute, otherwise infer from float
    const dataAlign = el.dataset.align as ImageAlign | undefined;
    const float = el.style.cssFloat || "";
    setImageAlign(
      dataAlign ||
        (float === "left" || el.classList.contains("float-left")
          ? "left"
          : float === "right" || el.classList.contains("float-right")
            ? "right"
            : "center"),
    );

    editingImageRef.current = el;
    setIsEditingImage(true);
    setIsImageModalOpen(true);
  };

  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const el =
      (target.closest("figure") as HTMLElement | null) ||
      (target.tagName === "IMG" ? target : null);
    if (el && editorRef.current?.contains(el)) {
      e.preventDefault();
      openImageEditor(el);
    }
  };

  const requestDeleteImage = () => {
    const el = editingImageRef.current;
    if (!el) return;
    setConfirmState({
      title: "Delete Image?",
      message: "This image will be removed from the article.",
      confirmLabel: "Delete",
      tone: "danger",
      onConfirm: () => {
        el.remove();
        syncContent();
        markDirty();
        setConfirmState(null);
        closeImageModal();
      },
    });
  };

  const buildFigureHtml = (src: string, width: string) => {
    const alignStyle =
      imageAlign === "left"
        ? "float:left;margin:0.25rem 1.5rem 1rem 0;"
        : imageAlign === "right"
          ? "float:right;margin:0.25rem 0 1rem 1.5rem;"
          : "margin:1.5rem auto;";
    const alignClass =
      imageAlign === "left"
        ? "float-left mr-6 mb-4 mt-1"
        : imageAlign === "right"
          ? "float-right ml-6 mb-4 mt-1"
          : "mx-auto my-6";

    const title = imageTitleInput.trim();
    const caption = imageCaptionInput.trim();
    const link = imageLinkInput.trim();

    let imgTag =
      `<img src="${escapeAttr(src)}" alt="${escapeAttr(imageAltInput)}"` +
      (title ? ` title="${escapeAttr(title)}"` : "") +
      ` loading="lazy" style="width:100%;height:auto;display:block;${imageRounded ? "border-radius:0.75rem;" : ""}"` +
      ` class="${imageRounded ? "rounded-xl " : ""}border border-[#1e293b] shadow-sm" />`;

    if (link) {
      const target = imageLinkNewTab
        ? ' target="_blank" rel="noopener noreferrer"'
        : "";
      imgTag = `<a href="${escapeAttr(link)}"${target}>${imgTag}</a>`;
    }

    return (
      `<figure contenteditable="false" data-size="${imageSize}" data-align="${imageAlign}" data-rounded="${imageRounded}"` +
      ` class="${alignClass}" style="max-width:${width};width:100%;${alignStyle}">` +
      imgTag +
      (caption
        ? `<figcaption class="text-[11px] text-slate-400 text-center mt-2 font-semibold">${caption.replace(/</g, "&lt;")}</figcaption>`
        : "") +
      `</figure>`
    );
  };

  const handleImageInsertionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let width: string;
    if (imageSize === "custom") {
      const w = normalizeWidth(imageCustomWidth);
      if (!w) {
        triggerAlert("error", "Custom width must look like 400, 400px or 60%.");
        return;
      }
      width = w;
    } else {
      width = IMAGE_WIDTHS[imageSize];
    }

    let finalImageUrl = imageUrlInput.trim();

    if (imageSourceMode === "upload" && selectedFile) {
      setUploadingImage(true);
      const data = new FormData();
      data.append("file", selectedFile);
      try {
        const res = await fetch("/api/blogs/upload", {
          method: "POST",
          body: data,
        });
        const resData = await res.json();
        if (resData.success) {
          finalImageUrl = resData.url;
        } else {
          throw new Error(resData.error || "Cloudinary sync failure");
        }
      } catch (err: any) {
        triggerAlert("error", `Image upload failed: ${err.message}`);
        setUploadingImage(false);
        return;
      }
      setUploadingImage(false);
    }

    if (!finalImageUrl) {
      triggerAlert("error", "Provide an image URL or choose a file to upload.");
      return;
    }

    const figureHtml = buildFigureHtml(finalImageUrl, width);
    const existing = editingImageRef.current;

    if (existing && editorRef.current?.contains(existing)) {
      // Replace the edited image in place (and its wrapping link, if it was a bare <img> in an <a>)
      const parent = existing.parentElement;
      const target =
        existing.tagName === "IMG" &&
        parent?.tagName === "A" &&
        parent.childElementCount === 1
          ? parent
          : existing;
      target.outerHTML = figureHtml;
      syncContent();
      markDirty();
    } else {
      insertHtmlAtCursor(`${figureHtml}<p><br></p>`);
    }

    closeImageModal();
    resetImageForm();
  };

  const handleCoverImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCover(true);
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch("/api/blogs/upload", {
        method: "POST",
        body: data,
      });
      const resData = await res.json();
      if (resData.success) {
        setFormData((prev) => ({ ...prev, coverImage: resData.url }));
        markDirty();
        triggerAlert("success", "Cover image uploaded to Cloudinary.");
      } else {
        throw new Error(resData.error);
      }
    } catch (err: any) {
      triggerAlert("error", `Cover upload execution error: ${err.message}`);
    } finally {
      setUploadingCover(false);
    }
  };

  /* ------------------------- Form field handlers ------------------------- */
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    markDirty();
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "title" && !slugTouched) {
        next.slug = slugify(value);
      }
      return next;
    });
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlugTouched(true);
    markDirty();
    setFormData((prev) => ({ ...prev, slug: slugify(e.target.value) }));
  };

  const handleFaqChange = (index: number, field: keyof FAQ, value: string) => {
    const updated = [...faqs];
    updated[index][field] = value;
    setFaqs(updated);
    markDirty();
  };

  /* ------------------------- Confirmed actions ------------------------- */
  const closeConfirm = useCallback(() => setConfirmState(null), []);

  const requestBack = () => {
    if (!isDirty) {
      router.push("/blog-management");
      return;
    }
    setConfirmState({
      title: "Discard Unsaved Changes?",
      message:
        "You have unsaved edits on this article. Leaving now will discard them.",
      confirmLabel: "Discard & Leave",
      tone: "danger",
      onConfirm: () => {
        setConfirmState(null);
        setIsDirty(false);
        router.push("/blog-management");
      },
    });
  };

  const requestRemoveFaq = (index: number) => {
    const faq = faqs[index];
    setConfirmState({
      title: "Remove FAQ?",
      message: (
        <>
          Remove FAQ #{index + 1}
          {faq.question && (
            <>
              {" "}
              <span className="font-bold text-slate-200">
                "{faq.question}"
              </span>
            </>
          )}
          ? This can't be undone.
        </>
      ),
      confirmLabel: "Remove",
      tone: "danger",
      onConfirm: () => {
        setFaqs((prev) => prev.filter((_, i) => i !== index));
        markDirty();
        setConfirmState(null);
      },
    });
  };

  const getCurrentHtml = () =>
    viewMode === "html" ? htmlSource : editorRef.current?.innerHTML || "";

  const validateBeforeSave = () => {
    const htmlContent = getCurrentHtml();
    if (!htmlContent || htmlContent === "<br>") {
      triggerAlert(
        "error",
        "The core article content editor canvas cannot be empty.",
      );
      setActiveTab("content");
      return false;
    }
    if (!formData.title.trim()) {
      triggerAlert("error", "Blog title is required.");
      setActiveTab("content");
      return false;
    }
    return true;
  };

  const requestSave = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validateBeforeSave()) return;

    const copy: Record<
      typeof formData.status,
      { title: string; message: string; label: string }
    > = {
      published: {
        title: "Publish Article?",
        message: `This article will be live on the website${
          formData.slug ? ` at /blogs/${formData.slug}` : ""
        } and visible to all visitors.`,
        label: "Publish",
      },
      draft: {
        title: "Save as Draft?",
        message:
          "The article will be saved as a draft and won't be visible on the website.",
        label: "Save Draft",
      },
      archived: {
        title: "Archive Article?",
        message:
          "The article will be saved as archived and hidden from the website.",
        label: "Archive",
      },
    };
    const c = copy[formData.status];

    setConfirmState({
      title: c.title,
      message: c.message,
      confirmLabel: c.label,
      tone: "primary",
      onConfirm: () => {
        setConfirmState(null);
        performSave();
      },
    });
  };

  const performSave = async () => {
    setActionLoading(true);
    const htmlContent = getCurrentHtml();

    const payload = {
      ...formData,
      content: htmlContent,
      tags: formData.tagsString
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      metaKeywords: formData.metaKeywordsString
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
      faqs: faqs.filter((f) => f.question && f.answer),
      readTimeMinutes,
      wordCount: stats.words,
    };

    try {
      const url = blogId ? `/api/blogs/${blogId}` : "/api/blogs";
      const method = blogId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        setIsDirty(false);
        triggerAlert("success", "Blog data structures committed successfully.");
        setTimeout(() => router.push("/blog-management"), 1200);
      } else {
        throw new Error(data.error || "Execution module error.");
      }
    } catch (err: any) {
      triggerAlert("error", err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0f1c] flex flex-col items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500">
        <Loader2 className="w-8 h-8 text-[#927948] animate-spin" />
        <span>Loading Workspace Matrix...</span>
      </div>
    );
  }

  const tabs: {
    key: typeof activeTab;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      key: "content",
      label: "Content",
      icon: <Settings className="w-3.5 h-3.5" />,
    },
    {
      key: "seo",
      label: "SEO Metadata",
      icon: <Globe className="w-3.5 h-3.5" />,
    },
    {
      key: "faqs",
      label: `FAQs (${faqs.length})`,
      icon: <HelpCircle className="w-3.5 h-3.5" />,
    },
    {
      key: "publish",
      label: "Publishing",
      icon: <Calendar className="w-3.5 h-3.5" />,
    },
  ];

  const showEditor = viewMode === "write" || viewMode === "split";
  const showPreview = viewMode === "split" || viewMode === "preview";
  const toolbarDisabled = !showEditor;
  const previewHtml = viewMode === "html" ? htmlSource : contentHtml;

  return (
    <div className="min-h-screen pb-16 bg-[#0a0f1c] text-slate-100">
      {alert && (
        <div
          className={`fixed bottom-6 right-6 z-[80] p-4 rounded-xl border text-xs font-black uppercase tracking-wider shadow-xl flex items-center gap-3 bg-[#121829] ${
            alert.type === "success"
              ? "border-emerald-500/40 text-emerald-400"
              : "border-rose-500/40 text-rose-400"
          }`}
        >
          {alert.type === "success" ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertTriangle className="w-4 h-4" />
          )}
          {alert.message}
        </div>
      )}

      {/* Control Action Header bar */}
      <div className="bg-[#121829] border-b border-[#1e293b] sticky top-0 z-40 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Tooltip label="Back to blog list">
            <button
              onClick={requestBack}
              className="p-2 hover:bg-[#1e293b] rounded-xl transition-colors text-slate-400 hover:text-slate-100 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Tooltip>
          <div>
            <h1 className="text-base font-black tracking-tight text-white flex items-center gap-2">
              {blogId ? "Edit Blog Article" : "Create New Blog Entry"}
              {isDirty && (
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Unsaved
                </span>
              )}
            </h1>
            <p className="text-[10px] font-bold text-[#927948] uppercase tracking-widest">
              Premium Content Engine Workspace
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-2">
            <FileText className="w-3.5 h-3.5" />
            <span>{stats.words} words</span>
            <span className="text-slate-600">•</span>
            <Clock className="w-3.5 h-3.5" />
            <span>{readTimeMinutes} min read</span>
          </div>
          <ThemedSelect
            value={formData.status}
            onChange={(v) => {
              setFormData((prev) => ({ ...prev, status: v }));
              markDirty();
            }}
            options={[
              { value: "draft", label: "Draft", dot: "bg-amber-500" },
              { value: "published", label: "Publish Globally", dot: "bg-emerald-500" },
              { value: "archived", label: "Archive Asset", dot: "bg-slate-500" },
            ]}
          />
          <Tooltip label="Save this article">
            <button
              onClick={requestSave}
              disabled={actionLoading || uploadingImage || uploadingCover}
              className="bg-[#927948] hover:bg-[#a68c56] text-white text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save Article</span>
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Grid Canvas System */}
      <div className="max-w-7xl mx-auto px-6 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6 min-w-0">
          <div className={`${CARD} rounded-xl p-1.5 flex gap-1`}>
            {tabs.map((tab) => (
              <Tooltip
                key={tab.key}
                label={`Switch to ${tab.label}`}
                className="flex-1"
              >
                <button
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === tab.key
                      ? "bg-[#927948] text-white"
                      : "text-slate-400 hover:text-slate-100 hover:bg-[#1e293b]"
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              </Tooltip>
            ))}
          </div>

          <div
            className={
              activeTab === "content" ? "space-y-6 animate-fadeIn" : "hidden"
            }
          >
            <div className={`${CARD} p-6 space-y-4`}>
              <div>
                <label className={LABEL}>Blog Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter blog article heading title..."
                  className={`${INPUT} text-sm font-bold px-4 py-3`}
                />
              </div>
              <div>
                <label className={LABEL}>Short Description / Excerpt</label>
                <textarea
                  name="shortDescription"
                  required
                  rows={2}
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                  placeholder="Brief introductory overview for directories card system components..."
                  className={`${INPUT} px-4 py-3 resize-none`}
                />
              </div>
            </div>

            {/* ADVANCED RICH TEXT EDITOR */}
            <div
              className={`bg-[#121829] border border-[#1e293b] overflow-hidden flex flex-col ${
                isFullscreen
                  ? "fixed inset-0 z-[60] rounded-none"
                  : "rounded-2xl shadow-sm h-[calc(100vh-180px)] min-h-[560px]"
              }`}
            >
              {/* View mode bar */}
              <div className="shrink-0 flex items-center justify-between gap-2 border-b border-[#1e293b] bg-[#0a0f1c] px-2 py-2">
                <div className="flex gap-1 rounded-xl border border-[#1e293b] bg-[#121829] p-1">
                  {VIEW_MODES.map((m) => (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => switchViewMode(m.key)}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                        viewMode === m.key
                          ? "bg-[#927948] text-white"
                          : "text-slate-400 hover:bg-[#1e293b] hover:text-slate-100"
                      }`}
                    >
                      {m.icon}
                      <span className="hidden sm:inline">{m.label}</span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  {isFullscreen && (
                    <span className="hidden md:inline text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Esc to exit
                    </span>
                  )}
                  <Tooltip
                    label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                  >
                    <button
                      type="button"
                      onClick={() => setIsFullscreen((v) => !v)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-[#1e293b] hover:text-slate-100 transition-colors cursor-pointer"
                    >
                      {isFullscreen ? (
                        <Minimize2 className="w-3.5 h-3.5" />
                      ) : (
                        <Maximize2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </Tooltip>
                </div>
              </div>

              {/* Formatting toolbar */}
              <div
                className={`shrink-0 bg-[#121829] border-b border-[#1e293b] p-2 flex flex-wrap gap-1 items-center ${
                  toolbarDisabled ? "opacity-40 pointer-events-none" : ""
                }`}
              >
                {/* Block format (Paragraph / H1–H6 / Quote / Code) */}
                <Dropdown
                  title="Text style"
                  panelClassName="w-48"
                  trigger={
                    <span className="flex w-20 items-center gap-1.5 truncate">
                      <Pilcrow className="w-3.5 h-3.5 text-[#927948] shrink-0" />
                      {BLOCK_FORMATS.find((b) => b.tag === currentBlock)?.label ??
                        "Paragraph"}
                    </span>
                  }
                >
                  {(close) =>
                    BLOCK_FORMATS.map((b) => (
                      <MenuItem
                        key={b.tag}
                        active={b.tag === currentBlock}
                        onSelect={() => {
                          applyBlockFormat(b.tag);
                          close();
                        }}
                      >
                        <span className={b.className}>{b.label}</span>
                      </MenuItem>
                    ))
                  }
                </Dropdown>

                {/* Font size in pixels */}
                <Dropdown
                  title="Font size"
                  panelClassName="w-40"
                  trigger={
                    <span className="flex items-center gap-1.5">
                      <Type className="w-3.5 h-3.5 text-[#927948]" />
                      Size
                    </span>
                  }
                >
                  {(close) => (
                    <>
                      <div className="max-h-56 overflow-y-auto custom-scrollbar">
                        {FONT_SIZES_PX.map((px) => (
                          <MenuItem
                            key={px}
                            onSelect={() => {
                              applyFontSizePx(px);
                              close();
                            }}
                          >
                            <span className="flex items-center justify-between text-xs font-bold">
                              {px}px
                              <span
                                className="text-slate-500 leading-none"
                                style={{ fontSize: Math.min(px, 22) }}
                              >
                                Aa
                              </span>
                            </span>
                          </MenuItem>
                        ))}
                      </div>
                      <form
                        className="mt-1.5 flex gap-1 border-t border-[#1e293b] pt-1.5"
                        onSubmit={(e) => {
                          e.preventDefault();
                          applyFontSizePx(parseInt(customFontPx, 10));
                          setCustomFontPx("");
                          close();
                        }}
                      >
                        <input
                          type="number"
                          min={6}
                          max={200}
                          value={customFontPx}
                          onChange={(e) => setCustomFontPx(e.target.value)}
                          placeholder="Custom"
                          className="w-full rounded-lg border border-[#1e293b] bg-[#0a0f1c] px-2 py-1 text-[11px] font-bold text-slate-100 focus:outline-hidden focus:border-[#927948]"
                        />
                        <button
                          type="submit"
                          className="rounded-lg bg-[#927948] px-2 text-[10px] font-black text-white cursor-pointer"
                        >
                          px
                        </button>
                      </form>
                    </>
                  )}
                </Dropdown>

                <ToolbarDivider />

                <ToolbarButton
                  icon={<Bold className="w-3.5 h-3.5" />}
                  label="Bold"
                  onMouseDown={() => executeCommand("bold")}
                />
                <ToolbarButton
                  icon={<Italic className="w-3.5 h-3.5" />}
                  label="Italic"
                  onMouseDown={() => executeCommand("italic")}
                />
                <ToolbarButton
                  icon={<Underline className="w-3.5 h-3.5" />}
                  label="Underline"
                  onMouseDown={() => executeCommand("underline")}
                />
                <ToolbarButton
                  icon={<Strikethrough className="w-3.5 h-3.5" />}
                  label="Strikethrough"
                  onMouseDown={() => executeCommand("strikeThrough")}
                />
                <ToolbarButton
                  icon={<Subscript className="w-3.5 h-3.5" />}
                  label="Subscript"
                  onMouseDown={() => executeCommand("subscript")}
                />
                <ToolbarButton
                  icon={<Superscript className="w-3.5 h-3.5" />}
                  label="Superscript"
                  onMouseDown={() => executeCommand("superscript")}
                />

                <ToolbarDivider />

                {/* Text color */}
                <Tooltip label="Text color">
                  <label
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-[#1e293b] hover:text-slate-100 cursor-pointer relative"
                    onMouseDown={saveSelection}
                  >
                    <Palette className="w-3.5 h-3.5" />
                    <input
                      type="color"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => applyColor("foreColor", e.target.value)}
                    />
                  </label>
                </Tooltip>
                {/* Highlight color */}
                <Tooltip label="Highlight color">
                  <label
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-[#1e293b] hover:text-slate-100 cursor-pointer relative"
                    onMouseDown={saveSelection}
                  >
                    <Highlighter className="w-3.5 h-3.5" />
                    <input
                      type="color"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) =>
                        applyColor("hiliteColor", e.target.value)
                      }
                    />
                  </label>
                </Tooltip>

                <ToolbarDivider />

                <ToolbarButton
                  icon={<List className="w-3.5 h-3.5" />}
                  label="Bulleted list"
                  onMouseDown={() => executeCommand("insertUnorderedList")}
                />
                <ToolbarButton
                  icon={<ListOrdered className="w-3.5 h-3.5" />}
                  label="Numbered list"
                  onMouseDown={() => executeCommand("insertOrderedList")}
                />
                <ToolbarButton
                  icon={<IndentDecrease className="w-3.5 h-3.5" />}
                  label="Decrease indent"
                  onMouseDown={() => executeCommand("outdent")}
                />
                <ToolbarButton
                  icon={<IndentIncrease className="w-3.5 h-3.5" />}
                  label="Increase indent"
                  onMouseDown={() => executeCommand("indent")}
                />

                <ToolbarDivider />

                <ToolbarButton
                  icon={<AlignLeft className="w-3.5 h-3.5" />}
                  label="Align left"
                  onMouseDown={() => executeCommand("justifyLeft")}
                />
                <ToolbarButton
                  icon={<AlignCenter className="w-3.5 h-3.5" />}
                  label="Align center"
                  onMouseDown={() => executeCommand("justifyCenter")}
                />
                <ToolbarButton
                  icon={<AlignRight className="w-3.5 h-3.5" />}
                  label="Align right"
                  onMouseDown={() => executeCommand("justifyRight")}
                />
                <ToolbarButton
                  icon={<AlignJustify className="w-3.5 h-3.5" />}
                  label="Justify"
                  onMouseDown={() => executeCommand("justifyFull")}
                />

                <ToolbarDivider />

                <ToolbarButton
                  icon={<Quote className="w-3.5 h-3.5" />}
                  label="Blockquote"
                  onMouseDown={() => applyBlockFormat("blockquote")}
                />
                <ToolbarButton
                  icon={<Code2 className="w-3.5 h-3.5" />}
                  label="Code block"
                  onMouseDown={() => applyBlockFormat("pre")}
                />
                <ToolbarButton
                  icon={<Minus className="w-3.5 h-3.5" />}
                  label="Horizontal rule"
                  onMouseDown={() => executeCommand("insertHorizontalRule")}
                />

                {/* Table: grid picker + row/column tools */}
                <Dropdown
                  title="Table"
                  panelClassName="w-60"
                  onOpen={() => {
                    setTableCell(getCurrentCell());
                    setTableHover({ rows: 0, cols: 0 });
                  }}
                  trigger={
                    <span className="flex items-center gap-1.5">
                      <TableIcon className="w-3.5 h-3.5 text-[#927948]" />
                      Table
                    </span>
                  }
                >
                  {(close) => (
                    <div className="space-y-2 p-1">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        {tableHover.rows
                          ? `${tableHover.rows} × ${tableHover.cols} table`
                          : "Insert table"}
                      </p>
                      <div
                        className="grid gap-1"
                        style={{
                          gridTemplateColumns: `repeat(${TABLE_GRID}, minmax(0, 1fr))`,
                        }}
                        onMouseLeave={() => setTableHover({ rows: 0, cols: 0 })}
                      >
                        {Array.from({ length: TABLE_GRID * TABLE_GRID }, (_, i) => {
                          const r = Math.floor(i / TABLE_GRID) + 1;
                          const c = (i % TABLE_GRID) + 1;
                          const lit = r <= tableHover.rows && c <= tableHover.cols;
                          return (
                            <button
                              key={i}
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onMouseEnter={() => setTableHover({ rows: r, cols: c })}
                              onClick={() => {
                                insertTable(r, c);
                                close();
                              }}
                              className={`aspect-square rounded-[3px] border transition-colors cursor-pointer ${
                                lit
                                  ? "border-[#927948] bg-[#927948]/40"
                                  : "border-[#1e293b] bg-[#0a0f1c]"
                              }`}
                            />
                          );
                        })}
                      </div>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setTableWithHeader((v) => !v)}
                        className="flex w-full items-center justify-between rounded-lg px-1 py-1 text-[11px] font-bold text-slate-300 cursor-pointer"
                      >
                        Header row
                        {tableWithHeader ? (
                          <ToggleRight className="w-5 h-5 text-[#927948]" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-slate-600" />
                        )}
                      </button>

                      <div className="border-t border-[#1e293b] pt-1.5">
                        {!tableCell && (
                          <p className="px-1 pb-1 text-[10px] font-semibold text-slate-500">
                            Place the cursor in a table to edit rows and columns.
                          </p>
                        )}
                        {(
                          [
                            ["Insert row above", () => tableCell && addTableRow(tableCell, false)],
                            ["Insert row below", () => tableCell && addTableRow(tableCell, true)],
                            ["Insert column left", () => tableCell && addTableColumn(tableCell, false)],
                            ["Insert column right", () => tableCell && addTableColumn(tableCell, true)],
                          ] as [string, () => void][]
                        ).map(([label, fn]) => (
                          <MenuItem
                            key={label}
                            disabled={!tableCell}
                            onSelect={() => {
                              fn();
                              close();
                            }}
                          >
                            <span className="text-xs font-semibold">{label}</span>
                          </MenuItem>
                        ))}
                        {(
                          [
                            ["Delete row", () => tableCell && deleteTableRow(tableCell)],
                            ["Delete column", () => tableCell && deleteTableColumn(tableCell)],
                            ["Delete table", () => tableCell && requestDeleteTable(tableCell)],
                          ] as [string, () => void][]
                        ).map(([label, fn]) => (
                          <MenuItem
                            key={label}
                            danger
                            disabled={!tableCell}
                            onSelect={() => {
                              fn();
                              close();
                            }}
                          >
                            <span className="text-xs font-semibold">{label}</span>
                          </MenuItem>
                        ))}
                      </div>
                    </div>
                  )}
                </Dropdown>

                <ToolbarDivider />

                <ToolbarButton
                  icon={<Link2 className="w-3.5 h-3.5" />}
                  label="Insert link"
                  onMouseDown={openLinkModal}
                />
                <ToolbarButton
                  icon={<Link2Off className="w-3.5 h-3.5" />}
                  label="Remove link"
                  onMouseDown={removeLink}
                />

                {/* Image insert */}
                <Tooltip label="Insert image">
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      openImageModal();
                    }}
                    className="ml-0.5 px-2.5 h-8 bg-[#0a0f1c] border border-[#1e293b] hover:border-[#927948] text-slate-200 rounded-lg cursor-pointer flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider transition-colors"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-[#927948]" />
                    <span>Image</span>
                  </button>
                </Tooltip>

                <ToolbarButton
                  icon={<Eraser className="w-3.5 h-3.5" />}
                  label="Clear formatting"
                  onMouseDown={() => executeCommand("removeFormat")}
                />

                <div className="ml-auto flex gap-1">
                  <ToolbarButton
                    icon={<Undo className="w-3.5 h-3.5" />}
                    label="Undo"
                    onMouseDown={() => executeCommand("undo")}
                  />
                  <ToolbarButton
                    icon={<Redo className="w-3.5 h-3.5" />}
                    label="Redo"
                    onMouseDown={() => executeCommand("redo")}
                  />
                </div>
              </div>

              {/* Editor body — scrolls independently so the toolbar stays in view */}
              <div
                className={`flex-1 min-h-0 grid ${
                  viewMode === "split" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
                }`}
              >
                {/* Rich editor stays mounted (just hidden) so its content is never lost */}
                <div
                  className={`min-h-0 overflow-y-auto custom-scrollbar ${
                    showEditor ? "" : "hidden"
                  } ${viewMode === "split" ? "border-b md:border-b-0 md:border-r border-[#1e293b]" : ""}`}
                >
                  <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={() => {
                      syncContent();
                      markDirty();
                    }}
                    onMouseUp={saveSelection}
                    onClick={handleEditorClick}
                    onKeyUp={saveSelection}
                    data-placeholder="Start writing your article here..."
                    className={`editor-canvas blog-rich min-h-full p-6 focus:outline-hidden max-w-none text-sm text-slate-200 leading-relaxed ${
                      isFullscreen && viewMode === "write"
                        ? "max-w-4xl mx-auto"
                        : ""
                    }`}
                  />
                </div>

                {viewMode === "html" && (
                  <div className="relative min-h-0 h-full">
                    <button
                      type="button"
                      onClick={() => setHtmlSource((s) => formatHtml(s))}
                      className="absolute top-3 right-5 z-10 flex items-center gap-1.5 rounded-lg border border-[#1e293b] bg-[#121829] px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-300 hover:border-[#927948] hover:text-[#927948] transition-colors cursor-pointer"
                    >
                      <Code2 className="w-3.5 h-3.5" /> Format
                    </button>
                    <textarea
                      value={htmlSource}
                      onChange={(e) => {
                        setHtmlSource(e.target.value);
                        markDirty();
                      }}
                      onKeyDown={(e) => {
                        // Tab inserts two spaces instead of leaving the field
                        if (e.key !== "Tab") return;
                        e.preventDefault();
                        const el = e.currentTarget;
                        const { selectionStart: s, selectionEnd: end } = el;
                        const next = `${htmlSource.slice(0, s)}  ${htmlSource.slice(end)}`;
                        setHtmlSource(next);
                        markDirty();
                        requestAnimationFrame(() => {
                          el.selectionStart = el.selectionEnd = s + 2;
                        });
                      }}
                      spellCheck={false}
                      wrap="off"
                      className="h-full w-full resize-none bg-[#0a0f1c] p-6 pr-28 font-mono text-xs leading-relaxed text-emerald-300 whitespace-pre focus:outline-hidden custom-scrollbar"
                    />
                  </div>
                )}

                {showPreview && (
                  <div className="preview-pane min-h-0 overflow-y-auto custom-scrollbar bg-[#0a0f1c]">
                    <div
                      className={`p-6 md:p-8 ${
                        viewMode === "preview" ? "max-w-4xl mx-auto" : ""
                      }`}
                    >
                      {viewMode === "split" ? (
                        <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-[#927948]">
                          Live Preview
                        </p>
                      ) : (
                        <header className="mb-8 space-y-4">
                          {formData.category && (
                            <span className="inline-block text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md bg-[#927948]/10 text-[#927948] border border-[#927948]/30">
                              {formData.category}
                            </span>
                          )}
                          <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-tight">
                            {formData.title || "Untitled article"}
                          </h1>
                          {formData.shortDescription && (
                            <p className="text-sm text-slate-300 leading-relaxed border-l-4 border-[#927948] pl-4 py-1 italic">
                              {formData.shortDescription}
                            </p>
                          )}
                          {formData.coverImage && (
                            <img
                              src={formData.coverImage}
                              alt={formData.coverAlt || formData.title}
                              className="w-full max-h-[360px] object-cover rounded-2xl border border-[#1e293b]"
                            />
                          )}
                        </header>
                      )}
                      {previewHtml && previewHtml !== "<br>" ? (
                        <div
                          className="blog-rich text-sm md:text-base text-slate-300 leading-[1.8]"
                          dangerouslySetInnerHTML={{ __html: previewHtml }}
                        />
                      ) : (
                        <p className="text-xs font-semibold text-slate-500">
                          Nothing to preview yet — start writing in the editor.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="shrink-0 border-t border-[#1e293b] bg-[#0a0f1c] px-4 py-2 flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <span>
                  {stats.words} words · {stats.chars} characters
                </span>
                <span className="flex items-center gap-3">
                  <span className="text-[#927948]">
                    {VIEW_MODES.find((m) => m.key === viewMode)?.label} mode
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {readTimeMinutes} min read
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div
            className={
              activeTab === "seo"
                ? `${CARD} p-6 space-y-4 animate-fadeIn`
                : "hidden"
            }
          >
            <div>
              <label className={LABEL}>Meta Title</label>
              <input
                type="text"
                name="metaTitle"
                value={formData.metaTitle}
                onChange={handleInputChange}
                placeholder="SEO document browser tab title tag text..."
                className={`${INPUT} px-4 py-3`}
              />
            </div>
            <div>
              <label className={LABEL}>Meta Description</label>
              <textarea
                name="metaDescription"
                rows={4}
                value={formData.metaDescription}
                onChange={handleInputChange}
                placeholder="SEO description layout parameters..."
                className={`${INPUT} px-4 py-3 resize-none`}
              />
            </div>
            <div>
              <label className={LABEL}>Meta Keywords (Comma Separated)</label>
              <input
                type="text"
                name="metaKeywordsString"
                value={formData.metaKeywordsString}
                onChange={handleInputChange}
                placeholder="medical tools, surgical guidance, operational metrics"
                className={`${INPUT} px-4 py-3`}
              />
            </div>
            <div>
              <label className={LABEL}>Canonical URL (optional)</label>
              <input
                type="url"
                name="canonicalUrl"
                value={formData.canonicalUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/blogs/original-post"
                className={`${INPUT} px-4 py-3`}
              />
            </div>
          </div>

          <div
            className={
              activeTab === "faqs"
                ? `${CARD} p-6 space-y-4 animate-fadeIn`
                : "hidden"
            }
          >
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
              <span className="text-xs font-black text-slate-100 uppercase tracking-wider">
                Dynamic Accordion FAQ System
              </span>
              <Tooltip label="Add a new question/answer pair">
                <button
                  type="button"
                  onClick={() => {
                    setFaqs([...faqs, { question: "", answer: "" }]);
                    markDirty();
                  }}
                  className="text-xs font-extrabold text-[#927948] hover:text-[#a68c56] flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add FAQ Row Block
                </button>
              </Tooltip>
            </div>

            {faqs.length === 0 ? (
              <div className="p-12 text-center bg-[#0a0f1c] border border-[#1e293b] border-dashed rounded-xl text-slate-500 text-xs font-semibold">
                No core contextual question structures appended yet.
              </div>
            ) : (
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="bg-[#0a0f1c] border border-[#1e293b] rounded-xl p-4 space-y-3 relative"
                  >
                    <div className="absolute top-4 right-4">
                      <Tooltip label="Remove this FAQ">
                        <button
                          type="button"
                          onClick={() => requestRemoveFaq(index)}
                          className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </Tooltip>
                    </div>
                    <div className="pr-8">
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">
                        Question Description #{index + 1}
                      </label>
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) =>
                          handleFaqChange(index, "question", e.target.value)
                        }
                        placeholder="Enter core customer query title here..."
                        className={`${INPUT} bg-[#121829] py-2`}
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">
                        Answer Field
                      </label>
                      <textarea
                        rows={2}
                        value={faq.answer}
                        onChange={(e) =>
                          handleFaqChange(index, "answer", e.target.value)
                        }
                        placeholder="Provide target descriptive resolution details..."
                        className={`${INPUT} bg-[#121829] py-2 resize-none`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div
            className={
              activeTab === "publish"
                ? `${CARD} p-6 space-y-4 animate-fadeIn`
                : "hidden"
            }
          >
            <div>
              <label className={LABEL}>Schedule Publish (optional)</label>
              <input
                type="datetime-local"
                name="scheduledAt"
                value={formData.scheduledAt}
                onChange={handleInputChange}
                className={`${INPUT} px-4 py-3 [color-scheme:dark]`}
              />
              <p className="text-[10px] font-semibold text-slate-500 mt-1.5">
                Leave blank to publish immediately when status is set to
                Published.
              </p>
            </div>

            <ToggleRow
              label="Featured Article"
              hint="Pin to the top of the blog listing page"
              value={formData.featured}
              onChange={(v) => {
                setFormData((prev) => ({ ...prev, featured: v }));
                markDirty();
              }}
            />
            <ToggleRow
              label="Allow Comments"
              hint="Readers can leave comments on this article"
              value={formData.allowComments}
              onChange={(v) => {
                setFormData((prev) => ({ ...prev, allowComments: v }));
                markDirty();
              }}
            />

            <div className="pt-2 border-t border-[#1e293b]">
              <p className="text-[10px] font-black text-slate-200 uppercase tracking-wider mb-2">
                Summary
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-slate-100">
                <div className="bg-[#0a0f1c] rounded-xl p-3 border border-[#1e293b]">
                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">
                    Word Count
                  </span>
                  {stats.words}
                </div>
                <div className="bg-[#0a0f1c] rounded-xl p-3 border border-[#1e293b]">
                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">
                    Read Time
                  </span>
                  {readTimeMinutes} min
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* METADATA SIDE PANEL BAR LAYER */}
        <div className="space-y-6">
          <div className={`${CARD} p-6 space-y-4`}>
            <h3 className="text-xs font-black uppercase text-[#927948] tracking-wider border-b border-[#1e293b] pb-2">
              Classification
            </h3>
            <div>
              <label className={LABEL}>Category</label>
              <ThemedSelect
                fullWidth
                value={formData.category}
                placeholder="Select a category"
                onChange={(v) => {
                  setFormData((prev) => ({ ...prev, category: v }));
                  markDirty();
                }}
                options={[
                  { value: "Blog", label: "Blog" },
                  { value: "Case Study", label: "Case Study" },
                  { value: "Travel Guide", label: "Travel Guide" },
                  { value: "Patient Story", label: "Patient Story" },
                ]}
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                <Hash className="w-3 h-3" /> URL Slug
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={handleSlugChange}
                placeholder="auto-generated-from-title"
                className={`${INPUT} font-mono`}
              />
            </div>
            <div>
              <label className={LABEL}>Author Label</label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                className={INPUT}
              />
            </div>
            <div>
              <label className={LABEL}>Tags (Comma Separated)</label>
              <input
                type="text"
                name="tagsString"
                value={formData.tagsString}
                onChange={handleInputChange}
                placeholder="delhi, jci care, bypass costs"
                className={INPUT}
              />
            </div>
          </div>

          <div className={`${CARD} p-6 space-y-4`}>
            <h3 className="text-xs font-black uppercase text-[#927948] tracking-wider border-b border-[#1e293b] pb-2">
              Main Cover Image
            </h3>
            <div>
              <label className={LABEL}>Upload Cover to Cloudinary</label>
              <Tooltip
                label="Upload a cover photo from your device"
                className="w-full"
              >
                <label className="w-full border border-[#1e293b] border-dashed rounded-xl py-3 px-4 bg-[#0a0f1c] text-slate-200 flex items-center justify-center gap-2 cursor-pointer text-xs font-bold transition-all hover:border-[#927948]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageFileChange}
                    className="hidden"
                  />
                  {uploadingCover ? (
                    <Loader2 className="w-4 h-4 text-[#927948] animate-spin" />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-[#927948]" />
                  )}
                  <span>
                    {uploadingCover
                      ? "Uploading..."
                      : "Choose Local Cover Image"}
                  </span>
                </label>
              </Tooltip>
            </div>
            <div>
              <label className={LABEL}>Image Alt Text</label>
              <input
                type="text"
                name="coverAlt"
                value={formData.coverAlt}
                onChange={handleInputChange}
                placeholder="Accessibility description text metrics label..."
                className={INPUT}
              />
            </div>
            {formData.coverImage && (
              <div className="w-full h-32 rounded-xl bg-[#0a0f1c] border border-[#1e293b] overflow-hidden relative mt-2">
                <img
                  src={formData.coverImage}
                  alt={formData.coverAlt}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* LINK INSERTION MODAL — replaces window.prompt() */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-[65] bg-[#0a0f1c]/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <form
            onSubmit={handleLinkSubmit}
            className="bg-[#121829] rounded-2xl border border-[#1e293b] shadow-2xl max-w-md w-full p-6 space-y-4 animate-scaleUp"
          >
            <div>
              <h3 className="text-sm font-black text-white tracking-tight">
                Insert Hyperlink
              </h3>
              <p className="text-[10px] font-semibold text-[#927948] uppercase tracking-wider mt-0.5">
                Link selected text to a destination URL
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">
                  Destination URL
                </label>
                <input
                  type="url"
                  required
                  autoFocus
                  value={linkUrlInput}
                  onChange={(e) => setLinkUrlInput(e.target.value)}
                  placeholder="https://example.com/page"
                  className={`${INPUT} py-2`}
                />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">
                  Link Text
                </label>
                <input
                  type="text"
                  value={linkTextInput}
                  onChange={(e) => setLinkTextInput(e.target.value)}
                  placeholder="Text shown to readers"
                  className={`${INPUT} py-2`}
                />
              </div>
              <button
                type="button"
                onClick={() => setLinkNewTab(!linkNewTab)}
                className="flex items-center justify-between w-full rounded-xl border border-[#1e293b] bg-[#0a0f1c] px-3.5 py-2.5 cursor-pointer"
              >
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5" /> Open in new tab
                </span>
                {linkNewTab ? (
                  <ToggleRight className="w-6 h-6 text-[#927948]" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-slate-600" />
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="text-xs font-bold bg-[#1e293b] hover:bg-[#2e3d52] text-slate-200 py-2.5 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="text-xs font-black uppercase bg-[#927948] hover:bg-[#a68c56] text-white py-2.5 rounded-xl tracking-wider cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Insert Link</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* IMAGE INSERT / EDIT MODAL */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-[65] bg-[#0a0f1c]/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <form
            onSubmit={handleImageInsertionSubmit}
            className="bg-[#121829] rounded-2xl border border-[#1e293b] shadow-2xl max-w-4xl w-full max-h-[calc(100vh-2rem)] flex flex-col animate-scaleUp"
          >
            {/* Header */}
            <div className="shrink-0 flex items-start justify-between gap-3 border-b border-[#1e293b] px-6 py-4">
              <div>
                <h3 className="text-sm font-black text-white tracking-tight">
                  {isEditingImage ? "Edit Image" : "Select & Configure Image Asset"}
                </h3>
                <p className="text-[10px] font-semibold text-[#927948] uppercase tracking-wider mt-0.5">
                  {isEditingImage
                    ? "Update source, alt text, caption, size and more"
                    : "Inject direct URLs or Cloudinary uploads"}
                </p>
              </div>
              <button
                type="button"
                onClick={closeImageModal}
                className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-[#1e293b] rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body: 2 columns */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* LEFT — source & preview */}
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Source
                </p>
                <div className="rounded-xl border border-[#1e293b] bg-[#0a0f1c] p-2 flex items-center justify-center h-48">
                  {selectedFilePreview || imageUrlInput ? (
                    <img
                      src={
                        selectedFilePreview && imageSourceMode === "upload"
                          ? selectedFilePreview
                          : imageUrlInput
                      }
                      alt={imageAltInput || "Image preview"}
                      className={`max-h-full max-w-full object-contain ${imageRounded ? "rounded-lg" : ""}`}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-600">
                      <ImageIcon className="w-8 h-8" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Preview appears here
                      </span>
                    </div>
                  )}
                </div>

                <div className="bg-[#0a0f1c] p-1 rounded-xl flex gap-1 border border-[#1e293b]">
                  <button
                    type="button"
                    onClick={() => setImageSourceMode("url")}
                    className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      imageSourceMode === "url"
                        ? "bg-[#927948] text-white"
                        : "text-slate-400 hover:text-slate-100"
                    }`}
                  >
                    External URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageSourceMode("upload")}
                    className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      imageSourceMode === "upload"
                        ? "bg-[#927948] text-white"
                        : "text-slate-400 hover:text-slate-100"
                    }`}
                  >
                    {isEditingImage ? "Replace via Upload" : "Upload File"}
                  </button>
                </div>

                {imageSourceMode === "url" ? (
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">
                      Image Web Address (URL)
                    </label>
                    <input
                      type="url"
                      required={imageSourceMode === "url"}
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className={`${INPUT} py-2`}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">
                      Select Local File Asset
                    </label>
                    <label className="w-full border border-[#1e293b] border-dashed rounded-xl py-3 px-4 bg-[#0a0f1c] text-slate-200 flex items-center justify-center gap-2 cursor-pointer text-xs font-bold transition-all hover:border-[#927948]">
                      <input
                        type="file"
                        accept="image/*"
                        required={
                          imageSourceMode === "upload" &&
                          !selectedFile &&
                          !isEditingImage
                        }
                        onChange={(e) =>
                          setSelectedFile(e.target.files?.[0] || null)
                        }
                        className="hidden"
                      />
                      <ImageIcon className="w-4 h-4 text-[#927948]" />
                      <span className="truncate">
                        {selectedFile
                          ? selectedFile.name
                          : isEditingImage
                            ? "Choose a new file (optional)"
                            : "Choose file from folder"}
                      </span>
                    </label>
                  </div>
                )}

                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">
                    Alt Text (SEO & Accessibility)
                  </label>
                  <input
                    type="text"
                    value={imageAltInput}
                    required
                    onChange={(e) => setImageAltInput(e.target.value)}
                    placeholder="Describe the image, e.g. EUR/USD daily chart"
                    className={`${INPUT} py-2`}
                  />
                </div>
              </div>

              {/* RIGHT — details & layout */}
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Details & Layout
                </p>

                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">
                    Title / Hover Text (optional)
                  </label>
                  <input
                    type="text"
                    value={imageTitleInput}
                    onChange={(e) => setImageTitleInput(e.target.value)}
                    placeholder="Shown on mouse hover"
                    className={`${INPUT} py-2`}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">
                    Caption (optional)
                  </label>
                  <input
                    type="text"
                    value={imageCaptionInput}
                    onChange={(e) => setImageCaptionInput(e.target.value)}
                    placeholder="Shown beneath the image"
                    className={`${INPUT} py-2`}
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">
                    Link Image To (optional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={imageLinkInput}
                      onChange={(e) => setImageLinkInput(e.target.value)}
                      placeholder="https://example.com/page"
                      className={`${INPUT} py-2`}
                    />
                    <button
                      type="button"
                      title="Open link in new tab"
                      disabled={!imageLinkInput.trim()}
                      onClick={() => setImageLinkNewTab((v) => !v)}
                      className={`shrink-0 whitespace-nowrap px-3 rounded-xl border text-[10px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors ${
                        imageLinkNewTab
                          ? "bg-[#927948]/15 border-[#927948]/50 text-[#927948]"
                          : "bg-[#0a0f1c] border-[#1e293b] text-slate-400"
                      }`}
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> New tab
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">
                    Size
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {(
                      ["small", "medium", "large", "full", "custom"] as ImageSize[]
                    ).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setImageSize(s)}
                        className={`text-[10px] font-bold py-1.5 rounded-lg border capitalize cursor-pointer transition-colors ${
                          imageSize === s
                            ? "bg-[#927948] text-white border-[#927948]"
                            : "bg-[#0a0f1c] text-slate-300 border-[#1e293b] hover:border-[#927948]/50"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  {imageSize === "custom" && (
                    <input
                      type="text"
                      value={imageCustomWidth}
                      onChange={(e) => setImageCustomWidth(e.target.value)}
                      placeholder="Width, e.g. 450px or 60%"
                      className={`${INPUT} py-2 mt-1.5`}
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">
                      Alignment
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(["left", "center", "right"] as ImageAlign[]).map((a) => {
                        const Icon =
                          a === "left" ? AlignLeft : a === "right" ? AlignRight : AlignCenter;
                        return (
                          <button
                            key={a}
                            type="button"
                            title={`Align ${a}`}
                            onClick={() => setImageAlign(a)}
                            className={`flex items-center justify-center py-1.5 rounded-lg border cursor-pointer transition-colors ${
                              imageAlign === a
                                ? "bg-[#927948] text-white border-[#927948]"
                                : "bg-[#0a0f1c] text-slate-300 border-[#1e293b] hover:border-[#927948]/50"
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">
                      Corners
                    </label>
                    <button
                      type="button"
                      onClick={() => setImageRounded((v) => !v)}
                      className="flex items-center justify-between w-full rounded-lg border border-[#1e293b] bg-[#0a0f1c] px-3 py-1 cursor-pointer"
                    >
                      <span className="text-[10px] font-bold text-slate-300">
                        Rounded
                      </span>
                      {imageRounded ? (
                        <ToggleRight className="w-5 h-5 text-[#927948]" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-slate-600" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 flex items-center gap-2 border-t border-[#1e293b] px-6 py-4">
              {isEditingImage && (
                <button
                  type="button"
                  onClick={requestDeleteImage}
                  className="text-xs font-bold text-rose-400 hover:bg-rose-500/10 border border-rose-500/30 px-3 py-2.5 rounded-xl cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              )}
              <div className="ml-auto flex gap-2">
                <button
                  type="button"
                  onClick={closeImageModal}
                  className="text-xs font-bold bg-[#1e293b] hover:bg-[#2e3d52] text-slate-200 px-6 py-2.5 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="text-xs font-black uppercase bg-[#927948] hover:bg-[#a68c56] text-white px-6 py-2.5 rounded-xl tracking-wider cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {uploadingImage && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  <span>{isEditingImage ? "Update Image" : "Insert Image"}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {confirmState && (
        <ConfirmDialog state={confirmState} onCancel={closeConfirm} />
      )}

      <style jsx global>{`
        .editor-canvas:empty::before {
          content: attr(data-placeholder);
          color: #64748b;
          pointer-events: none;
        }
        .blog-rich h1 {
          font-size: 1.75rem;
          font-weight: 800;
          margin: 1.25rem 0 0.5rem;
          color: #ffffff;
        }
        .blog-rich h2 {
          font-size: 1.4rem;
          font-weight: 800;
          margin: 1.1rem 0 0.5rem;
          color: #927948;
        }
        .blog-rich h3 {
          font-size: 1.15rem;
          font-weight: 700;
          margin: 1rem 0 0.4rem;
          color: #f1f5f9;
        }
        .blog-rich h4 {
          font-size: 1rem;
          font-weight: 700;
          margin: 0.9rem 0 0.4rem;
          color: #e2e8f0;
        }
        .blog-rich h5 {
          font-size: 0.9rem;
          font-weight: 700;
          margin: 0.8rem 0 0.35rem;
          color: #e2e8f0;
        }
        .blog-rich h6 {
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin: 0.8rem 0 0.35rem;
          color: #cbd5e1;
        }
        .blog-rich p {
          margin: 0.6rem 0;
        }
        .blog-rich table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
          font-size: 0.8rem;
        }
        .blog-rich th,
        .blog-rich td {
          border: 1px solid #1e293b;
          padding: 8px 12px;
          text-align: left;
          vertical-align: top;
          min-width: 60px;
        }
        .blog-rich th {
          background: #0a0f1c;
          color: #ffffff;
          font-weight: 700;
        }
        .preview-pane .blog-rich th {
          background: #121829;
        }
        .blog-rich strong,
        .blog-rich b {
          color: #ffffff;
        }
        .blog-rich blockquote {
          border-left: 3px solid #927948;
          background: #0a0f1c;
          padding: 0.75rem 1rem;
          border-radius: 0 0.5rem 0.5rem 0;
          margin: 1rem 0;
          color: #e2e8f0;
          font-style: italic;
        }
        .blog-rich pre {
          background: #0a0f1c;
          border: 1px solid #1e293b;
          color: #e2e8f0;
          padding: 1rem;
          border-radius: 0.75rem;
          overflow-x: auto;
          font-size: 0.75rem;
          margin: 1rem 0;
        }
        .blog-rich ul {
          list-style: disc;
          padding-left: 1.5rem;
          margin: 0.6rem 0;
        }
        .blog-rich ol {
          list-style: decimal;
          padding-left: 1.5rem;
          margin: 0.6rem 0;
        }
        .blog-rich a {
          color: #927948;
          text-decoration: underline;
        }
        .blog-rich hr {
          border: none;
          border-top: 1px solid #1e293b;
          margin: 1.5rem 0;
        }
        .blog-rich figure {
          clear: both;
        }
        .blog-rich img {
          max-width: 100%;
        }
        /* Images in the editor are clickable to edit their settings */
        .editor-canvas figure,
        .editor-canvas img {
          cursor: pointer;
          transition: outline-color 0.15s;
          outline: 2px solid transparent;
          outline-offset: 4px;
          border-radius: 0.75rem;
        }
        .editor-canvas figure:hover,
        .editor-canvas > img:hover {
          outline-color: #927948;
        }
        /* Preview pane sits on the darker background */
        .preview-pane .blog-rich blockquote,
        .preview-pane .blog-rich pre {
          background: #121829;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleUp {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleUp {
          animation: scaleUp 0.18s ease-out;
        }
      `}</style>
    </div>
  );
}
