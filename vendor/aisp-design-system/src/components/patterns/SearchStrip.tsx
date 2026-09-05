import { useState, type FormEvent } from "react";
import { Icon } from "@/icons";

export type SearchType = {
  value: string;
  label: string;
};

type SearchStripProps = {
  types?: SearchType[];
  defaultType?: string;
  placeholder?: string;
  advancedLabel?: string;
  onAdvanced?: () => void;
  onSearch?: (query: string, type: string) => void;
};

/**
 * Desktop search bar (spec §8.1).
 *
 * Four columns: [type select] [input] [advanced link] [blue button]
 * Border is single 1px line — no shadow, no radius.
 */
export function SearchStrip({
  types = [
    { value: "person", label: "Person" },
    { value: "occurrence", label: "Occurrence" },
    { value: "address", label: "Address" },
    { value: "vehicle", label: "Vehicle" },
  ],
  defaultType,
  placeholder = "Name DOB OR ID",
  advancedLabel = "Advanced",
  onAdvanced,
  onSearch,
}: SearchStripProps) {
  const [type, setType] = useState(defaultType ?? types[0]?.value ?? "");
  const [query, setQuery] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSearch?.(query, type);
  }

  return (
    <form className="search-strip" onSubmit={handleSubmit} role="search">
      <select
        className="search-strip__type"
        value={type}
        onChange={(e) => setType(e.target.value)}
        aria-label="Search type"
      >
        {types.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
      <input
        className="search-strip__input"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        aria-label="Search query"
      />
      <button
        type="button"
        className="search-strip__advanced"
        onClick={onAdvanced}
      >
        {advancedLabel}
      </button>
      <button
        type="submit"
        className="search-strip__button"
        aria-label="Search"
      >
        <Icon name="search" size={18} />
      </button>
    </form>
  );
}
