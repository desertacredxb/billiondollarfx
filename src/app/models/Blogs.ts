import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFaq {
  question: string;
  answer: string;
}

export interface IBlog extends Document {
  title: string;
  slug: string;
  shortDescription: string;
  content: string;
  coverImage: string;
  coverAlt: string;
  status: "draft" | "published" | "archived";
  author: string;
  tags: string[];
  category: string;
  faqs: IFaq[];
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string[];
  canonicalUrl: string;
  scheduledAt: Date | null;
  featured: boolean;
  allowComments: boolean;
  readTimeMinutes: number;
  wordCount: number;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const FaqSchema = new Schema<IFaq>({
  question: { type: String, required: true, trim: true },
  answer: { type: String, required: true, trim: true },
});

const BlogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    shortDescription: { type: String, required: true, trim: true },
    content: { type: String, required: true }, // Rich Text / HTML content string
    coverImage: { type: String, required: true }, // Image storage absolute URL path
    coverAlt: { type: String, default: "" },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },
    author: { type: String, default: "Admin Panel" },
    tags: [{ type: String, trim: true }],
    category: { type: String, required: true, index: true },
    faqs: [FaqSchema],
    // Built-in SEO Core Engine Fields
    metaTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },
    metaKeywords: [{ type: String, trim: true }],
    // Optional override; when empty the page uses its own /blog/<slug> URL
    canonicalUrl: { type: String, trim: true, default: "" },
    scheduledAt: { type: Date, default: null },
    featured: { type: Boolean, default: false },
    allowComments: { type: Boolean, default: true },
    readTimeMinutes: { type: Number, default: 0 },
    wordCount: { type: Number, default: 0 },
    publishedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

// Automatic URL slug generation helper before verification/saving
BlogSchema.pre("validate", function (next) {
  if (this.title && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  }
  if (this.status === "published" && !this.publishedAt) {
    this.publishedAt = new Date();
  }
//   next();
});

const Blog: Model<IBlog> = mongoose.models.Blog || mongoose.model<IBlog>("Blog", BlogSchema);
export default Blog;