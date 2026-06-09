const breadcrumbMap: Record<string, string> = {
  dashboard: "Dashboard",
  copier: "Copier",
  rating: "Top Rated",
  area: "Copier Area",
  master: "Master Area",
  terms: "Terms & Conditions",
  list: "Top Rated",
  pamm: "PAMM",
  investor: "Investor Area",
  manager: "Manager Area",
  mam: "MAM",
};

export function buildUserBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const items: { label: string; href?: string }[] = [];
  let path = "";

  segments.forEach((seg, i) => {
    path += `/${seg}`;
    const label = breadcrumbMap[seg] || seg.charAt(0).toUpperCase() + seg.slice(1);
    items.push({
      label,
      href: i < segments.length - 1 ? path : undefined,
    });
  });

  return items;
}
