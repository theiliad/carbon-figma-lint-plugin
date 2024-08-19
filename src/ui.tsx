import {
  Button,
  Checkbox,
  StructuredListBody,
  StructuredListCell,
  StructuredListRow,
  StructuredListWrapper,
  Tab,
  TabList,
  Tabs,
} from "@carbon/react";
import { render } from "@create-figma-plugin/ui";
import { emit, on } from "@create-figma-plugin/utilities";
import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { View, ViewOff } from "@carbon/icons-react";
import {
  ClientStorageEventTypes,
  IgnoredItem,
  nonCarbonErrorMessages,
} from "./types";

// Styles
import "!@carbon/styles/css/styles.css";

const Plugin = (): JSX.Element => {
  const [scanRunning, setScanRunning] = useState(false);
  const [coverageMetrics, setCoverageMetrics] = useState(null);

  const [highlightNodesInRed, setHighlightNodesInRed] = useState(false);

  // Add state for ignored items and current tab
  const [ignoredItems, setIgnoredItems] = useState<IgnoredItem[]>([]);
  const [currentTab, setCurrentTab] = useState("visible");

  useEffect(() => {
    /*
     * Scan job
     */
    // Triggers once a scan job is done
    on("SCAN_FINISHED", (data) => {
      setScanRunning(false);

      setCoverageMetrics(data);
    });

    // /*
    //  * Figma client storage
    //  */
    // // Handle incoming messages
    // const handleLoadOrUpdate = (newItems: IgnoredItem[]) => {
    //   console.log("came in", newItems);
    //   setIgnoredItems(newItems);
    // };

    // on(ClientStorageEventTypes.LoadIgnoredItems, handleLoadOrUpdate);
    // on(ClientStorageEventTypes.UpdateIgnoredItems, handleLoadOrUpdate);

    // // Request the ignoredIDs from main.tsx
    // emit(ClientStorageEventTypes.LoadIgnoredItems);

    // // Cleanup event listeners on unmount
    // return () => {
    //   on(ClientStorageEventTypes.LoadIgnoredItems, handleLoadOrUpdate);
    //   on(ClientStorageEventTypes.UpdateIgnoredItems, handleLoadOrUpdate);
    // };
  }, []);

  // const addIgnoredItem = (item: IgnoredItem) => {
  //   setIgnoredItems([...ignoredItems, item]);
  //   emit(ClientStorageEventTypes.AddIgnoredItems, item);
  // };

  // const removeIgnoredItem = (item: IgnoredItem) => {
  //   setIgnoredItems(
  //     ignoredItems.filter((d) => d.id !== item.id && d.code !== item.code)
  //   );
  //   emit(ClientStorageEventTypes.RemoveIgnoredItems, item);
  // };

  console.log("ignoredItems", ignoredItems);

  return (
    <div>
      <div
        style={{
          padding: "15px 15px 0px 15px",
        }}
      >
        <p
          style={{
            fontSize: "12px",
            color: "#525252",
          }}
        >
          Version 0.1
        </p>

        <h4>Carbon v11 coverage</h4>

        <p
          style={{
            marginTop: "16px",
            fontSize: "14px",
          }}
        >
          Check this Figma page or selection for Carbon v11 library usage across
          components, color and type tokens.
        </p>
      </div>

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
          {coverageMetrics ? "Re-scan" : "Scan for Carbon"}
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

          {/* <Tabs
            onChange={({ selectedIndex }) => {
              setCurrentTab(selectedIndex === 0 ? "visible" : "hidden");
            }}
          >
            <TabList aria-label="List of tabs">
              <Tab value="visible">Visible</Tab>
              <Tab value="hidden">Hidden</Tab>
            </TabList>
          </Tabs> */}

          <StructuredListWrapper selection>
            <StructuredListBody>
              {coverageMetrics.nonBladeComponentList
                // .filter((node) =>
                //   currentTab === "visible"
                //     ? !ignoredItems.find(
                //         (d) => d.id === node.id && d.code === node.code
                //       )
                //     : ignoredItems.find(
                //         (d) => d.id === node.id && d.code === node.code
                //       )
                // )
                .map((node: any, i: number) => {
                  const { id, name, code } = node;

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
                        {nonCarbonErrorMessages[code]}
                      </StructuredListCell>

                      {/* Add Ignore Button */}
                      {/* <StructuredListCell
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
                              console.log("ewgweg", node);
                              addIgnoredItem({
                                id: node.id,
                                code: node.code,
                              });
                            } else {
                              removeIgnoredItem({
                                id: node.id,
                                code: node.code,
                              });
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
                      </StructuredListCell> */}
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
