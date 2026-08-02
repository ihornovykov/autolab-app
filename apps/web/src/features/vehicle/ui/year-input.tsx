import { useEffect, useRef, useState } from "react";

import { Input } from "@autolab/ui/components/input";

type YearInputProps = {
  label?: string;
  placeholder?: string;
  value: number;
  onChange: (value: number) => void;
  error?: string;
};

export const YearInput = ({
  label,
  placeholder = "2020",
  value,
  onChange,
  error,
}: YearInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(() => (value ? String(value) : ""));

  useEffect(() => {
    if (inputRef.current !== document.activeElement) {
      setDraft(value ? String(value) : "");
    }
  }, [value]);

  return (
    <Input
      ref={inputRef}
      label={label}
      placeholder={placeholder}
      type="text"
      inputMode="numeric"
      value={draft}
      onChange={(event) => setDraft(event.target.value.replace(/\D/g, ""))}
      onBlur={() => {
        if (draft === "") {
          onChange(0);
          return;
        }

        const parsed = Number(draft);
        onChange(parsed);
        setDraft(String(parsed));
      }}
      error={error}
    />
  );
};
