'use client';

import { Activity, Clipboard, Eye, Home,  Settings  } from "lucide-react";
import styles from './Sidebar.module.css';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
   {
    title: "Live Feed",
    url: "/live",
    icon: Activity,
  },
  {
    title: "ICare",
    url: "/icare",
    icon: Eye,
  },
  {
    title: "History",
    url: "/history",
    icon: Clipboard,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
 

];

export function Sidebar() {
  const pathname = usePathname();


  return (
    <div className={`${styles.sidebar}`}>
      <Link href='/dashboard' className={styles.header}>
        <span className={styles.logo}>
         
Rescue Eye
        </span>
      </Link>

      <nav className={styles.navigation}>
        {items.map((item) => (
          <Link
            key={item.title}
            href={item.url}
            className={styles.navItem}
            data-active={pathname === item.url}
            title={ item.title }
          >
            <item.icon size={20} />
            <span className={styles.navText}>{item.title}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
