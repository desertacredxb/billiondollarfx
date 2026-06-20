// src/data/blogData.ts
export type BlogType = {
  slug: string;
  title: string;
  image: string;
  author: string;
  date: string;
  excerpt: string;
  content: string;
};

export const blogData: BlogType[] = [
  {
    slug: "forex-trading-basics",
    title: "Forex Trading Basics",
    image:
      "https://res.cloudinary.com/dqrlkbsdq/image/upload/v1750833174/blogs/jwo4ykzuwyrczmk9xah2.webp",
    author: "John Doe",
    date: "July 25, 2025",
    excerpt:
      "Get started with forex trading by understanding the essential terms, concepts, and strategies.",
    content: `## Introduction

Forex trading is the act of buying and selling currencies with the aim of making a profit. It's the largest financial market in the world.

### Why It Matters

Forex offers high liquidity, operates 24 hours, and provides various instruments to trade.`,
  },
  {
    slug: "reading-forex-charts",
    title: "Reading Forex Charts",
    image:
      "https://res.cloudinary.com/dqrlkbsdq/image/upload/v1750833174/blogs/jwo4ykzuwyrczmk9xah2.webp",
    author: "Jane Smith",
    date: "July 20, 2025",
    excerpt:
      "Learn how to interpret candlestick charts and use technical indicators for better trading decisions.",
    content: `## Candlestick Patterns

Understanding patterns like Doji, Hammer, and Engulfing is key to technical analysis.

### Tools to Use

Combine price action with indicators like RSI or MACD.`,
  },
  {
    slug: "risk-management-in-trading",
    title: "Risk Management in Trading",
    image:
      "https://res.cloudinary.com/dqrlkbsdq/image/upload/v1750833174/blogs/jwo4ykzuwyrczmk9xah2.webp",
    author: "Mike Johnson",
    date: "July 18, 2025",
    excerpt:
      "Protect your capital using stop-loss, proper lot sizing, and emotional control.",
    content: `## Capital Preservation

Never risk more than you can afford to lose. Use position sizing and diversify.

### Key Techniques

Set realistic targets and stick to your trading plan.`,
  },
];
