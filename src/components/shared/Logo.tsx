import Link from "next/link";
import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="Pockets Home">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary"
        {...props}
      >
        <path d="M4 8V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6" />
        <path d="M2 12h10" />
        <path d="M12 18v-1a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v1" />
      </svg>
      <span className="font-headline font-semibold text-lg text-foreground">
        Pockets
      </span>
    </Link>
  );
}
