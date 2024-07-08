import { Button, render } from "@create-figma-plugin/ui";
import { emit, on } from "@create-figma-plugin/utilities";
// import { emit } from '@create-figma-plugin/utilities';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h } from "preact";
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
    <div
      style={{
        padding: "30px",
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

      {coverageMetrics && (
        <ul>
          <li>Non-Carbon components: {coverageMetrics.nonBladeComponents}</li>
          <li>Non-Carbon text styles: {coverageMetrics.nonBladeTextStyles}</li>
          </ul>
      )}
    </div>
  );
};

export default render(Plugin);
