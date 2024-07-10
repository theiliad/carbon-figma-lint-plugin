import {
  StructuredListBody,
  StructuredListCell,
  StructuredListHead,
  StructuredListInput,
  StructuredListRow,
  StructuredListWrapper,
} from "@carbon/react";
import {
  Button,
  Divider,
  render,
  SelectableItem,
} from "@create-figma-plugin/ui";
import { emit, on } from "@create-figma-plugin/utilities";
// import { emit } from '@create-figma-plugin/utilities';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Fragment, h } from "preact";
import { useEffect, useState } from "preact/hooks";

const Plugin = (): JSX.Element => {
  const [scanRunning, setScanRunning] = useState(false);
  const [coverageMetrics, setCoverageMetrics] = useState(null);
  useEffect(() => {
    on("SCAN_FINISHED", (data) => {
      setScanRunning(false);

      console.log("SCAN_FINISHED", data);

      setCoverageMetrics(data);
    });
  }, []);

  return (
    <div>
      <div
        style={{
          padding: "15px",
        }}
      >
        <Button
          loading={scanRunning}
          onClick={() => {
            setScanRunning(true);
            emit("SCAN_RUN");
          }}
        >
          Run Scan
        </Button>
      </div>

      {/* <StructuredListWrapper selection>
        <StructuredListHead>
          <StructuredListRow head>
            <StructuredListCell head>ColumnA</StructuredListCell>
            <StructuredListCell head>ColumnB</StructuredListCell>
            <StructuredListCell head>ColumnC</StructuredListCell>
          </StructuredListRow>
        </StructuredListHead>
        <StructuredListBody>
          {structuredListBodyRowGenerator(4)}
        </StructuredListBody>
      </StructuredListWrapper> */}

      {coverageMetrics && (
        <div>
          <h3
            style={{
              marginLeft: "15px",
              marginBottom: "15px",
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
            Non-Carbon components
          </h3>
          {coverageMetrics.nonBladeComponentList.map(({ name, id }: any) => (
            <SelectableItem
              value={false}
              onClick={() => {
                emit("FOCUS", id);
              }}
            >
              {name || id}
            </SelectableItem>
          ))}

          {/* <SelectableItem value={false}>
            Non-Carbon components: {coverageMetrics.nonBladeComponents}
          </SelectableItem>
          <Divider />

          <SelectableItem value={false}>
            Non-Carbon text styles: {coverageMetrics.nonBladeTextStyles}
          </SelectableItem> */}
        </div>
      )}
    </div>
  );
};

const structuredListBodyRowGenerator = (numRows: any) => {
  return Array.apply(null, Array(numRows)).map((n, i) => (
    <StructuredListRow key={`row-${i}`}>
      <StructuredListCell>Row {i}</StructuredListCell>
      <StructuredListCell>Row {i}</StructuredListCell>
      <StructuredListCell>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc dui magna,
        finibus id tortor sed, aliquet bibendum augue. Aenean posuere sem vel
        euismod dignissim. Nulla ut cursus dolor. Pellentesque vulputate nisl a
        porttitor interdum.
      </StructuredListCell>
      <StructuredListInput
        id={`row-${i}`}
        value={`row-${i}`}
        title={`row-${i}`}
        name="row-0"
        aria-label={`row-${i}`}
      />
      <StructuredListCell>
        <title>select an option</title>
      </StructuredListCell>
    </StructuredListRow>
  ));
};

export default render(Plugin);
