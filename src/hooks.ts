import { useState, useEffect, useRef } from "react";
import {
  Fetch,
  File,
  baseUrl,
  BYTES_PER_ROW,
  BYTES_PER_PAGE,
  BYTES_PER_COLUMN,
} from "./base";

export function useFile() {
  const [file, setFile] = useState<Fetch<File>>({
    data: { size: 0, path: "" },
    state: "loading",
  });

  const isUnmouned = useRef(false);

  useEffect(() => {
    isUnmouned.current = false;

    fetch(baseUrl + "meta")
      .then((res) => res.json())
      .then((meta) => {
        if (isUnmouned.current) return;
        setFile({ state: "loaded", data: meta });
      })
      .catch((e) => {
        console.error(e);
        setFile({ ...file, state: "error" });
      });

    return () => {
      isUnmouned.current = true;
    };
  }, []);

  return file;
}

export function useHover(index: number, setActive: (i: number) => void) {
  const ref = useRef<HTMLElement>(null);

  const handleMouseEnter = () => setActive(index);
  const handleMouseLeave = () => setActive(index);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.addEventListener("mouseenter", handleMouseEnter);
    ref.current.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      if (!ref.current) return;
      ref.current.removeEventListener("mouseenter", handleMouseEnter);
      ref.current.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseEnter, handleMouseLeave]);

  return ref;
}

type ActiveControl = {
  up: () => void;
  down: () => void;
  left: () => void;
  right: () => void;
};

export function useActive(size: number, offset: number) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (active + offset >= size) {
      setActive(size - offset - 1);
    }
  }, [offset]);

  const up = () => {
    const upActive = active - BYTES_PER_ROW;
    if (upActive < 0) return;
    setActive(upActive);
  };

  const down = () => {
    const downActive = active + BYTES_PER_ROW;
    if (downActive > BYTES_PER_PAGE) return;
    if (downActive + offset >= size) return;
    setActive(downActive);
  };

  const left = () => {
    if (active % BYTES_PER_ROW === 0) return;
    setActive(active - 1);
  };

  const right = () => {
    if (active % BYTES_PER_ROW === BYTES_PER_ROW - 1) return;
    const rightActive = active + 1;
    if (rightActive + offset >= size) return;
    setActive(rightActive);
  };

  return { active, setActive, activeControl: { up, down, left, right } };
}

type OffsetControl = {
  setOffset: (index: number) => void;
  nextRow: () => void;
  prevRow: () => void;
  nextPage: () => void;
  prevPage: () => void;
};

export function useOffset(size: number) {
  const [offset, setOffset] = useState(0);

  const nextRow = () => {
    const nextOffset = offset + BYTES_PER_ROW;
    if (nextOffset >= size) return;
    setOffset(nextOffset);
  };
  const prevRow = () => {
    const prevOffset = offset - BYTES_PER_ROW;
    if (prevOffset < 0) return;
    setOffset(prevOffset);
  };

  const nextPage = () => {
    const nextOffset = offset + BYTES_PER_PAGE;
    if (nextOffset >= size) return;
    setOffset(nextOffset);
  };
  const prevPage = () => {
    const prevOffset = offset - BYTES_PER_PAGE;
    setOffset(prevOffset < 0 ? 0 : prevOffset);
  };

  return {
    offset,
    offsetControl: { nextRow, prevRow, nextPage, prevPage, setOffset },
  };
}

export function usePage(size: number) {
  const { offset, offsetControl } = useOffset(size);

  const [page, setPage] = useState<Fetch<number[]>>({
    state: "loading",
    data: Array.from({ length: BYTES_PER_PAGE }, () => 0),
  });

  const isUnmouned = useRef(false);

  useEffect(() => {
    isUnmouned.current = false;
    setPage({ ...page, state: "loading" });

    fetch(baseUrl + `bytes?offset=${offset}&length=${BYTES_PER_PAGE}`)
      .then((res) => res.arrayBuffer())
      .then((buffer) => {
        if (isUnmouned.current) return;
        const bytes = new Uint8Array(buffer);
        setPage({
          state: "loaded",
          data: [...bytes],
        });
      })
      .catch((e) => {
        console.error(e);
        if (isUnmouned.current) return;
        setPage({ ...page, state: "error" });
      });

    return () => {
      isUnmouned.current = true;
    };
  }, [offset]);

  return { page, offset, offsetControl };
}

export function useControl(
  active: number,
  offsetControl: OffsetControl,
  activeControl: ActiveControl,
  help: boolean
) {
  const { prevPage, nextPage, prevRow, nextRow } = offsetControl;
  const { up, down, right, left } = activeControl;

  useEffect(() => {
    const cb = (e: KeyboardEvent) => {
      if (help) return;
      switch (e.key) {
        case "u":
          prevPage();
          break;
        case "d":
          nextPage();
          break;
        case "n":
          nextRow();
          break;
        case "p":
          prevRow();
          break;
        case "ArrowRight":
        case "l":
          right();
          break;
        case "ArrowLeft":
        case "h":
          left();
          break;
        case "ArrowUp":
        case "k": {
          if (active < BYTES_PER_ROW) prevRow();
          else up();
          break;
        }
        case "ArrowDown":
        case "j": {
          if (Math.floor(active / BYTES_PER_ROW) >= BYTES_PER_COLUMN - 1) {
            nextRow();
          } else {
            down();
          }
          break;
        }
        default:
          break;
      }
    };
    document.addEventListener("keydown", cb);

    return () => {
      document.removeEventListener("keydown", cb);
    };
  }, [prevPage, nextPage, prevRow, nextRow, up, down, left, right, help]);
}

export function useHelp() {
  const [help, setHelp] = useState(false);

  useEffect(() => {
    const cb = (e: KeyboardEvent) => {
      if (e.key === "?") {
        setHelp(true);
        return;
      }
      if (e.key === "Escape") {
        setHelp(false);
        return;
      }
    };
    document.addEventListener("keydown", cb);
    return () => document.removeEventListener("keydown", cb);
  }, []);

  return help;
}
