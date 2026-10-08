'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { twMerge } from 'tailwind-merge'
import { useFrontendTool } from "@copilotkit/react-core/v2";
import { z } from "zod";

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname()
  // '/' | '/profile' | '/settings'

  const buttonStyle = 'text-black p-2 rounded-md cursor-pointer'

  const redirectFunc = (path: string) => router.push(path === 'root' ? '/' : `/${path}`)

  useFrontendTool({
    name: "redirectToPage",
    description: "Redirect to the page. Page name is required",
    parameters: z.object({
      path: z.enum(["root", "profile", "settings"]).describe(
        "Name of path to redirect to. Available paths: root or todos, profile, settings"
      ),
    }),
    handler: async ({ path }) => {
      redirectFunc(path)
      return JSON.stringify(`Redirected to ${path}!`);
    },
  });

  return (
    <aside className='w-1/8 bg-gray-200'>
      <ul className='flex flex-col gap-2 p-4'>
        <li>
          <Link href="/" className={twMerge(buttonStyle, pathname === '/' ? 'text-[#4e4e4e] text-bold' : '')}>Home</Link>
        </li>
        <li>
          <Link href="/profile" className={twMerge(buttonStyle, pathname === '/profile' ? 'text-[#4e4e4e] text-bold' : '')}>Profile</Link>
        </li>
        <li>
          <Link href="/settings" className={twMerge(buttonStyle, pathname === '/settings' ? 'text-[#4e4e4e] text-bold' : '')}>App settings</Link>
        </li>
      </ul>
    </aside>
  )
}