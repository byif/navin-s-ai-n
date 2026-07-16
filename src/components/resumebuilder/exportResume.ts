import {
  AlignmentType,
  Document,
  ExternalHyperlink,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import type { EducationItem, ExperienceItem, ProjectItem, ResumeData, SimpleEntry } from "./types";

const clean = (value?: string) => (value || "").replace(/\s+/g, " ").trim();

export const resumeFileName = (data: ResumeData, extension: "pdf" | "docx") => {
  const base = clean(data.versionName) || clean(data.personal.fullName) || "resume";
  return `${base.replace(/[\\/:*?"<>|]+/g, "").replace(/\s+/g, "-").toLowerCase()}.${extension}`;
};

export const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 400);
};

export const exportResumePdf = (resumeElement: HTMLElement | null, fileName: string) => {
  const source = resumeElement?.querySelector("#resume-print-area") ?? resumeElement;
  if (!source) throw new Error("Resume preview is not ready yet. Please wait for the preview to load.");

  const printWindow = window.open("", "_blank", "width=980,height=1200");
  if (!printWindow) throw new Error("The browser blocked the PDF window. Please allow popups for this site and try again.");

  const styles = Array.from(document.querySelectorAll<HTMLStyleElement | HTMLLinkElement>('style,link[rel="stylesheet"]'))
    .map((node) => node.outerHTML)
    .join("\n");

  printWindow.document.open();
  printWindow.document.write(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${fileName}</title>
    ${styles}
    <style>
      @page { size: A4; margin: 12mm; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box; }
      html, body { margin: 0; padding: 0; background: #ffffff !important; }
      body { display: block; font-family: Inter, Arial, sans-serif; }
      #resume-export-root { width: 186mm; min-height: 273mm; margin: 0 auto; background: #ffffff; }
      #resume-print-area { width: 100% !important; min-height: auto !important; box-shadow: none !important; break-after: auto; }
      section, header, aside, main, div, p, h1, h2, h3 { break-inside: avoid; page-break-inside: avoid; }
      p, li, span { overflow-wrap: anywhere; }
      .rounded-3xl, .rounded-\\[32px\\] { border-radius: 18px !important; }
      @media print {
        body { width: 210mm; }
        #resume-export-root { width: 186mm; }
      }
    </style>
  </head>
  <body>
    <main id="resume-export-root">${(source as HTMLElement).outerHTML}</main>
    <script>
      window.onload = () => setTimeout(() => {
        window.focus();
        window.print();
      }, 300);
    </script>
  </body>
</html>`);
  printWindow.document.close();
};

const text = (value: string, options: ConstructorParameters<typeof TextRun>[0] = {}) =>
  new TextRun({ text: value, size: 21, font: "Calibri", ...options });

const heading = (label: string) =>
  new Paragraph({
    text: label,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 260, after: 100 },
    border: { bottom: { color: "CBD5E1", space: 1, style: "single", size: 6 } },
  });

const paragraph = (value?: string) =>
  clean(value)
    ? new Paragraph({ children: [text(clean(value))], spacing: { after: 110 }, alignment: AlignmentType.LEFT })
    : undefined;

const bullet = (value?: string) =>
  clean(value)
    ? new Paragraph({ children: [text(clean(value))], bullet: { level: 0 }, spacing: { after: 80 } })
    : undefined;

const entryTitle = (left: string, right?: string) =>
  new Paragraph({
    children: [
      text(clean(left), { bold: true, size: 23 }),
      ...(clean(right) ? [text(`    ${clean(right)}`, { italics: true, size: 20, color: "475569" })] : []),
    ],
    spacing: { before: 120, after: 40 },
  });

const maybeLink = (value?: string) => {
  const link = clean(value);
  if (!link) return undefined;
  if (!/^https?:\/\//i.test(link)) return text(link);
  return new ExternalHyperlink({
    link,
    children: [text(link, { style: "Hyperlink", color: "2563EB", underline: {} })],
  });
};

const addExperience = (items: ExperienceItem[] | undefined, children: Paragraph[]) => {
  (items || []).forEach((item) => {
    children.push(entryTitle(`${item.role || "Role"} - ${item.company || "Company"}`, item.duration));
    const description = bullet(item.description);
    if (description) children.push(description);
  });
};

const addProjects = (items: ProjectItem[], children: Paragraph[]) => {
  items.forEach((item) => {
    children.push(entryTitle(item.title || "Project", item.tech));
    const description = bullet(item.desc);
    if (description) children.push(description);
  });
};

const addSimpleEntries = (items: SimpleEntry[] | undefined, children: Paragraph[]) => {
  (items || []).forEach((item) => {
    const suffix = [item.year, item.detail].filter(Boolean).join(" - ");
    const line = bullet(`${item.title}${suffix ? `: ${suffix}` : ""}`);
    if (line) children.push(line);
  });
};

const addEducation = (items: EducationItem[], children: Paragraph[]) => {
  items.forEach((item) => {
    children.push(entryTitle(item.university || "University", item.year));
    const details = paragraph([item.branch, item.grade].filter(Boolean).join(" | "));
    if (details) children.push(details);
  });
};

export const buildResumeDocxBlob = async (data: ResumeData) => {
  const children: Paragraph[] = [
    new Paragraph({
      children: [text(clean(data.personal.fullName) || "Your Name", { bold: true, size: 38 })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 70 },
    }),
    new Paragraph({
      children: [
        text([data.personal.email, data.personal.phone, data.personal.address].map(clean).filter(Boolean).join(" | "), { size: 20 }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
    }),
  ];

  const profileLinks = [maybeLink(data.personal.linkedin), maybeLink(data.personal.github)].filter(Boolean);
  if (profileLinks.length) {
    children.push(new Paragraph({ children: profileLinks as Array<TextRun | ExternalHyperlink>, alignment: AlignmentType.CENTER, spacing: { after: 140 } }));
  }

  children.push(heading("Professional Summary"));
  const summary = paragraph(data.personal.summary || "Add a focused professional summary.");
  if (summary) children.push(summary);

  children.push(heading("Skills"));
  const skills = bullet((data.skills || []).join(", "));
  if (skills) children.push(skills);

  if ((data.experience || []).length) {
    children.push(heading("Experience"));
    addExperience(data.experience, children);
  }

  if ((data.projects || []).length) {
    children.push(heading("Projects"));
    addProjects(data.projects, children);
  }

  if ((data.internships || []).length) {
    children.push(heading("Internships"));
    addExperience(data.internships, children);
  }

  if ((data.education || []).length) {
    children.push(heading("Education"));
    addEducation(data.education, children);
  }

  if ((data.certifications || []).length) {
    children.push(heading("Certifications"));
    addSimpleEntries(data.certifications, children);
  }

  if ((data.achievements || []).length) {
    children.push(heading("Achievements"));
    addSimpleEntries(data.achievements, children);
  }

  if ((data.research || []).length || (data.publications || []).length) {
    children.push(heading("Research & Publications"));
    addSimpleEntries([...(data.research || []), ...(data.publications || [])], children);
  }

  if ((data.languages || []).length) {
    children.push(heading("Languages"));
    const languages = bullet((data.languages || []).join(", "));
    if (languages) children.push(languages);
  }

  const doc = new Document({
    creator: "Navin's AI Resume Studio",
    title: clean(data.versionName) || clean(data.personal.fullName) || "Resume",
    description: "ATS-friendly resume generated from Navin's AI Resume Studio.",
    styles: {
      default: {
        document: { run: { font: "Calibri", size: 21 }, paragraph: { spacing: { line: 276 } } },
      },
      paragraphStyles: [
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { bold: true, color: "1E293B", size: 23, allCaps: true },
          paragraph: { spacing: { before: 280, after: 100 } },
        },
      ],
    },
    numbering: {
      config: [
        {
          reference: "resume-bullets",
          levels: [{ level: 0, format: "bullet", text: "•", alignment: AlignmentType.LEFT }],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, right: 720, bottom: 720, left: 720 },
          },
        },
        children,
      },
    ],
  });

  return Packer.toBlob(doc);
};
