/**
 * Single source of truth for navigation. Both the public Header and the
 * Footer consume this list, so any structural change to the IA happens in one
 * place (Single Responsibility / DRY).
 */

export type NavLink = {
  /** Anchor href (must be absolute or root-relative). */
  href: string;
  /** Display label. */
  label: string;
  /** Optional longer label used by the footer. */
  longLabel?: string;
};

export const primaryNav: readonly NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About", longLabel: "About Us" },
  { href: "/services", label: "Services", longLabel: "Our Services" },
  { href: "/projects", label: "Projects" },
  { href: "/contact", label: "Contact", longLabel: "Contact Us" },
] as const;
