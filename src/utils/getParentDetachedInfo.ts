export function getParentDetachedInfo(node: SceneNode) {
  let currentNode = node;

  while (currentNode) {
    if (currentNode.detachedInfo) {
      return currentNode.detachedInfo;
    }

    currentNode = currentNode.parent as SceneNode;
  }

  return null;
}