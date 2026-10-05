import Image from "next/image";

//components
import SearchBar from "../shared/SearchBar";

const Hero = () => {
  return (
    <div className="relative w-full min-h-[300px] sm:min-h-[440px] md:h-[540px] lg:h-[600px] flex items-center justify-center">
      <Image
        src="/images/hero.webp"
        fill
        className="object-cover w-full h-full"
        alt="hero image"
        priority
      />

      {/* Enhanced dark gradient overlay for optimal text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/70"></div>

      {/* Text and Search Bar */}
      <div className="relative z-10 flex flex-col items-center justify-center text-white text-center px-4 py-6 sm:py-12 w-full">
        <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-[42px] font-bold font-title leading-tight tracking-tight max-w-3xl">
          Plan your wedding hassle-free with us!
        </h1>

        <p className="mt-1.5 sm:mt-3 text-xs sm:text-base md:text-lg text-zinc-100/90 font-body max-w-xl">
          Search, add to the checklist, and plan your wedding!
        </p>

        <div className="mt-3.5 sm:mt-7 w-full max-w-md px-1 sm:px-2">
          <SearchBar size="large" />
        </div>
      </div>
    </div>
  );
};

export default Hero;
