/**
 * LaTeX Sanitizer & Escaper Utility
 * Safely escapes special LaTeX characters in user-provided plaintext to prevent
 * LaTeX injection and compilation syntax errors.
 */

export function escapeLatex(input: string | number | null | undefined): string {
  if (input === null || input === undefined) return "";
  const str = String(input);

  return str
    // 1. Backslash must be escaped first
    .replace(/\\/g, "\\textbackslash{}")
    // 2. Standard LaTeX special characters
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}")
    // 3. Comparison symbols
    .replace(/</g, "\\textless{}")
    .replace(/>/g, "\\textgreater{}")
    // 4. Clean invisible or breaking control characters
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, "");
}

/**
 * Sanitizes URLs for LaTeX \href{url}{display} commands
 */
export function escapeLatexUrl(url: string | null | undefined): string {
  if (!url) return "";
  return url
    .replace(/%/g, "\\%")
    .replace(/#/g, "\\#")
    .replace(/\$/g, "\\$");
}