"use client";

interface MarqueeProps {
  items: string[];
  bgClass?: string;
  textClass?: string;
  reverse?: boolean;
}

export default function Marquee({
  items,
  bgClass = "bg-black",
  textClass = "text-white",
  reverse = false,
}: MarqueeProps) {
  // Combine items to make a long scrolling strip
  const repeatedItems = [...items, ...items, ...items, ...items];

  return (
    <div className={`relative w-full overflow-hidden border-t-[4px] border-b-[4px] border-black py-3 ${bgClass}`}>
      <div
        className={`flex whitespace-nowrap gap-8 min-w-full marquee-track ${
          reverse ? "marquee-reverse" : "marquee-normal"
        }`}
      >
        {repeatedItems.map((item, index) => (
          <span
            key={index}
            className={`font-heading text-lg sm:text-xl uppercase tracking-wider flex items-center gap-2 select-none ${textClass}`}
          >
            {item}
            <span className="inline-block size-3 bg-current rotate-45 mx-2" />
          </span>
        ))}
      </div>

      <style jsx global>{`
        .marquee-track {
          display: flex;
          width: max-content;
        }
        .marquee-normal {
          animation: marquee 20s linear infinite;
        }
        .marquee-reverse {
          animation: marquee 20s linear infinite reverse;
        }
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-normal,
          .marquee-reverse {
            animation: none;
            overflow-x: auto;
            white-space: normal;
          }
        }
      `}</style>
    </div>
  );
}

