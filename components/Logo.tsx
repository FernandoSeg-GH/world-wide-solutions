import Link from "next/link";
import React from "react";

function Logo() {
  return (
    <Link
      href={"/"}
      className="font-semibold text-2xl hover:cursor-pointer"
    >
      Vinci Suite
    </Link>
  );
}

export default Logo;