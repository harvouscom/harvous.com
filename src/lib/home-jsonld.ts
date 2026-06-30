import { readFileSync } from "node:fs";
import { getCollection } from "astro:content";

const SITE = "https://harvous.com";

function stripMarkdown(text: string): string {
  return text
    .replace(/[#>*_`\[\]()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function readMdxPlainText(filePath: string): string {
  const raw = readFileSync(filePath, "utf-8");
  return stripMarkdown(raw.replace(/^---[\s\S]*?---\s*/, ""));
}

export async function buildHomeJsonLd() {
  const faqEntries = (await getCollection("faq")).sort((a, b) => a.data.order - b.data.order);
  const faqEntities = faqEntries.map((f) => {
    const answerText = readMdxPlainText(f.filePath) || f.data.question;
    return {
      "@type": "Question" as const,
      name: f.data.question,
      acceptedAnswer: {
        "@type": "Answer" as const,
        text: answerText,
      },
    };
  });

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "Harvous",
        url: SITE,
        description:
          "A Bible study notes app alternative — remember and reconnect with what you saved from Scripture. Not a Bible reader. No sermon transcription.",
      },
      {
        "@type": "SoftwareApplication",
        name: "Harvous",
        applicationCategory: "ProductivityApplication",
        operatingSystem: "Web",
        url: SITE,
        description:
          "Bible study notes app with scripture pills, highlights, threads, and recall — built to help you remember what you saved, without replacing your Bible reader.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: faqEntities,
      },
    ],
  };
}
