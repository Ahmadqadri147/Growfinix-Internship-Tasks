import { Fragment } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: Crumb[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const all = [{ label: "Home", href: "/" }, ...items];
  return (
    <nav className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground" aria-label="Breadcrumb">
      {all.map((item, i) => (
        <Fragment key={`${item.label}-${i}`}>
          {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />}
          {item.href && i < all.length - 1 ? (
            <Link to={item.href} className="flex items-center gap-1 transition-colors hover:text-primary">
              {i === 0 && <Home className="h-3.5 w-3.5" />}
              <span className="line-clamp-1">{item.label}</span>
            </Link>
          ) : (
            <span className="line-clamp-1 font-medium text-foreground">{item.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
