import { ReactNode, useEffect, useRef, useState } from "react";
import { to10, to16, to2, to8 } from "./utils";

type Children = { children: ReactNode };

function Bar({ children }: Children) {
  return <div className="py-1.5 px-1 w-full">{children}</div>;
}

export function TitleBar({ children }: Children) {
  return <Bar>{children}</Bar>;
}

export function PathBar({ children }: Children) {
  return (
    <Bar>
      <span className=" overflow-hidden whitespace-nowrap">
        path: {children}
      </span>
    </Bar>
  );
}
export function SizeBar({ children }: Children) {
  return (
    <Bar>
      <span className="text-right overflow-hidden whitespace-nowrap">
        size: {children}
      </span>
    </Bar>
  );
}

export function HexViewContainer({ children }: Children) {
  return <div className="max-w-max mx-auto">{children}</div>;
}

export function Main({ children }: Children) {
  return <div className="relative">{children}</div>;
}

export function Help({ help }: { help: boolean }) {
  const hidden = help ? "" : "hidden";
  return (
    <div
      className={`w-full h-full flex justify-center items-center absolute top-0 left-0 z-30 whitespace-pre bg-white ${hidden}`}
    >
      {`
h      move cursor left
j      move cursor down
k      move cursor up
l      move cursor right

n      move to next line
p      move to previous line

d      move to next page
u      move to prevous page

/      focus jump input
[0-9]  input byte offset(decimal)
Enter  jump to offset
Esc    cancel jump

?      open help
Esc    close help
    `}
    </div>
  );
}

export function HexTable({ children }: Children) {
  return <div className="z-20">{children}</div>;
}

export function Row({ children }: Children) {
  return <div className="">{children}</div>;
}

export function ColString({ children }: Children) {
  return <div className="">{children}</div>;
}

type CellValueProps = {
  index: number;
  byte: number;
  active: number;
};

export function CellHex({ index, byte, active }: CellValueProps) {
  const bg = index === active ? "bg-black text-white" : "";
  const mr = (index + 1) % 4 === 0 ? "mr-2" : "mr-1";

  return (
    <span
      className={`cursor-default rounded-sm px-0.5 whitespace-pre ${mr} ${bg}`}
    >
      {byte === undefined ? "  " : byte.toString(16).padStart(2, "0")}
    </span>
  );
}

export function CellAscii({ index, byte, active }: CellValueProps) {
  const bg = index === active ? "bg-black text-white" : "";

  return (
    <span className={`cursor-default rounded-sm whitespace-pre ${bg}`}>
      {byte === undefined
        ? " "
        : byte >= 0x20 && byte < 0x7f
        ? String.fromCharCode(byte)
        : "."}
    </span>
  );
}

export function RowOffset({ children }: Children) {
  return <div className="inline-block mr-6">{children}</div>;
}

export function RowHex({ children }: Children) {
  return <div className="inline-block mr-6">{children}</div>;
}

export function RowAscii({ children }: Children) {
  return <div className="inline-block">{children}</div>;
}

export function BarList({ children }: Children) {
  return (
    <div className="grid grid-cols-1 divide-y-2 divide-gray-600 divide-dashed my-3 border-t-2 border-b-2 border-gray-600 border-dashed">
      {children}
    </div>
  );
}

type OffsetBarProps = { offset: number; jump: (index: number) => void };

export function OffsetBar({ offset, jump }: OffsetBarProps) {
  const ref = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (/^\d*$/.test(e.target.value)) {
      setText(e.target.value);
    }
  };

  useEffect(() => {
    const cb = (e: KeyboardEvent) => {
      if (/[0-9/]/.test(e.key) && ref.current) {
        ref.current.focus();
      }
      if (e.key === "Escape") {
        setText("");
        if (ref.current) {
          ref.current.blur();
        }
        return;
      }
      if (e.key === "Enter") {
        if (ref.current) {
          ref.current.blur();
          if (text.length === 0) return;
          jump(parseInt(text));
          setText("");
        }
        return;
      }
    };
    document.addEventListener("keydown", cb);
    return () => {
      document.removeEventListener("keydown", cb);
    };
  }, [ref, text, setText, jump]);

  return (
    <Bar>
      <div className="grid grid-cols-2 items-center">
        <span>
          Offset: 0x{to16(offset)} {offset}
        </span>
        <div className="flex gap-x-3 items-center">
          <label htmlFor="jump">Jump: </label>
          <input
            ref={ref}
            id="jump"
            type="text"
            value={text}
            onChange={handleChange}
            className="flex-1 outline-none pl-1"
          />
        </div>
      </div>
    </Bar>
  );
}

export function BytesBar({ bytes }: { bytes: number[] }) {
  if (bytes.length < 1) return null;

  return (
    <Bar>
      <div className="flex gap-x-3">
        {bytes.length >= 1 && (
          <span>
            Byte: 0x{to16(bytes[0])} 0o{to8(bytes[0])} 0b{to2(bytes[0])}{" "}
            {to10(bytes[0])}(decimal)
          </span>
        )}
        {bytes.length >= 2 && (
          <span>
            {new Uint16Array(bytes.slice(0, 2))[0].toString().padStart(5, "0")}
            (u16)
          </span>
        )}
        {bytes.length >= 4 && (
          <span>
            {new Uint32Array(bytes.slice(0, 4))[0].toString().padStart(10, "0")}
            (u32)
          </span>
        )}
      </div>
    </Bar>
  );
}
