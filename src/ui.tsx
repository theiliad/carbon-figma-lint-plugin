import {
  Button,
  Checkbox,
  StructuredListBody,
  StructuredListCell,
  StructuredListHead,
  StructuredListInput,
  StructuredListRow,
  StructuredListWrapper,
  Tab,
  Tabs,
} from "@carbon/react";
import { Divider, render, SelectableItem } from "@create-figma-plugin/ui";
import { emit, on } from "@create-figma-plugin/utilities";
// import { emit } from '@create-figma-plugin/utilities';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Fragment, h } from "preact";
import { useEffect, useState } from "preact/hooks";

// Styles
import "!@carbon/styles/css/styles.css";

const Plugin = (): JSX.Element => {
  const [scanRunning, setScanRunning] = useState(false);
  const [coverageMetrics, setCoverageMetrics] = useState(null);

  const [highlightNodesInRed, setHighlightNodesInRed] = useState(false);

  // Add state for ignored items and current tab
  const [ignoredItems, setIgnoredItems] = useState([]);
  const [currentTab, setCurrentTab] = useState("visible");

  console.log("ignoredItems", ignoredItems);

  const ignoreItem = async (id, type) => {
    const newIgnoredItems = [...ignoredItems, { id, type }];
    setIgnoredItems(newIgnoredItems);
    await figma.clientStorage.setAsync("ignoredItems", newIgnoredItems);
  };

  useEffect(() => {
    const loadIgnoredItems = async () => {
      try {
        const storedItems = await figma.clientStorage.getAsync("ignoredItems");
        if (storedItems) {
          console.log("Loaded ignored items:", storedItems);
          setIgnoredItems(storedItems);
        } else {
          console.log("No ignored items found in storage.");
        }
      } catch (error) {
        console.error("Error loading ignored items from storage:", error);
      }
    };

    console.log("CHECK IGNORED ITEMS")
    loadIgnoredItems();

    on("SCAN_FINISHED", (data) => {
      setScanRunning(false);

      console.log("SCAN_FINISHED", data);

      setCoverageMetrics(data);
    });
  }, []);

  return (
    <div>
      {/* {coverageMetrics && (
        <div style={{ padding: "15px" }}>
          <p>
            Your Carbon coverage is LOW and can be improved. Check your design
            file for non-Carbon elements and styles, and update to the Carbon
            library.
          </p>

          <p style={{ marginTop: "12px" }}>
            Total components: {coverageMetrics.bladeComponents} Carbon / {coverageMetrics.totalLayers} Non-Carbon
          </p>
        </div>
      )} */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "15px",
        }}
      >
        <Button
          loading={scanRunning}
          onClick={() => {
            setScanRunning(true);
            emit("SCAN_RUN", {
              highlightNodesInRed,
            });
          }}
        >
          {coverageMetrics ? "Re-scan for Carbon v11" : "Scan for Carbon v11"}
        </Button>

        <div style={{ flexGrow: 1 }} />

        <div>
          <Checkbox
            labelText="Highlight nodes in red"
            id="highlight-nodes-in-red"
            checked={highlightNodesInRed}
            onChange={(e) => {
              setHighlightNodesInRed(e.target.checked);
            }}
          />
        </div>
      </div>

      {coverageMetrics && (
        <div>
          <div style={{ padding: "15px" }}>
            <h4
              style={{
                marginTop: "8px",
                marginBottom: "15px",
              }}
            >
              Non-Carbon components
            </h4>
          </div>

          <Button onClick={() => setCurrentTab("visible")}>Visible</Button>
          <Button onClick={() => setCurrentTab("ignored")}>Ignored</Button>

          <StructuredListWrapper selection>
            <StructuredListBody>
              {coverageMetrics.nonBladeComponentList
                .filter((node) =>
                  currentTab === "visible"
                    ? !ignoredItems.some((item) => item.id === node.id)
                    : ignoredItems.some((item) => item.id === node.id)
                )
                .map((node: any, i: number) => {
                  const { id, name, type, hint } = node;

                  return (
                    <StructuredListRow
                      key={`row-${i}`}
                      onClick={() => {
                        emit("FOCUS", id);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <StructuredListCell
                        style={{ width: "30%", cursor: "pointer" }}
                      >
                        {name}
                      </StructuredListCell>

                      <StructuredListCell style={{ cursor: "pointer" }}>
                        {hint}
                      </StructuredListCell>

                      {/* Add Ignore Button */}
                      <StructuredListCell>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            ignoreItem(id, type);
                          }}
                        >
                          Ignore
                        </Button>
                      </StructuredListCell>
                    </StructuredListRow>
                  );
                })}
            </StructuredListBody>
          </StructuredListWrapper>
        </div>
      )}
    </div>
  );
};

export default render(Plugin);
