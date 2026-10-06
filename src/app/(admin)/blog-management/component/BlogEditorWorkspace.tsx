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
  Type,
  Calendar,
  Star,
  MessageSquare,
  FileText,
  Clock,
  Hash,
  Check,
  ToggleLeft,
  ToggleRight,
  Eye,
  ExternalLink,
} from "lucide-react";

interface FAQ {
  question: string;
  answer: string;
}

interface BlogEditorWorkspaceProps {
  blogId?: string;
}

type ImageSize = "small" | "medium" | "large" | "full";
type ImageAlign = "left" | "center" | "right";

const FONT_SIZES = [
  { label: "Small", value: "2" },
  { label: "Normal", value: "3" },
  { label: "Medium", value: "4" },
  { label: "Large", value: "5" },
  { label: "X-Large", value: "6" },
  { label: "Huge", value: "7" },
];

const TEXT_COLORS = [
  "#0f172a",
  "#dc2626",
  "#d97706",
  "#16a34a",
  "#0284c7",
  "#7c3aed",
  "#db2777",
  "#64748b",
];
const HIGHLIGHT_COLORS = [
  "#fef08a",
  "#bbf7d0",
  "#bfdbfe",
  "#fecaca",
  "#fbcfe8",
  "#e9d5ff",
  "#fed7aa",
  "transparent",
];

/* ---------------------------------------------------------------------- */
/* Small reusable UI primitives                                           */
/* ---------------------------------------------------------------------- */

function Tooltip({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative group/tip inline-flex">
      {children}
      <span className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-[10px] font-bold tracking-wide text-white opacity-0 shadow-xl transition-opacity duration-150 group-hover/tip:opacity-100">
        {label}
        <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-slate-900" />
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
            ? "bg-[#0284c7] text-white shadow-xs"
            : "text-slate-600 hover:bg-slate-200/70"
        }`}
      >
        {icon}
      </button>
    </Tooltip>
  );
}

function ToolbarDivider() {
  return <div className="mx-1 h-5 w-px shrink-0 bg-slate-300/80" />;
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
      className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-left transition-colors hover:bg-slate-100 cursor-pointer"
    >
      <span>
        <span className="block text-xs font-bold text-slate-700">{label}</span>
        {hint && (
          <span className="block text-[10px] font-semibold text-slate-400">
            {hint}
          </span>
        )}
      </span>
      {value ? (
        <ToggleRight className="w-6 h-6 text-[#0284c7] shrink-0" />
      ) : (
        <ToggleLeft className="w-6 h-6 text-slate-300 shrink-0" />
      )}
    </button>
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

  // Modal state (replaces window.prompt / window.alert everywhere)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageSourceMode, setImageSourceMode] = useState<"url" | "upload">(
    "url",
  );
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [imageAltInput, setImageAltInput] = useState("");
  const [imageCaptionInput, setImageCaptionInput] = useState("");
  const [imageSize, setImageSize] = useState<ImageSize>("medium");
  const [imageAlign, setImageAlign] = useState<ImageAlign>("center");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
        if (editorRef.current) {
          editorRef.current.innerHTML = blog.content || "";
          hasInitializedContent.current = true;
          updateStats();
        }
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

  /* ------------------------- Editor stats (word/char/read time) ------------------------- */
  const updateStats = useCallback(() => {
    const text = editorRef.current?.innerText?.trim() || "";
    const words = text.length ? text.split(/\s+/).length : 0;
    setStats({ words, chars: text.length });
  }, []);

  const readTimeMinutes = useMemo(
    () => Math.max(1, Math.round(stats.words / 200)),
    [stats.words],
  );

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
    }
  }, []);

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
      updateStats();
    },
    [updateStats],
  );

  const executeCommand = (command: string, value: string = "") => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    updateStats();
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
    const html = `<a href="${linkUrlInput.trim()}"${targetAttrs} class="text-[#0284c7] underline underline-offset-2 font-semibold">${safeText}</a>&nbsp;`;
    insertHtmlAtCursor(html);
    setIsLinkModalOpen(false);
  };

  const removeLink = () => {
    editorRef.current?.focus();
    document.execCommand("unlink");
  };

  /* ------------------------- Image modal (with Blogger-style size / alignment) ------------------------- */
  const openImageModal = () => {
    saveSelection();
    setImageUrlInput("");
    setImageAltInput("");
    setImageCaptionInput("");
    setImageSize("medium");
    setImageAlign("center");
    setSelectedFile(null);
    setImageSourceMode("url");
    setIsImageModalOpen(true);
  };

  const handleImageInsertionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

    const widthMap: Record<ImageSize, string> = {
      small: "320px",
      medium: "520px",
      large: "760px",
      full: "100%",
    };

    let wrapperClass = "block my-6";
    if (imageAlign === "left") wrapperClass = "float-left mr-6 mb-4 mt-1";
    else if (imageAlign === "right")
      wrapperClass = "float-right ml-6 mb-4 mt-1";
    else wrapperClass = "mx-auto my-6";

    const safeAlt = imageAltInput.replace(/"/g, "&quot;");
    const caption = imageCaptionInput.trim();

    const imgHtml =
      `<figure contenteditable="false" class="${wrapperClass}" style="max-width:${widthMap[imageSize]};width:100%;">` +
      `<img src="${finalImageUrl}" alt="${safeAlt}" style="width:100%;height:auto;display:block;" class="rounded-xl border border-slate-200 shadow-sm" />` +
      (caption
        ? `<figcaption class="text-[11px] text-slate-400 text-center mt-2 font-semibold">${caption.replace(/</g, "&lt;")}</figcaption>`
        : "") +
      `</figure><p><br></p>`;

    insertHtmlAtCursor(imgHtml);

    setIsImageModalOpen(false);
    setImageUrlInput("");
    setImageAltInput("");
    setImageCaptionInput("");
    setSelectedFile(null);
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
    setFormData((prev) => ({ ...prev, slug: slugify(e.target.value) }));
  };

  const handleFaqChange = (index: number, field: keyof FAQ, value: string) => {
    const updated = [...faqs];
    updated[index][field] = value;
    setFaqs(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    const htmlContent = editorRef.current?.innerHTML || "";
    if (!htmlContent || htmlContent === "<br>") {
      triggerAlert(
        "error",
        "The core article content editor canvas cannot be empty.",
      );
      setActionLoading(false);
      setActiveTab("content");
      return;
    }
    if (!formData.title.trim()) {
      triggerAlert("error", "Blog title is required.");
      setActionLoading(false);
      setActiveTab("content");
      return;
    }

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
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
        <Loader2 className="w-8 h-8 text-[#977400] animate-spin" />
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

  return (
    <div className="min-h-screen pb-16">
      {alert && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl border text-xs font-black uppercase tracking-wider shadow-xl backdrop-blur-md bg-white ${
            alert.type === "success"
              ? "border-emerald-200 text-emerald-700"
              : "border-rose-200 text-rose-700"
          }`}
        >
          {alert.message}
        </div>
      )}

      {/* Control Action Header bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Tooltip label="Back to blog list">
            <button
              onClick={() => router.push("/blog-management")}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Tooltip>
          <div>
            <h1 className="text-base font-black tracking-tight text-slate-900">
              {blogId ? "Edit Blog Article" : "Create New Blog Entry"}
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Premium Content Engine Workspace
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-2">
            <FileText className="w-3.5 h-3.5" />
            <span>{stats.words} words</span>
            <span className="text-slate-300">•</span>
            <Clock className="w-3.5 h-3.5" />
            <span>{readTimeMinutes} min read</span>
          </div>
          <Tooltip label="Controls where this article appears">
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="text-xs font-bold border bg-black border-slate-200 rounded-xl px-3 py-2.5 text-white focus:outline-hidden cursor-pointer"
            >
              <option value="draft">Draft</option>
              <option value="published">Publish Globally</option>
              <option value="archived">Archive Asset</option>
            </select>
          </Tooltip>
          <Tooltip label="Save this article">
            <button
              onClick={handleSubmit}
              disabled={actionLoading || uploadingImage || uploadingCover}
              className="bg-[#977400] hover:bg-[#634c00] text-white text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
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
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-1.5 flex gap-1 shadow-xs">
            {tabs.map((tab) => (
              <Tooltip key={tab.key} label={`Switch to ${tab.label}`}>
                <button
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    activeTab === tab.key
                      ? "bg-slate-900 text-white"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
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
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                  Blog Title
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter blog article heading title..."
                  className="w-full text-sm text-black font-bold border border-slate-200 rounded-xl px-4 py-3 focus:outline-hidden focus:border-[#0284c7]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                  Short Description / Excerpt
                </label>
                <textarea
                  name="shortDescription"
                  required
                  rows={2}
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                  placeholder="Brief introductory overview for directories card system components..."
                  className="w-full text-xs text-black font-semibold border border-slate-200 rounded-xl px-4 py-3 focus:outline-hidden focus:border-[#0284c7] resize-none"
                />
              </div>
            </div>

            {/* ADVANCED RICH TEXT EDITOR */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col min-h-[560px]">
              <div className="bg-slate-50 border-b border-slate-200 p-2 flex flex-wrap gap-1 items-center">
                {/* Block format */}
                <ToolbarButton
                  icon={<Pilcrow className="w-3.5 h-3.5" />}
                  label="Paragraph"
                  onMouseDown={() => executeCommand("formatBlock", "<p>")}
                />
                <ToolbarButton
                  icon={<Heading1 className="w-3.5 h-3.5" />}
                  label="Heading 1"
                  onMouseDown={() => executeCommand("formatBlock", "<h1>")}
                />
                <ToolbarButton
                  icon={<Heading2 className="w-3.5 h-3.5" />}
                  label="Heading 2"
                  onMouseDown={() => executeCommand("formatBlock", "<h2>")}
                />
                <ToolbarButton
                  icon={<Heading3 className="w-3.5 h-3.5" />}
                  label="Heading 3"
                  onMouseDown={() => executeCommand("formatBlock", "<h3>")}
                />
                <ToolbarButton
                  icon={<Heading4 className="w-3.5 h-3.5" />}
                  label="Heading 4"
                  onMouseDown={() => executeCommand("formatBlock", "<h4>")}
                />

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
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-200/70 cursor-pointer relative"
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
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-200/70 cursor-pointer relative"
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

                {/* Font size */}
                <Tooltip label="Font size">
                  <select
                    onMouseDown={saveSelection}
                    onChange={(e) => {
                      if (savedRangeRef.current) {
                        const sel = window.getSelection();
                        sel?.removeAllRanges();
                        sel?.addRange(savedRangeRef.current);
                      }
                      executeCommand("fontSize", e.target.value);
                      e.target.selectedIndex = -1;
                    }}
                    defaultValue=""
                    className = "h-8 text-[10px] font-bold bg-[#929000] text-slate-800 border border-[#1e293b] rounded-xl px-1.5 focus:outline-none focus:border-[#927948] cursor-pointer"
                  >
                    <option value="" disabled>
                      Size
                    </option>
                    {FONT_SIZES.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
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
                  onMouseDown={() =>
                    executeCommand("formatBlock", "<blockquote>")
                  }
                />
                <ToolbarButton
                  icon={<Code2 className="w-3.5 h-3.5" />}
                  label="Code block"
                  onMouseDown={() => executeCommand("formatBlock", "<pre>")}
                />
                <ToolbarButton
                  icon={<Minus className="w-3.5 h-3.5" />}
                  label="Horizontal rule"
                  onMouseDown={() => executeCommand("insertHorizontalRule")}
                />

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
                    className="ml-0.5 px-2.5 h-8 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg cursor-pointer flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider shadow-2xs"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-[#0284c7]" />
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

              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={updateStats}
                onMouseUp={saveSelection}
                onKeyUp={saveSelection}
                data-placeholder="Start writing your article here..."
                className="editor-canvas flex-1 p-6 focus:outline-hidden prose prose-sm max-w-none min-h-[460px] overflow-y-auto text-sm text-slate-800 leading-relaxed"
              />

              <div className="border-t border-slate-200 bg-slate-50/70 px-4 py-2 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span>
                  {stats.words} words · {stats.chars} characters
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {readTimeMinutes} min read
                </span>
              </div>
            </div>
          </div>

          <div
            className={
              activeTab === "seo"
                ? "bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 animate-fadeIn"
                : "hidden"
            }
          >
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                Meta Title
              </label>
              <input
                type="text"
                name="metaTitle"
                value={formData.metaTitle}
                onChange={handleInputChange}
                placeholder="SEO document browser tab title tag text..."
                className="w-full text-xs text-black font-semibold border border-slate-200 rounded-xl px-4 py-3 focus:outline-hidden focus:border-[#0284c7]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                Meta Description
              </label>
              <textarea
                name="metaDescription"
                rows={4}
                value={formData.metaDescription}
                onChange={handleInputChange}
                placeholder="SEO description layout parameters..."
                className="w-full text-xs text-black font-semibold border border-slate-200 rounded-xl px-4 py-3 focus:outline-hidden focus:border-[#0284c7] resize-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                Meta Keywords (Comma Separated)
              </label>
              <input
                type="text"
                name="metaKeywordsString"
                value={formData.metaKeywordsString}
                onChange={handleInputChange}
                placeholder="medical tools, surgical guidance, operational metrics"
                className="w-full text-xs text-black font-semibold border border-slate-200 rounded-xl px-4 py-3 focus:outline-hidden focus:border-[#0284c7]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                Canonical URL (optional)
              </label>
              <input
                type="url"
                name="canonicalUrl"
                value={formData.canonicalUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/blog/original-post"
                className="w-full text-xs text-black font-semibold border border-slate-200 rounded-xl px-4 py-3 focus:outline-hidden focus:border-[#0284c7]"
              />
            </div>
          </div>

          <div
            className={
              activeTab === "faqs"
                ? "bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 animate-fadeIn"
                : "hidden"
            }
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                Dynamic Accordion FAQ System
              </span>
              <Tooltip label="Add a new question/answer pair">
                <button
                  type="button"
                  onClick={() =>
                    setFaqs([...faqs, { question: "", answer: "" }])
                  }
                  className="text-xs font-extrabold text-[#0284c7] flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add FAQ Row Block
                </button>
              </Tooltip>
            </div>

            {faqs.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 border border-slate-200 border-dashed rounded-xl text-slate-400 text-xs font-semibold">
                No core contextual question structures appended yet.
              </div>
            ) : (
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="bg-slate-50/60 border border-slate-200 rounded-xl p-4 space-y-3 relative"
                  >
                    <Tooltip label="Remove this FAQ">
                      <button
                        type="button"
                        onClick={() =>
                          setFaqs(faqs.filter((_, i) => i !== index))
                        }
                        className="absolute top-4 right-4 p-1 text-slate-900 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </Tooltip>
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
                        className="w-full text-xs text-black font-semibold bg-white border border-slate-200 rounded-xl px-3.5 py-2"
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
                        className="w-full text-xs text-black font-semibold bg-white border border-slate-200 rounded-xl px-3.5 py-2 resize-none"
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
                ? "bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 animate-fadeIn"
                : "hidden"
            }
          >
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                Schedule Publish (optional)
              </label>
              <input
                type="datetime-local"
                name="scheduledAt"
                value={formData.scheduledAt}
                onChange={handleInputChange}
                className="w-full text-xs text-black font-semibold border border-slate-200 rounded-xl px-4 py-3 focus:outline-hidden focus:border-[#0284c7]"
              />
              <p className="text-[10px] font-semibold text-slate-400 mt-1.5">
                Leave blank to publish immediately when status is set to
                Published.
              </p>
            </div>

            <ToggleRow
              label="Featured Article"
              hint="Pin to the top of the blog listing page"
              value={formData.featured}
              onChange={(v) =>
                setFormData((prev) => ({ ...prev, featured: v }))
              }
            />
            <ToggleRow
              label="Allow Comments"
              hint="Readers can leave comments on this article"
              value={formData.allowComments}
              onChange={(v) =>
                setFormData((prev) => ({ ...prev, allowComments: v }))
              }
            />

            <div className="pt-2 border-t border-slate-100">
              <p className="text-[10px] font-black text-slate-800 uppercase tracking-wider mb-2">
                Summary
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-slate-800">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                  <span className="block text-[9px] font-black text-slate-800 uppercase tracking-wider mb-0.5">
                    Word Count
                  </span>
                  {stats.words}
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                  <span className="block text-[9px] font-black text-slate-800 uppercase tracking-wider mb-0.5">
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
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider border-b border-slate-100 pb-2">
              Classification
            </h3>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleInputChange}
                className="w-full text-xs font-semibold border border-slate-200 bg-black text-white rounded-xl px-3.5 py-2.5 focus:outline-hidden appearance-none"
              >
                <option value="" disabled hidden>
                  Select a category
                </option>
                <option value="Blog">Blog</option>
                <option value="Case Study">Case Study</option>
                <option value="Travel Guide">Travel Guide</option>
                <option value="Patient Story">Patient Story</option>
              </select>
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
                className="w-full text-xs text-black font-semibold border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-hidden font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                Author Label
              </label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                className="w-full text-xs text-black font-semibold border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                Tags (Comma Separated)
              </label>
              <input
                type="text"
                name="tagsString"
                value={formData.tagsString}
                onChange={handleInputChange}
                placeholder="delhi, jci care, bypass costs"
                className="w-full text-xs text-black font-semibold border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-black uppercase text-slate-900 tracking-wider border-b border-slate-100 pb-2">
              Main Cover Image
            </h3>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                Upload Cover to Cloudinary
              </label>
              <Tooltip label="Upload a cover photo from your device">
                <label className="w-full border border-slate-200 border-dashed rounded-xl py-3 px-4 bg-slate-50 text-slate-700 flex items-center justify-center gap-2 cursor-pointer text-xs font-bold transition-all hover:bg-slate-100">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageFileChange}
                    className="hidden"
                  />
                  {uploadingCover ? (
                    <Loader2 className="w-4 h-4 text-[#005580] animate-spin" />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-[#005580]" />
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
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                Image Alt Text
              </label>
              <input
                type="text"
                name="coverAlt"
                value={formData.coverAlt}
                onChange={handleInputChange}
                placeholder="Accessibility description text metrics label..."
                className="w-full text-xs text-black font-semibold border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-hidden"
              />
            </div>
            {formData.coverImage && (
              <div className="w-full h-32 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden relative mt-2">
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <form
            onSubmit={handleLinkSubmit}
            className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4 animate-scaleUp"
          >
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                Insert Hyperlink
              </h3>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
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
                  className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3.5 py-2 focus:outline-hidden focus:border-[#0284c7]"
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
                  className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3.5 py-2 focus:outline-hidden focus:border-[#0284c7]"
                />
              </div>
              <button
                type="button"
                onClick={() => setLinkNewTab(!linkNewTab)}
                className="flex items-center justify-between w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 cursor-pointer"
              >
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5" /> Open in new tab
                </span>
                {linkNewTab ? (
                  <ToggleRight className="w-6 h-6 text-[#0284c7]" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-slate-300" />
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="text-xs font-black uppercase bg-[#0284c7] hover:bg-[#0369a1] text-white py-2.5 rounded-xl tracking-wider shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Insert Link</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CLOUDINARY INTEGRATED POPUP ASSET SELECTION MODAL SYSTEM */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn overflow-y-auto">
          <form
            onSubmit={handleImageInsertionSubmit}
            className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4 animate-scaleUp my-8"
          >
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                Select & Configure Image Asset
              </h3>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                Inject direct URLs or Cloudinary uploads
              </p>
            </div>

            {/* Toggle Switch Tabs inside popup selector interface */}
            <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setImageSourceMode("url")}
                className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  imageSourceMode === "url"
                    ? "bg-white text-slate-950 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                External URL
              </button>
              <button
                type="button"
                onClick={() => setImageSourceMode("upload")}
                className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  imageSourceMode === "upload"
                    ? "bg-white text-slate-950 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Cloudinary Storage Upload
              </button>
            </div>

            <div className="space-y-3">
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
                    className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3.5 py-2 focus:outline-hidden focus:border-[#0284c7]"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">
                    Select Local File Asset
                  </label>
                  <label className="w-full border border-slate-200 border-dashed rounded-xl py-3 px-4 bg-slate-50 text-slate-700 flex items-center justify-center gap-2 cursor-pointer text-xs font-bold transition-all hover:bg-slate-100">
                    <input
                      type="file"
                      accept="image/*"
                      required={imageSourceMode === "upload" && !selectedFile}
                      onChange={(e) =>
                        setSelectedFile(e.target.files?.[0] || null)
                      }
                      className="hidden"
                    />
                    <ImageIcon className="w-4 h-4 text-[#0284c7]" />
                    <span className="truncate">
                      {selectedFile
                        ? selectedFile.name
                        : "Choose file from folder"}
                    </span>
                  </label>
                </div>
              )}

              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">
                  Image Alt Text (Accessibility Description)
                </label>
                <input
                  type="text"
                  value={imageAltInput}
                  required
                  onChange={(e) => setImageAltInput(e.target.value)}
                  placeholder="Provide keyword alt layout tags mapping text..."
                  className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3.5 py-2 focus:outline-hidden focus:border-[#0284c7]"
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
                  placeholder="Shown beneath the image in italics"
                  className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3.5 py-2 focus:outline-hidden focus:border-[#0284c7]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">
                    Size
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(["small", "medium", "large", "full"] as ImageSize[]).map(
                      (s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setImageSize(s)}
                          className={`text-[10px] font-bold py-1.5 rounded-lg border capitalize cursor-pointer transition-colors ${
                            imageSize === s
                              ? "bg-[#0284c7] text-white border-[#0284c7]"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {s}
                        </button>
                      ),
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">
                    Alignment
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(["left", "center", "right"] as ImageAlign[]).map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => setImageAlign(a)}
                        className={`text-[10px] font-bold py-1.5 rounded-lg border capitalize cursor-pointer transition-colors ${
                          imageAlign === a
                            ? "bg-[#0284c7] text-white border-[#0284c7]"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsImageModalOpen(false);
                  setSelectedFile(null);
                }}
                className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploadingImage}
                className="text-xs font-black uppercase bg-[#0284c7] hover:bg-[#0369a1] text-white py-2.5 rounded-xl tracking-wider shadow-xs cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {uploadingImage && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                <span>Insert Image</span>
              </button>
            </div>
          </form>
        </div>
      )}

      <style jsx global>{`
        .editor-canvas:empty::before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
        }
        .editor-canvas h1 {
          font-size: 1.75rem;
          font-weight: 800;
          margin: 1.25rem 0 0.5rem;
          color: #0f172a;
        }
        .editor-canvas h2 {
          font-size: 1.4rem;
          font-weight: 800;
          margin: 1.1rem 0 0.5rem;
          color: #0f172a;
        }
        .editor-canvas h3 {
          font-size: 1.15rem;
          font-weight: 700;
          margin: 1rem 0 0.4rem;
          color: #0f172a;
        }
        .editor-canvas h4 {
          font-size: 1rem;
          font-weight: 700;
          margin: 0.9rem 0 0.4rem;
          color: #0f172a;
        }
        .editor-canvas p {
          margin: 0.6rem 0;
        }
        .editor-canvas blockquote {
          border-left: 3px solid #0284c7;
          background: #f0f9ff;
          padding: 0.75rem 1rem;
          border-radius: 0 0.5rem 0.5rem 0;
          margin: 1rem 0;
          color: #334155;
          font-style: italic;
        }
        .editor-canvas pre {
          background: #0f172a;
          color: #e2e8f0;
          padding: 1rem;
          border-radius: 0.75rem;
          overflow-x: auto;
          font-size: 0.75rem;
          margin: 1rem 0;
        }
        .editor-canvas ul {
          list-style: disc;
          padding-left: 1.5rem;
          margin: 0.6rem 0;
        }
        .editor-canvas ol {
          list-style: decimal;
          padding-left: 1.5rem;
          margin: 0.6rem 0;
        }
        .editor-canvas a {
          color: #0284c7;
          text-decoration: underline;
        }
        .editor-canvas hr {
          border: none;
          border-top: 1px solid #e2e8f0;
          margin: 1.5rem 0;
        }
        .editor-canvas figure {
          clear: both;
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
