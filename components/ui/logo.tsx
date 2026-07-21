export function LogoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M45 8 C47 28 50 32 68 38 C50 42 47 48 45 68 C43 48 40 42 22 38 C40 32 43 28 45 8 Z"
        fill="white"
      />
      <path d="M64 40 L30 78" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
      <path
        d="M20 55 C21.5 65 23 67 33 70 C23 72 21.5 75 20 85 C18.5 75 17 72 7 70 C17 67 18.5 65 20 55 Z"
        fill="white"
        opacity="0.9"
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <LogoIcon className="h-[30px] w-[30px] shrink-0" />
      <span className="text-[19px] font-bold tracking-[0.2px] text-white">intertech</span>
    </div>
  );
}
