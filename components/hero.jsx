"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image";
import { useEffect, useRef } from "react";

const HeroSection = () => {
  const imageRef = useRef();

  useEffect(() => {
    const imageElement = imageRef.current;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollThreshold = 100;

      if (scrollPosition > scrollThreshold) {
        imageElement.classList.remove("rotate-x-[15deg]", "scale-100");
        imageElement.classList.add(
          "rotate-x-[0deg]",
          "translate-y-[40px]",
          "scale-100"
        );
      } else {
        imageElement.classList.remove("rotate-x-[0deg]", "translate-y-[40px]");
        imageElement.classList.add("rotate-x-[15deg]", "scale-100");
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="pb-20 px-4">
      <div className="container mx-auto text-center">
        {/* ✅ Gradient Text Title */}
        <h1 className="text-5xl md:text-8xl lg:text-[105px] pb-6 bg-gradient-to-br from-blue-600 to-purple-600 text-transparent bg-clip-text font-extrabold tracking-tighter pr-2">
          Educational Videos <br /> with AI-powered Intelligence
        </h1>

        {/* ✅ Subtitle */}
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          An AI-powered Video Generation for Educators which turns lessons into
          interactive videos with ease. Engage students with dynamic visuals and
          personalized content. Support for multiple languages for a global
          reach.
        </p>

        {/* ✅ Buttons */}
        <div className="flex justify-center space-x-4">
          <Link href="/dashboard">
            <Button size="lg" className="px-8">
              Get Started
            </Button>
          </Link>
          <Link href="">
            <Button size="lg" variant="outline" className="px-8">
              Watch Demo
            </Button>
          </Link>
        </div>

        {/* ✅ Hero Image Wrapper with Perspective Effect */}
        <div className="perspective-[1000px] mt-10">
          <div
            ref={imageRef}
            className="transition-transform duration-500 ease-out rotate-x-[15deg] scale-100 will-change-transform"
          >
            <Image
              src="/banner.png"
              width={1280}
              height={720}
              alt="Dashboard Preview"
              className="rounded-lg shadow-2xl border mx-auto"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
