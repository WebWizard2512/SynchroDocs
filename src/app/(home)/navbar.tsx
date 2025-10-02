import Link from "next/link";
import Image from "next/image";
import { SearchInput } from "./search-input";
import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";

export const Navbar = () => {
  return (
    <nav className="relative flex items-center justify-between h-full w-full px-3 md:px-6 py-2">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 backdrop-blur-sm -z-10 rounded-xl" />
      
      {/* Logo Section */}
      <div className="flex gap-2 md:gap-3 items-center shrink-0 pr-3 md:pr-6">
        <Link 
          href="/" 
          className="group flex items-center gap-2 md:gap-3 hover:scale-105 transition-transform duration-300">
          <div className="relative">
            <Image 
              src="/logo.svg" 
              alt="Logo" 
              width={36} 
              height={36} 
              className="drop-shadow-lg group-hover:drop-shadow-2xl transition-all" 
              priority
            />
            {/* Glow effect */}
            <div className="absolute inset-0 bg-primary/20 blur-xl group-hover:bg-primary/40 transition-all -z-10" />
          </div>
          <h3 className="text-lg md:text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent hidden sm:block animate-gradient bg-[length:200%_auto]">
            SynchroDocs
          </h3>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-2xl">
        <SearchInput />
      </div>

      {/* Actions Section */}
      <div className="flex gap-2 md:gap-3 items-center pl-3 md:pl-6 shrink-0">
        {/* Organization Switcher - Hidden on small screens */}
        <div className="hidden sm:block">
          <OrganizationSwitcher
            afterCreateOrganizationUrl="/"
            afterSelectOrganizationUrl="/"
            afterSelectPersonalUrl="/"
            afterLeaveOrganizationUrl="/"
            appearance={{
              elements: {
                rootBox: "hover:scale-105 transition-transform",
                organizationSwitcherTrigger: "border border-gray-200 hover:border-primary/50 transition-colors rounded-lg shadow-sm hover:shadow-md"
              }
            }}
          />
        </div>

        {/* User Button */}
        <div className="relative">
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "w-9 h-9 md:w-10 md:h-10 ring-2 ring-primary/20 hover:ring-primary/50 transition-all hover:scale-110"
              }
            }}
          />
        </div>
      </div>

      {/* Mobile Organization Switcher */}
      <div className="fixed bottom-4 right-4 sm:hidden z-50">
        <OrganizationSwitcher
          afterCreateOrganizationUrl="/"
          afterSelectOrganizationUrl="/"
          afterSelectPersonalUrl="/"
          afterLeaveOrganizationUrl="/"
          appearance={{
            elements: {
              rootBox: "shadow-2xl",
              organizationSwitcherTrigger: "bg-gradient-to-r from-primary to-accent text-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all"
            }
          }}
        />
      </div>
    </nav>
  );
};