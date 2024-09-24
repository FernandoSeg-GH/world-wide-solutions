import Link from "next/link";
import React from "react";

function Logo() {
  return (
    <Link
      href={"/"}
      className="font-bold text-3xl hover:cursor-pointer"
    >
      VWS
    </Link>
  );
}

export default Logo;