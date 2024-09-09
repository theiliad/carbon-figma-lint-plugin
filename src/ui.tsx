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
  colorErrorCodes,
  componentErrorCodes,
  effectErrorCodes,
  IgnoredItem,
  nonCarbonErrorMessages,
  typeErrorCodes,
} from "./types";

// Styles
import "!@carbon/styles/css/styles.css";
import "!./styles.css";
import { useMemo } from "react";

const Plugin = (): JSX.Element => {
  const [scanRunning, setScanRunning] = useState(false);
  const [coverageMetrics, setCoverageMetrics] = useState(null);

  // Filter out color errors
  const colorErrors = useMemo(() => {
    return coverageMetrics?.nonCarbonComponentList?.filter((node: any) =>
      colorErrorCodes.includes(node.code)
    );
  }, [coverageMetrics]);

  // Filter out type errors
  const typeErrors = useMemo(() => {
    return coverageMetrics?.nonCarbonComponentList?.filter((node: any) =>
      typeErrorCodes.includes(node.code)
    );
  }, [coverageMetrics]);

  // Filter out component errors
  const componentErrors = useMemo(() => {
    return coverageMetrics?.nonCarbonComponentList?.filter((node: any) =>
      componentErrorCodes.includes(node.code)
    );
  }, [coverageMetrics]);

  // Filter out effect errors
  const effectErrors = useMemo(() => {
    return coverageMetrics?.nonCarbonComponentList?.filter((node: any) =>
      effectErrorCodes.includes(node.code)
    );
  }, [coverageMetrics]);

  const [currentTab, setCurrentTab] = useState("all");
  const displayData = useMemo(() => {
    switch (currentTab) {
      case "all":
        return coverageMetrics?.nonCarbonComponentList;
      case "color":
        return colorErrors;
      case "type":
        return typeErrors;
      case "component":
        return componentErrors;
      case "effects":
        return effectErrors;
      default:
        return coverageMetrics?.nonCarbonComponentList;
    }
  }, [currentTab, coverageMetrics]);

  const [highlightNodesInRed, setHighlightNodesInRed] = useState(false);

  // Add state for ignored items and current tab
  const [ignoredItems, setIgnoredItems] = useState<IgnoredItem[]>([]);

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

          <Tabs
            onChange={({ selectedIndex }) => {
              setCurrentTab(
                ["all", "color", "type", "component", "effects"][selectedIndex]
              );
            }}
          >
            <TabList aria-label="List of tabs">
              <Tab value="all">
                All (
                {(
                  coverageMetrics.nonCarbonComponentList?.length || 0
                ).toLocaleString()}
                )
              </Tab>

              <Tab value="color">
                Color ({(colorErrors?.length || 0).toLocaleString()})
              </Tab>

              <Tab value="type">
                Type ({(typeErrors?.length || 0).toLocaleString()})
              </Tab>

              <Tab value="component">
                Components ({(componentErrors?.length || 0).toLocaleString()})
              </Tab>

              <Tab value="effects">
                Effects ({(effectErrors?.length || 0).toLocaleString()})
              </Tab>
            </TabList>
          </Tabs>

          <StructuredListWrapper selection>
            <StructuredListBody>
              {displayData.map((node: any, i: number) => {
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
