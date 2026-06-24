"use client";

import Fuse from "fuse.js";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import type { MouseEvent } from "react";

import styles from "./SubjectSearchAutocomplete.module.css";

const INPUT_DEBOUNCE = 200;

const FUSE_OPTIONS: Fuse.IFuseOptions<SearchAutocompleteItem> = {
  shouldSort: true,
  threshold: 0.6,
  location: 0,
  distance: 100,
  minMatchCharLength: 1,
  keys: ["name"],
};

export type SearchAutocompleteItem = {
  id: number;
  name: string;
};

type SubjectSearchAutocompleteProps = {
  items: SearchAutocompleteItem[];
  onSelect: (item: SearchAutocompleteItem) => void;
  formatResult?: (item: SearchAutocompleteItem) => ReactNode;
  maxResults?: number;
  placeholder?: string;
  autoFocus?: boolean;
  showNoResultsText?: string;
};

function SearchIcon() {
  return (
    <svg
      className={styles.searchIcon}
      width={20}
      height={20}
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
    </svg>
  );
}

function ClearIcon({ onClear }: { onClear: () => void }) {
  return (
    <div className={styles.clearIcon} onClick={onClear} role="button" aria-label="Clear">
      <svg
        width={20}
        height={20}
        focusable="false"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.58 12 5 17.58 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
      </svg>
    </div>
  );
}

export function SubjectSearchAutocomplete({
  items,
  onSelect,
  formatResult,
  maxResults = 10,
  placeholder = "",
  autoFocus = false,
  showNoResultsText = "No results",
}: SubjectSearchAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [searchString, setSearchString] = useState("");
  const [results, setResults] = useState<SearchAutocompleteItem[]>([]);
  const [highlightedItem, setHighlightedItem] = useState(-1);
  const [isTyping, setIsTyping] = useState(false);
  const [isSearchComplete, setIsSearchComplete] = useState(false);
  const [showNoResultsFlag, setShowNoResultsFlag] = useState(false);

  const fuse = useMemo(() => new Fuse(items, FUSE_OPTIONS), [items]);

  const fuseResults = useCallback(
    (keyword: string) => {
      if (!keyword) return [];
      return fuse
        .search(keyword, { limit: maxResults })
        .map((result) => result.item)
        .slice(0, maxResults);
    },
    [fuse, maxResults],
  );

  const eraseResults = useCallback(() => {
    setResults([]);
    setIsSearchComplete(true);
  }, []);

  const callOnSearch = useCallback(
    (keyword: string) => {
      const newResults = keyword.length > 0 ? fuseResults(keyword) : [];
      setResults(newResults);
      setIsTyping(false);
    },
    [fuseResults],
  );

  const debouncedSearch = useCallback(
    (keyword: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => callOnSearch(keyword), INPUT_DEBOUNCE);
    },
    [callOnSearch],
  );

  useEffect(() => {
    if (searchString.length > 0 && results.length > 0) {
      setResults(fuseResults(searchString));
    }
  }, [items, fuseResults, searchString, results.length]);

  useEffect(() => {
    if (
      searchString.length > 0 &&
      !isTyping &&
      results.length === 0 &&
      !isSearchComplete
    ) {
      setShowNoResultsFlag(true);
    } else {
      setShowNoResultsFlag(false);
    }
  }, [isTyping, isSearchComplete, searchString, results.length]);

  useEffect(() => {
    const handleDocumentClick = () => {
      eraseResults();
    };
    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, [eraseResults]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleSelect = (item: SearchAutocompleteItem) => {
    eraseResults();
    onSelect(item);
    setSearchString(item.name);
    setHighlightedItem(0);
  };

  const handleInputChange = (value: string) => {
    setSearchString(value);
    debouncedSearch(value);
    setIsTyping(true);
    if (isSearchComplete) {
      setIsSearchComplete(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "Enter":
        if (results.length > 0 && results[highlightedItem]) {
          event.preventDefault();
          handleSelect(results[highlightedItem]);
        }
        setHighlightedItem(-1);
        eraseResults();
        break;
      case "ArrowUp":
        event.preventDefault();
        setHighlightedItem((prev) =>
          prev > -1 ? prev - 1 : results.length - 1,
        );
        break;
      case "ArrowDown":
        event.preventDefault();
        setHighlightedItem((prev) =>
          prev < results.length - 1 ? prev + 1 : -1,
        );
        break;
      default:
        break;
    }
  };

  const handleResultMouseDown = (
    event: MouseEvent,
    item: SearchAutocompleteItem,
  ) => {
    if (event.button === 0) {
      event.preventDefault();
      handleSelect(item);
    }
  };

  const formatResultWithKey = formatResult ?? ((item) => item.name);

  const showResults =
    showNoResultsFlag || (results.length > 0 && !isSearchComplete);

  return (
    <div className={styles.root}>
      <div className={styles.wrapper}>
        <div className={styles.searchInput}>
          <SearchIcon />
          <input
            ref={inputRef}
            type="text"
            spellCheck={false}
            value={searchString}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => setIsSearchComplete(false)}
            onBlur={eraseResults}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus={autoFocus}
          />
          {searchString.length > 0 && (
            <ClearIcon
              onClear={() => {
                handleInputChange("");
                inputRef.current?.focus();
              }}
            />
          )}
        </div>

        {showResults && (
          <div>
            <div className={styles.line} />
            <ul className={styles.resultsList}>
              {showNoResultsFlag ? (
                <li className={styles.resultItem}>
                  <SearchIcon />
                  <div className={styles.ellipsis}>{showNoResultsText}</div>
                </li>
              ) : (
                results.map((result, index) => (
                  <li
                    key={`result-${result.id}`}
                    className={`${styles.resultItem} ${
                      highlightedItem === index ? styles.selected : ""
                    }`}
                    onMouseEnter={() => setHighlightedItem(index)}
                    onMouseDown={(e) => handleResultMouseDown(e, result)}
                    onClick={() => handleSelect(result)}
                  >
                    <SearchIcon />
                    <div className={styles.ellipsis} title={result.name}>
                      {formatResultWithKey(result)}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
