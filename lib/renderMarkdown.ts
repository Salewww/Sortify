/**
 * Lightweight inline Markdown renderer (no dependencies).
 * Handles: **bold**, *italic*, `code`, ordered lists, unordered lists, line breaks.
 */

function formatInline(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">$1</code>');
}

export function renderMarkdown(text: string): string {
  if (!text) return '';

  const lines = text.split('\n');
  let html = '';
  let inUl = false;
  let inOl = false;

  const closeList = () => {
    if (inUl) { html += '</ul>'; inUl = false; }
    if (inOl) { html += '</ol>'; inOl = false; }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (/^\d+\.\s/.test(trimmed)) {
      if (!inOl) { closeList(); html += '<ol class="list-decimal pl-5 space-y-1 my-2">'; inOl = true; }
      html += `<li>${formatInline(trimmed.replace(/^\d+\.\s/, ''))}</li>`;
    } else if (/^[-*]\s/.test(trimmed)) {
      if (!inUl) { closeList(); html += '<ul class="list-disc pl-5 space-y-1 my-2">'; inUl = true; }
      html += `<li>${formatInline(trimmed.replace(/^[-*]\s/, ''))}</li>`;
    } else if (!trimmed) {
      closeList();
      // skip blank lines between blocks (spacing handled by margin)
    } else {
      closeList();
      html += `<p class="mb-2">${formatInline(trimmed)}</p>`;
    }
  }

  closeList();
  return html;
}
