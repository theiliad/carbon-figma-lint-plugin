import { AnyObject } from "./utils/mergeObjects";
/* eslint-disable @typescript-eslint/restrict-plus-operands */
import {
  getParentNode,
  traverseNode,
  getSelectedNodesOrAllNodes,
  on,
  emit,
} from "@create-figma-plugin/utilities";
import { showUI } from "@create-figma-plugin/utilities";

import {
  BLADE_BOX_BACKGROUND_COLOR_VARIABLE_IDS,
  BLADE_BOX_BORDER_COLOR_VARIABLE_IDS,
  BLADE_COMPONENT_IDS,
  BLADE_COMPONENT_IDS_HAVING_SLOT,
  BLADE_TEXT_COLOR_STYLE_IDS,
  CARBON_TEXT_TYPEFACE_STYLE_IDS,
  CARBON_EFFECT_STYLE_IDS,
} from "./bladeLibraryConstants";
import { getNodeMetadata } from "./utils/getNodeMetadata";
import { mergeObjects } from "./utils/mergeObjects";

type CoverageMetrics = {
  bladeComponents: number;
  bladeTextStyles: number;
  bladeColorStyles: number;
  // bladeEffectStyles: number;
  nonBladeComponents: number;
  nonBladeComponentList: any[];
  nonBladeTextStyles: number;
  nonBladeColorStyles: number;
  // nonBladeEffectStyles: number;
  totalLayers: number;
  bladeCoverage: number;
};

const MAIN_FRAME_NODES = ["FRAME", "SECTION"];
const NODES_SKIP_FROM_COVERAGE = [
  "GROUP",
  "SECTION",
  "VECTOR",
  "ELLIPSE",
  "INSTANCE",
];
const nonBladeHighlighterNodes: BaseNode[] = [];
const bladeCoverageCards: BaseNode[] = [];

let highlightNodesInRed = false;

const highlightNonBladeNode = (node: SceneNode, desc?: string): void => {
  if (highlightNodesInRed) {
    const highlighterBox = figma.createRectangle();
    const nodeType = `${node.type
      .toUpperCase()
      .charAt(0)
      .toUpperCase()}${node.type.toLowerCase().slice(1)}`;
    highlighterBox.name = `${desc}, Type: ${nodeType}, Name: ${node.name}`;
    // selection node just gives the x and y relative to the frame we need WRT canvas hence, we need to use absoluteTransform prop
    highlighterBox.x = node.absoluteTransform[0][2] - 10;
    highlighterBox.y = node.absoluteTransform[1][2] - 10;
    highlighterBox.resize(node.width + 22, node.height + 22);
    highlighterBox.fills = [
      { type: "SOLID", color: { r: 0, g: 0, b: 0 }, opacity: 0 },
    ];
    highlighterBox.strokes = [{ type: "SOLID", color: { r: 0.7, g: 0, b: 0 } }];
    nonBladeHighlighterNodes.push(highlighterBox);
  }
};

const traverseUpTillMainFrame = (node: BaseNode): BaseNode => {
  try {
    if (node !== null) {
      if (getParentNode(node)?.type === "PAGE") {
        return node;
      } else if (node.parent) {
        return traverseUpTillMainFrame(node.parent);
      }
    }
  } catch (error: unknown) {
    console.error(error);
    figma.notify("⚠️ Error in traversing main frame node. Please try again");
    figma.closePlugin();
  }

  return node;
};

const renderCoverageCard = async ({
  mainFrameNode,
  bladeComponents,
  nonBladeComponents,
  nonBladeColorStyles,
  nonBladeTextStyles,
  totalLayers,
  bladeCoverage,
}: {
  mainFrameNode: SceneNode;
} & CoverageMetrics): Promise<void> => {
  // these are from payment light theme but it should work as far as the plugin is being run from Razorpay org
  const COVERAGE_CARD_COMPONENT_KEY =
    "25912bd4b8a51bab5ea726259cfc0619d6dae0d5";
  const BLADE_INTENT_COLOR_KEYS = {
    positive: {
      id: "",
      key: "c61aca5db3a21aead10da4889ad2b31c74d93529",
    },
    negative: {
      id: "",
      key: "cccac5aac53e828b3be3e8617e462f8ee1a058dd",
    },
    notice: {
      id: "",
      key: "707d5fdfc748a5fc4777d212ee247bc40a86fe85",
    },
  };

  try {
    // // import styles for popsitive, negative and notice colors and set their id in BLADE_INTENT_COLOR_KEYS
    // for await (const [intent, intentObject] of Object.entries(
    //   BLADE_INTENT_COLOR_KEYS
    // )) {
    //   const colorStyle = await figma.importStyleByKeyAsync(intentObject.key);
    //   BLADE_INTENT_COLOR_KEYS[intent as "positive" | "negative" | "notice"].id =
    //     colorStyle.id;
    // }

    // let coverageColorIntent = BLADE_INTENT_COLOR_KEYS.negative.id;
    let bladeCoverageType = "Below 90% 😪";
    const PROGRESS_BAR_MAX_WIDTH = 254;
    const bladeCoverageProgress =
      (bladeCoverage / 100) * PROGRESS_BAR_MAX_WIDTH;

    // calculate coverage type and intent colors for coverage
    if (bladeCoverage > 90) {
      bladeCoverageType = `Good 🎉`;
      // coverageColorIntent = BLADE_INTENT_COLOR_KEYS.positive.id;
    }

    // traverseNode(detachedCoverageCard, (traversedNode) => {
    //   if (traversedNode.type === "TEXT") {
    //     if (
    //       ["bladeCoverageType", "bladeCoverage"].includes(traversedNode.name)
    //     ) {
    //       traversedNode.setRangeFillStyleId(
    //         0,
    //         traversedNode.characters.length,
    //         coverageColorIntent
    //       );
    //     }
    //   } else if (
    //     traversedNode.type === "RECTANGLE" &&
    //     traversedNode.name === "Progress"
    //   ) {
    //     traversedNode.resizeWithoutConstraints(bladeCoverageProgress || 0.1, 4);
    //     traversedNode.fillStyleId = coverageColorIntent;
    //   }
    // });

    console.log("RESULTS", {
      "bladeCoverageType#45789:0": bladeCoverageType,
      "bladeCoverage#45789:1": `${bladeCoverage.toFixed(2)}%`,
      "totalLayers#45789:2": totalLayers.toString().padStart(2, "0"),
      "bladeComponents#45789:3": bladeComponents.toString().padStart(2, "0"),
      "nonBladeComponents#45789:4": nonBladeComponents
        .toString()
        .padStart(2, "0"),
      "nonBladeTextStyles#45789:5": nonBladeTextStyles
        .toString()
        .padStart(2, "0"),
      "nonBladeColorStyles#45789:6": nonBladeColorStyles
        .toString()
        .padStart(2, "0"),
    });
  } catch (error: unknown) {
    figma.notify("⚠️ Error in rendering coverage card 124. Please try again");
    console.error(error);
    figma.closePlugin();
  }
};

const calculateCoverage = (node: SceneNode): CoverageMetrics | null => {
  let bladeComponents = 0;
  let bladeTextStyles = 0;
  let bladeColorStyles = 0;
  // let bladeEffectStyles = 0;
  let nonBladeComponents = 0;
  let nonBladeComponentList = [];
  let nonBladeTextStyles = 0;
  let nonBladeColorStyles = 0;
  // let nonBladeEffectStyles = 0;
  let totalLayers = 0;

  try {
    // if there are non-frame nodes as direct children of a page, ignore them
    if (
      getParentNode(node)?.type === "PAGE" &&
      !MAIN_FRAME_NODES.includes(node.type)
    ) {
      return null;
    }

    traverseNode(
      node,
      (traversedNode) => {
        if (!traversedNode.visible) {
          return;
        }

        if (traversedNode.type === "INSTANCE") {
          console.log(
            "INSTANCE 321",
            traversedNode.name,
            (traversedNode.mainComponent?.parent as ComponentSetNode)?.key,
            BLADE_COMPONENT_IDS.includes(
              (traversedNode.mainComponent?.parent as ComponentSetNode)?.key ??
                ""
            )
          );
        }

        if (
          traversedNode.type === "INSTANCE" &&
          (BLADE_COMPONENT_IDS.includes(
            (traversedNode.mainComponent?.parent as ComponentSetNode)?.key ?? ""
          ) ||
            BLADE_COMPONENT_IDS.includes(
              traversedNode.mainComponent?.key ?? ""
            ))
        ) {
          // few components that have slots we need to check if the children are valid Blade instances
          if (
            BLADE_COMPONENT_IDS_HAVING_SLOT.includes(
              (traversedNode.mainComponent?.parent as ComponentSetNode)?.key ??
                ""
            )
          ) {
            // this will recursively follow the same process we follow.
            // check for Blade's instance and if there are certain components that has slot inside it then we recursively check inside them for blade components
            traversedNode.children.forEach((childNode) => {
              const slotComponentsCoverage = calculateCoverage(childNode);
              if (slotComponentsCoverage) {
                bladeComponents += slotComponentsCoverage?.bladeComponents;
                bladeTextStyles += slotComponentsCoverage?.bladeTextStyles;
                bladeColorStyles += slotComponentsCoverage?.bladeColorStyles;
                nonBladeComponents +=
                  slotComponentsCoverage?.nonBladeComponents;
                nonBladeComponentList = [
                  ...nonBladeComponentList,
                  ...slotComponentsCoverage?.nonBladeComponentList,
                ];
                nonBladeTextStyles +=
                  slotComponentsCoverage?.nonBladeTextStyles;
                nonBladeColorStyles +=
                  slotComponentsCoverage?.nonBladeColorStyles;
                totalLayers += slotComponentsCoverage?.totalLayers;
              }
            });
          }
          if (traversedNode.overrides.length) {
            // flag the instance if its overridden
            let isOverridden = false;
            traversedNode.overrides.forEach((node) => {
              if (
                // these are properties which tells us if the components' text has been overridden. Fill this with more cases going forward as there are more possible values
                // https://www.figma.com/plugin-docs/api/NodeChangeProperty/
                node.overriddenFields.includes("letterSpacing") ||
                node.overriddenFields.includes("textStyleId") ||
                node.overriddenFields.includes("fontName") ||
                node.overriddenFields.includes("fontSize") ||
                node.overriddenFields.includes("lineHeight") ||
                node.overriddenFields.includes("textCase")
              ) {
                isOverridden = true;
              }
            });
            if (isOverridden) {
              nonBladeComponents++;

              nonBladeComponentList.push({
                ...getNodeMetadata(traversedNode),
                hint: "Overridden Carbon Instance. Please reset changes",
              });
              highlightNonBladeNode(
                traversedNode,
                "Overridden Blade Instance. Please reset changes"
              );
            } else {
              bladeComponents++;
            }
          } else {
            bladeComponents++;
          }
          totalLayers++;
        } else if (traversedNode.type === "INSTANCE") {
          nonBladeComponents++;

          nonBladeComponentList.push({
            ...getNodeMetadata(traversedNode),
            hint: "Instance is not a Carbon Instance",
          });

          highlightNonBladeNode(
            traversedNode,
            "Instance is not a Carbon Instance"
          );
        } else if (traversedNode.type === "TEXT") {
          // check if the text is using Blade's text styles
          let isMixedTextStyleOfBlade = false;
          let traversedNodeTextStyleId = "";
          let isTextRangeFillsOfBlade = false;
          let traversedNodeColorVariableId = "";

          /**
           * The textSyleId can have figma.mixed. so in that case we need to go character by character
           * and do getRangeTextStyleId(charIndex,charIndex+1) instead of textStyleId
           */
          if (traversedNode?.textStyleId === figma.mixed) {
            isMixedTextStyleOfBlade = traversedNode.characters
              .split("")
              .every((character, index) => {
                if (/\s/.test(character)) {
                  return true;
                }
                return CARBON_TEXT_TYPEFACE_STYLE_IDS.includes(
                  (
                    traversedNode.getRangeTextStyleId(
                      index,
                      index + 1
                    ) as string
                  ).split(",")[0]
                );
              });

            if (isMixedTextStyleOfBlade) {
              bladeTextStyles++;
            } else {
              nonBladeTextStyles++;
              nonBladeComponentList.push({
                ...getNodeMetadata(traversedNode),
                hint: "Text is not using Carbon",
              });
              highlightNonBladeNode(traversedNode, "Text is not using Carbon");
            }
          } else {
            traversedNodeTextStyleId =
              traversedNode?.textStyleId?.split(",")[0];

            if (
              CARBON_TEXT_TYPEFACE_STYLE_IDS.find((styleId) =>
                styleId.includes(traversedNodeTextStyleId)
              )
            ) {
              bladeTextStyles++;
            } else {
              nonBladeTextStyles++;

              nonBladeComponentList.push({
                ...getNodeMetadata(traversedNode),
                hint: "Text Style is not from Carbon",
              });
              highlightNonBladeNode(
                traversedNode,
                "Text Style is not from Carbon"
              );
            }
          }

          // check if text is using blade color styles
          if (traversedNode.boundVariables?.fills?.length) {
            traversedNodeColorVariableId =
              traversedNode.boundVariables.fills[0].id.split("/")[0];
            if (
              BLADE_TEXT_COLOR_STYLE_IDS.includes(
                traversedNodeColorVariableId ?? ""
              )
            ) {
              bladeColorStyles++;
            } else {
              nonBladeColorStyles++;

              console.log(
                "text color 1",
                traversedNodeColorVariableId,
                getNodeMetadata(traversedNode)
              );

              nonBladeComponentList.push({
                ...getNodeMetadata(traversedNode),
                hint: "Text Color Style should only use Carbon tokens",
              });
              highlightNonBladeNode(
                traversedNode,
                "Text Color Style should only use Carbon tokens"
              );
            }
          }
          // check if text is using blade text styles
          // textRangeFills is used when the text has different colors for different characters
          if (traversedNode.boundVariables?.textRangeFills?.length) {
            isTextRangeFillsOfBlade =
              traversedNode.boundVariables.textRangeFills.every((fill) => {
                if (
                  BLADE_TEXT_COLOR_STYLE_IDS.includes(fill.id.split("/")[0])
                ) {
                  return true;
                }
                return false;
              });
            if (isTextRangeFillsOfBlade) {
              bladeTextStyles++;
            } else {
              nonBladeTextStyles++;

              nonBladeComponentList.push({
                ...getNodeMetadata(traversedNode),
                hint: "Text Color Style should only use Carbon tokens",
              });
              highlightNonBladeNode(
                traversedNode,
                "Text Color Style should only use Carbon tokens"
              );
            }
          }

          if (
            traversedNode.boundVariables &&
            Object.keys(traversedNode.boundVariables).length === 0
          ) {
            nonBladeTextStyles++;

            nonBladeComponentList.push({
              ...getNodeMetadata(traversedNode),
              hint: "Text Color Style should only use Carbon tokens",
            });
            highlightNonBladeNode(
              traversedNode,
              "Text Color Style should only use Carbon tokens"
            );
          }

          // this check is for typography components, if the typography uses color and text both from blade styles then they are typography blade components
          if (
            (isMixedTextStyleOfBlade ||
              CARBON_TEXT_TYPEFACE_STYLE_IDS.includes(
                traversedNodeTextStyleId
              )) &&
            (isTextRangeFillsOfBlade ||
              BLADE_TEXT_COLOR_STYLE_IDS.includes(traversedNodeColorVariableId))
          ) {
            bladeComponents++;
          }
        } else if (traversedNode.type === "LINE") {
          nonBladeComponents++;

          nonBladeComponentList.push({
            ...getNodeMetadata(traversedNode),
            hint: "Use a Divider Component Instead",
          });
          highlightNonBladeNode(
            traversedNode,
            "Use a Divider Component Instead"
          );
        } else if (traversedNode.type === "RECTANGLE") {
          let isImage = false;

          if (traversedNode.fills !== figma.mixed) {
            // figma considers images as rectangles with fill type as IMAGE
            isImage = Boolean(
              traversedNode.fills.find((fill) => fill.type === "IMAGE")
            );
          }

          if (isImage) {
            NODES_SKIP_FROM_COVERAGE.push("RECTANGLE");
          }

          const hasEffects = traversedNode.effects?.length;
          const hasBladeEffectStyles = CARBON_EFFECT_STYLE_IDS.includes(
            traversedNode.effectStyleId
          );

          if (hasEffects && hasBladeEffectStyles) {
            // bladeEffectStyles++;
          } else if (hasEffects && !hasBladeEffectStyles) {
            // nonBladeEffectStyles++;

            nonBladeComponentList.push({
              ...getNodeMetadata(traversedNode),
              hint: `Effects not from Carbon's elevation styles`,
            });
            highlightNonBladeNode(
              traversedNode,
              `Effects not from Carbon's elevation styles`
            );
          }

          // replace with variables
          const hasFillsVariable = traversedNode.boundVariables?.fills?.length;
          const hasStrokesVariable =
            traversedNode.boundVariables?.strokes?.length;
          if (!isImage && (hasFillsVariable || hasStrokesVariable)) {
            // check if rectangle uses blade surface.border.* colors for border
            if (hasStrokesVariable) {
              const traversedNodeColorVariableId =
                traversedNode.boundVariables.strokes[0].id.split("/")[0];
              if (
                BLADE_BOX_BORDER_COLOR_VARIABLE_IDS.includes(
                  traversedNodeColorVariableId ?? ""
                )
              ) {
                bladeColorStyles++;
              } else {
                nonBladeColorStyles++;

                nonBladeComponentList.push({
                  ...getNodeMetadata(traversedNode),
                  hint: "Box Border color should only use Carbon tokens",
                });
                highlightNonBladeNode(
                  traversedNode,
                  "Box Border color should only use Carbon tokens"
                );
              }
            }
            // check if rectangle is using blade surface.background.* tokens for background
            if (hasFillsVariable) {
              const traversedNodeFillStyleId =
                traversedNode.boundVariables.fills[0].id.split("/")[0];
              if (
                BLADE_BOX_BACKGROUND_COLOR_VARIABLE_IDS.includes(
                  traversedNodeFillStyleId ?? ""
                )
              ) {
                bladeColorStyles++;
              } else {
                nonBladeColorStyles++;

                nonBladeComponentList.push({
                  ...getNodeMetadata(traversedNode),
                  hint: "Box Background color should only use Carbon tokens",
                });
                highlightNonBladeNode(
                  traversedNode,
                  "Box Background color should only use Carbon tokens"
                );
              }
            }
          } else if (!isImage) {
            nonBladeComponentList.push({
              ...getNodeMetadata(traversedNode),
              hint: "Box not adhering to Carbon guidelines",
            });
            highlightNonBladeNode(
              traversedNode,
              "Box not adhering to Carbon guidelines"
            );
          }
        }

        /** check if frame is being used as a custom component
         * has fills?
         * has strokes?
         * has effects?
         * if any of the above is true then it's a custom component
         * */
        const ignoreInstanceFrameNodeNames = [
          "root",
          "wrapper",
          "bottom-sheet-container",
          "accordion-header",
          "Summary Row",
        ];
        if (
          traversedNode.type === "FRAME" &&
          !ignoreInstanceFrameNodeNames.includes(traversedNode.name) &&
          getParentNode(traversedNode)?.type !== "PAGE"
        ) {
          const hasStrokes =
            traversedNode?.boundVariables?.strokes?.length ??
            traversedNode.strokes.length;
          const hasEffects =
            traversedNode.effects?.length || traversedNode.effectStyleId;
          const hasNonMixedFills =
            traversedNode.fills !== figma.mixed && traversedNode.fills.length;
          const hasFills =
            traversedNode?.boundVariables?.fills?.length ??
            hasNonMixedFills ??
            traversedNode.fillStyleId;
          if (
            Boolean(hasStrokes || hasEffects || hasFills) &&
            !Boolean(traversedNode.fills === figma.mixed)
          ) {
            // this is non-blade component error
            // push the frame layer to be included in component count
            nonBladeComponents++;

            nonBladeComponentList.push({
              ...getNodeMetadata(traversedNode),
              hint: "Use relevant Carbon component",
            });
            highlightNonBladeNode(
              traversedNode,
              "Use relevant Carbon component"
            );
          } else {
            NODES_SKIP_FROM_COVERAGE.push("FRAME");
          }
        }

        if (
          ![
            ...NODES_SKIP_FROM_COVERAGE,
            "TEXT",
            "LINE",
            "RECTANGLE",
            "FRAME",
          ].includes(traversedNode.type) &&
          getParentNode(traversedNode)?.type !== "PAGE"
        ) {
          nonBladeComponentList.push({
            ...getNodeMetadata(traversedNode),
            hint: "Not created using Carbon Components/Tokens",
          });
          highlightNonBladeNode(
            traversedNode,
            "Not created using Carbon Components/Tokens"
          );
        }

        if (
          getParentNode(traversedNode)?.type !== "PAGE" &&
          !NODES_SKIP_FROM_COVERAGE.includes(traversedNode.type) &&
          // if the frame instances are from Blade's components then we don't want to include them in the count because these are components with slots
          !ignoreInstanceFrameNodeNames.includes(traversedNode.name)
        ) {
          // exclude the main frame itself from the count to remove false negatives
          totalLayers++;
        }

        // remove rectangle node index for next iteration because we don't want to remove all the rectangle nodes, only the image ones
        // remove frame node index for next iteration because we don't want to remove layout frame nodes, only the one that has being used as card
        const nodesToBeRemoved = ["RECTANGLE", "FRAME"];
        nodesToBeRemoved.forEach((nodeName) => {
          const nodeIndex = NODES_SKIP_FROM_COVERAGE.findIndex(
            (node) => node === nodeName
          );
          if (nodeIndex !== -1) {
            NODES_SKIP_FROM_COVERAGE.splice(nodeIndex, 1);
          }
        });
      },
      (traversedNode) => {
        // callback to stopTraversal for children of a node
        // true: we shall stop
        // false: we shall keep traversing children
        if (!traversedNode.visible) {
          return true;
        }

        if (
          traversedNode.type === "INSTANCE" &&
          (BLADE_COMPONENT_IDS.includes(
            (traversedNode.mainComponent?.parent as ComponentSetNode)?.key ?? ""
          ) ||
            BLADE_COMPONENT_IDS.includes(
              traversedNode.mainComponent?.key ?? ""
            ))
        ) {
          // we shall stop traversal further if we have found that an instance is Blade instance
          // if we keep traversing then chances are the metrics will be skewed because Blade components are composed of non-blade themselves
          // in code analytics we can add "data-*" to all the children till leaf nodes but over here we can't hence we stop
          return true;
        }
        return false;
      }
    );
  } catch (error: unknown) {
    console.error(error);
    figma.notify("⚠️ Error in rendering coverage card. Please try again");
    figma.closePlugin();
  }

  return {
    bladeComponents,
    bladeTextStyles,
    bladeColorStyles,
    nonBladeComponents,
    nonBladeComponentList,
    nonBladeTextStyles,
    nonBladeColorStyles,
    totalLayers,
    bladeCoverage:
      bladeComponents === 0 && totalLayers === 0
        ? 0
        : Number((bladeComponents / totalLayers) * 100),
  };
};

const getPageMainFrameNodes = (nodes: readonly SceneNode[]): SceneNode[] => {
  const mainFrameNodes: SceneNode[] = [];
  try {
    for (const node of nodes) {
      if (getParentNode(node)?.type === "PAGE") {
        // if selection is top level frame then start the coverage count
        // await calculateCoverage(node);
        mainFrameNodes.push(node);
      } else {
        // if the selection is not the top level frame then traverse up till we find the frame and then start the coverage count
        // await calculateCoverage(mainFrameNode);
        mainFrameNodes.push(traverseUpTillMainFrame(node) as SceneNode);
      }
    }
  } catch (error: unknown) {
    console.error(error);
    figma.notify("⚠️ Error in identifying main frame node. Please try again");
    figma.closePlugin();
  }

  return mainFrameNodes;
};

const removeOldGroupNodes = (): void => {
  // remove all teh old group nodes
  const bladeCoverageCardsGroup = figma.currentPage.findOne(
    (node) => node.name === "Carbon Coverage Cards"
  );
  const nonBladeItemsGroup = figma.currentPage.findOne(
    (node) => node.name === "Non Carbon Items"
  );

  if (bladeCoverageCardsGroup) {
    bladeCoverageCardsGroup.remove();
  }
  if (nonBladeItemsGroup) {
    nonBladeItemsGroup.remove();
  }
};

const main = async (): Promise<void> => {
  showUI({
    height: 700,
    width: 600,
  });

  on("FOCUS", async (nodeId) => {
    const node = figma.getNodeById(nodeId);

    if (node) {
      // Scroll and zoom into the node
      figma.viewport.scrollAndZoomIntoView([node]);

      // Select the node
      figma.currentPage.selection = [node];
    } else {
      figma.notify("Node not found!");
    }
  });

  on("SCAN_RUN", async (run_configs) => {
    figma.notify("Calculating Coverage", { timeout: 5 });

    // if the user has selected to highlight nodes in red
    if (run_configs.highlightNodesInRed) {
      highlightNodesInRed = run_configs.highlightNodesInRed;
    }

    let coverageMetrics = {};

    try {
      figma.skipInvisibleInstanceChildren = true;
      removeOldGroupNodes();
      let nodes: readonly SceneNode[] = [];
      if (figma.currentPage.selection.length > 0) {
        // you already have the selection, run the plugin
        nodes = figma.currentPage.selection;
      } else if (figma.currentPage.type === "PAGE") {
        // plugin is run from page scope but has no selection, so traverse all the nodes and then measure coverage
        nodes = getSelectedNodesOrAllNodes();
      } else {
        // the plugin is not run from a page scope, throw error
        figma.notify(
          "⚠️ Please run the plugin by opening a Page or selecting a layer inside a Page",
          {
            error: true,
          }
        );
        // figma.closePlugin();
      }
      if (nodes.length) {
        // 1. get the main frame nodes of the current page(ignoring non-frame nodes)
        const mainFrameNodes = getPageMainFrameNodes(nodes);
        for await (const mainFrameNode of mainFrameNodes) {
          // 2. calculate the coverage
          const _metrics = calculateCoverage(mainFrameNode);
          coverageMetrics = mergeObjects(
            coverageMetrics,
            _metrics as AnyObject
          );
          if (_metrics) {
            // 3. render the coverage card. fin.
            await renderCoverageCard({ mainFrameNode, ..._metrics });
          }
        }
        if (nonBladeHighlighterNodes.length) {
          const nonBladeHighterNodesGroup = figma.group(
            nonBladeHighlighterNodes,
            figma.currentPage
          );
          nonBladeHighterNodesGroup.name = "Non-Carbon Items";
          nonBladeHighterNodesGroup.expanded = false;
        }
        if (bladeCoverageCards.length) {
          const bladeCoverageCardsGroup = figma.group(
            bladeCoverageCards,
            figma.currentPage
          );
          bladeCoverageCardsGroup.name = "Carbon Coverage Cards";
          bladeCoverageCardsGroup.expanded = false;
        }
      }
    } catch (error: unknown) {
      console.error(error);
      figma.notify("⚠️ Something went wrong. Please try re-running the plugin");
    } finally {
      // figma.closePlugin();
      emit("SCAN_FINISHED", coverageMetrics);
    }
  });
};

export default main;
