"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const Links = [
  {
    name: "home",
    path: "/",
  },
  {
    name: "blog",
    path: "/blog",
  },
  {
    name: "services",
    path: "/services",
  },
  {
    name: "about",
    path: "/about",
  },

  {
    name: "contact",
    path: "/contact",
  },
  {
    name: "help",
    path: "/help",
  }
];


const Nav = () => {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1.5 sm:gap-2.5 font-title">
      {Links.map((link, index) => {
        const isActive =
          link.path === "/"
            ? pathname === "/"
            : pathname.startsWith(link.path);
        return (
          <Link
            href={link.path}
            key={index}
            className={`
              capitalize px-4 py-2 rounded-xl text-base lg:text-[17px] tracking-wide transition-all
              ${
                isActive
                  ? "bg-orange text-white shadow-xs font-bold"
                  : "text-gray-700 dark:text-zinc-300 hover:text-orange hover:bg-orange/10 dark:hover:bg-zinc-800 font-semibold"
              }
            `}
          >
            {link.name}
          </Link>
        );
      })}
    </nav>
  );
};

export default Nav;
