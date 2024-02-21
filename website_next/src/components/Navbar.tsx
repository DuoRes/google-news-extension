"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import Image from "next/image";

const Navbar = () => {
  console.log(useSession());
  const { data: session } = useSession();
  console.log(session);
  return (
    <div className="sticky top-0 p-7 shadow-md w-full">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">
          <Link href="/">Google News Research</Link>
        </h1>
        <div className="space-x-4 flex items-center">
          {session ? (
            <Link href="/profile">
              <div className="flex items-center space-x-2">
                <Image
                  src={session.user?.image as string}
                  width={30}
                  height={30}
                  className="rounded-full"
                  alt="User Image"
                />
                <span>{session.user?.name}</span>
              </div>
            </Link>
          ) : (
            <Link href="/login">Login</Link>
          )}
          <Link href="/about">About</Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
