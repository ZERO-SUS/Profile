/* =========================================================
   Tiny, safe Markdown -> HTML renderer.
   Shared by the public blog (blog.js) and the admin editor (admin.js).
   Supports: headings, bold, italic, inline code, code blocks,
   links, images, blockquotes, unordered/ordered lists, hr, paragraphs.
   Escapes HTML first, so post content can't inject scripts.
   ========================================================= */
(function (global) {
  "use strict";

  const esc = (s) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // inline: code, bold, italic, links, images
  const inline = (s) =>
    s
      .replace(/`([^`]+)`/g, (_, c) => `<code>${c}</code>`)
      .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1" loading="lazy">')
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>");

  function render(src) {
    if (!src) return "";
    const lines = esc(src.replace(/\r\n/g, "\n")).split("\n");
    const out = [];
    let i = 0;
    let listType = null; // 'ul' | 'ol'

    const closeList = () => {
      if (listType) { out.push(`</${listType}>`); listType = null; }
    };

    while (i < lines.length) {
      let line = lines[i];

      // fenced code block
      if (/^```/.test(line)) {
        closeList();
        const buf = [];
        i++;
        while (i < lines.length && !/^```/.test(lines[i])) { buf.push(lines[i]); i++; }
        i++; // skip closing fence
        out.push(`<pre><code>${buf.join("\n")}</code></pre>`);
        continue;
      }

      // horizontal rule
      if (/^(---|\*\*\*|___)\s*$/.test(line)) { closeList(); out.push("<hr>"); i++; continue; }

      // headings
      const h = line.match(/^(#{1,4})\s+(.*)$/);
      if (h) { closeList(); const l = h[1].length; out.push(`<h${l}>${inline(h[2])}</h${l}>`); i++; continue; }

      // blockquote
      if (/^>\s?/.test(line)) {
        closeList();
        const buf = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) { buf.push(lines[i].replace(/^>\s?/, "")); i++; }
        out.push(`<blockquote>${inline(buf.join(" "))}</blockquote>`);
        continue;
      }

      // unordered list
      if (/^[-*]\s+/.test(line)) {
        if (listType !== "ul") { closeList(); out.push("<ul>"); listType = "ul"; }
        out.push(`<li>${inline(line.replace(/^[-*]\s+/, ""))}</li>`);
        i++; continue;
      }

      // ordered list
      if (/^\d+\.\s+/.test(line)) {
        if (listType !== "ol") { closeList(); out.push("<ol>"); listType = "ol"; }
        out.push(`<li>${inline(line.replace(/^\d+\.\s+/, ""))}</li>`);
        i++; continue;
      }

      // blank line
      if (/^\s*$/.test(line)) { closeList(); i++; continue; }

      // paragraph (gather consecutive non-blank, non-special lines)
      closeList();
      const buf = [line];
      i++;
      while (
        i < lines.length &&
        !/^\s*$/.test(lines[i]) &&
        !/^(#{1,4}\s|>|[-*]\s|\d+\.\s|```|---|\*\*\*|___)/.test(lines[i])
      ) { buf.push(lines[i]); i++; }
      out.push(`<p>${inline(buf.join("<br>"))}</p>`);
    }
    closeList();
    return out.join("\n");
  }

  global.ZS_md = render;
})(window);
