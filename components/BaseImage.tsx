"use client";
import React, { useState } from "react";
import Logo from "@/assets/logo.png";
import Image from "next/image";

interface BaseImageProps {
    src: string;
    width: number;
    height: number;
    blurData?: string;
    alt?: string;
    [key: string]: any;
}

export default function BaseImage({
    src,
    width,
    height,
    blurData,
    alt = "",
    ...rest
}: BaseImageProps) {
    const [imgSrc, setImgSrc] = useState<string>(src);

    return (
        <Image
            alt={alt}
            src={imgSrc}
            width={width}
            height={height}
            placeholder="blur"
            blurDataURL={blurData}
            onError={() => {
                setImgSrc(Logo.src);
            }}
            {...rest}
        />
    );
}
