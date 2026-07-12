import { Building2, ImagePlus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { cn } from "@autolab/ui/lib/utils";

type Props = {
  onLogoChange?: (file: File | null) => void;
  initialLogo?: string | null;
};

export const LogoUpload = ({ onLogoChange, initialLogo }: Props) => {
  const [logo, setLogo] = useState<string | null>(initialLogo ?? null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setLogo(initialLogo ?? null);
  }, [initialLogo]);

  const handleFileChange = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => setLogo(e.target?.result as string);
      reader.readAsDataURL(file);
      onLogoChange?.(file);
    },
    [onLogoChange],
  );

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          const file = event.dataTransfer.files[0];
          if (file) handleFileChange(file);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        className={cn(
          "group relative flex size-28 cursor-pointer items-center justify-center rounded-xl transition-all duration-200",
          isDragging
            ? "border-2 border-dashed border-primary bg-primary/5"
            : "border-2 border-dashed border-muted-foreground/25 bg-muted/30 hover:border-primary/60 hover:bg-muted/50",
        )}
      >
        <label htmlFor="org-logo-input" className="size-full cursor-pointer">
          <div className="flex size-full items-center justify-center overflow-hidden rounded-[10px]">
            {logo ? (
              <img src={logo} alt="Логотип організації" className="size-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-1 text-muted-foreground">
                <Building2 size={28} strokeWidth={1.75} className="opacity-70" aria-hidden="true" />
                <ImagePlus size={14} className="opacity-50" aria-hidden="true" />
              </div>
            )}
          </div>
        </label>
        <input
          id="org-logo-input"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileChange(file);
          }}
        />
      </div>
      <p className="max-w-[12rem] text-center text-xs text-muted-foreground">
        Перетягніть зображення або натисніть для вибору
      </p>
    </div>
  );
};
