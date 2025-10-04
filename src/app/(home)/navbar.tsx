import Link from "next/link";
import Image from "next/image";
import { SearchInput } from "./search-input";
import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";

export const Navbar = () => {
  return (
    <nav className="flex items-center justify-between h-full w-full">
      <div className="flex gap-3 items-center shrink-0 pr-6">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.svg" alt="Logo" width={36} height={36} />
          <span className="text-xl font-semibold hidden sm:block">
            Docs
          </span>
        </Link>
      </div>

      <SearchInput />

      <div className="flex gap-3 items-center pl-6 shrink-0">
        <OrganizationSwitcher
          afterCreateOrganizationUrl="/"
          afterSelectOrganizationUrl="/"
          afterSelectPersonalUrl="/"
          afterLeaveOrganizationUrl="/"
        />
        <UserButton />
      </div>
    </nav>
  );
};