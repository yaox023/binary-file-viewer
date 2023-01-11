import {
  BarList,
  BytesBar,
  CellAscii,
  CellHex,
  Help,
  HexTable,
  HexViewContainer,
  Main,
  OffsetBar,
  PathBar,
  Row,
  RowAscii,
  RowHex,
  RowOffset,
  SizeBar,
  TitleBar,
} from "./comonents";
import { useActive, useControl, useFile, useHelp, usePage } from "./hooks";
import { BYTES_PER_PAGE, BYTES_PER_ROW, File } from "./base";
import { range } from "./utils";

function HexView({ file }: { file: File }) {
  const { page, offset, offsetControl } = usePage(file.size);
  const { active, setActive, activeControl } = useActive(file.size, offset);
  const help = useHelp();
  useControl(active, offsetControl, activeControl, help);

  const jump = (index: number) => {
    if (index >= file.size) {
      jump(file.size - 1);
      return;
    }
    const modulo = index % BYTES_PER_ROW;
    offsetControl.setOffset(index - modulo);
    setActive(modulo);
  };

  return (
    <HexViewContainer>
      <BarList>
        <TitleBar>Binary File Viewer (? for help)</TitleBar>
        <PathBar>{file.path}</PathBar>
        <SizeBar>{file.size}</SizeBar>
      </BarList>

      <Main>
        <Help help={help} />
        <HexTable>
          {range(0, BYTES_PER_PAGE, BYTES_PER_ROW).map((i) => {
            return (
              <Row key={`hex-row-${i}`}>
                <RowOffset>
                  {(offset + i).toString(16).padStart(8, "0")}
                </RowOffset>
                <RowHex>
                  {range(0, BYTES_PER_ROW, 1).map((j) => {
                    const index = i + j;
                    return (
                      <CellHex
                        key={`hex-${index}`}
                        index={index}
                        byte={page.data[index]}
                        active={active}
                      />
                    );
                  })}
                </RowHex>
                <RowAscii>
                  {range(0, BYTES_PER_ROW, 1).map((j) => {
                    const index = i + j;
                    return (
                      <CellAscii
                        key={`ascii-${index}`}
                        index={index}
                        byte={page.data[index]}
                        active={active}
                      />
                    );
                  })}
                </RowAscii>
              </Row>
            );
          })}
        </HexTable>
      </Main>

      <BarList>
        <OffsetBar offset={offset + active} jump={jump} />
        <BytesBar bytes={page.data.slice(active, active + 8)} />
      </BarList>
    </HexViewContainer>
  );
}

function App() {
  const file = useFile();

  return (
    <div className="mx-auto mt-6">
      {file.state === "loaded" && <HexView file={file.data} />}
    </div>
  );
}

export default App;
