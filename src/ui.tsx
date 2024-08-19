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
  TabList,
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
import { View, ViewOff } from "@carbon/icons-react";

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

  const unignoreItem = async (id) => {
    const newIgnoredItems = ignoredItems.filter((item) => item.id !== id);
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

    console.log("CHECK IGNORED ITEMS");
    loadIgnoredItems();

    on("SCAN_FINISHED", (data) => {
      setScanRunning(false);

      console.log("SCAN_FINISHED", data);

      setCoverageMetrics(data);
    });

    on("NEW_RESULTS", (data) => {
      console.log("NEW RESULTS", data);

      setCoverageMetrics(data);
    });
  }, []);

  return (
    <div>
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
            console.log("highlightNodesInRed", highlightNodesInRed);
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
          <div style={{ paddingTop: "15px" }} />

          <Tabs
            onChange={({ selectedIndex }) => {
              setCurrentTab(selectedIndex === 0 ? "visible" : "hidden");
            }}
          >
            <TabList aria-label="List of tabs">
              <Tab value="visible">Visible</Tab>
              <Tab value="hidden">Hidden</Tab>
            </TabList>
          </Tabs>

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
                      <StructuredListCell
                        style={{
                          verticalAlign: "top",
                          paddingTop: "0px",
                          paddingRight: "0px",
                        }}
                      >
                        <Button
                          size="lg"
                          onClick={(e) => {
                            e.stopPropagation();

                            if (currentTab === "visible") {
                              ignoreItem(id, type);
                            } else {
                              unignoreItem(id);
                            }
                          }}
                          hasIconOnly
                          iconDescription={
                            currentTab === "visible" ? "Hide" : "Unhide"
                          }
                          kind="ghost"
                        >
                          {currentTab === "visible" ? <ViewOff /> : <View />}
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
