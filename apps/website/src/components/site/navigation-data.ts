export const navListItems = [
  { title: "Home", href: "/" },
  { title: "Certificates", href: "/certificates" },
  { title: "Resources", href: "/resources" },
  { title: "Scholarships", href: "/scholarships" },
  { title: "Blogs", href: "/blogs" },
  { title: "Apply", href: "/apply" },
];

/** Active on the item's own page and anything beneath it (except Home). */
export function isNavItemActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
