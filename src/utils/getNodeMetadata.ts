export const getNodeMetadata = (node: SceneNode) => {
    return {
        id: node.id,
        name: node.name,
        type: node.type,
    }
}