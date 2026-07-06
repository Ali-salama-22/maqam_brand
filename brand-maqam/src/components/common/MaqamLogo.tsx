export default function MaqamLogo({ 
  className = "", 
  imgClassName = "" 
}: { 
  className?: string; 
  imgClassName?: string;
}) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <h1 className="font-serif font-black text-3xl md:text-4xl tracking-[0.15em] uppercase text-brand-text flex items-center drop-shadow-sm">
        M<span className="font-light mx-[1px]">A</span><span className="text-brand-accent mx-[1px]">Q</span><span className="font-light mx-[1px]">A</span>M
      </h1>
    </div>
  );
}
