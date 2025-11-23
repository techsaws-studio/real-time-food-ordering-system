import React from "react";
import Image from "next/image";
import Link from "next/link";

import Logo from "../../../public/favicons/logo.png";

function SystemHeader() {
  return (
    <header className="h-[90px] w-full border-b border-b-border bg-secondary-background">
      <div className="layout-standard h-full flex-center">
        <Link href={"/"} passHref>
          <Image
            className="hover:scale-105"
            src={Logo}
            alt="Real Time Ordering System"
            width={90}
          />
        </Link>
      </div>
    </header>
  );
}

export default SystemHeader;
