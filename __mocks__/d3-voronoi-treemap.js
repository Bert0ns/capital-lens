module.exports = {
  voronoiTreemap: () => {
    const layout = (root) => {
      if (root && root.leaves) {
        root.leaves().forEach((leaf) => {
          leaf.polygon = [
            [0, 0],
            [10, 0],
            [10, 10],
            [0, 10],
          ];
        });
      }
    };
    layout.clip = () => layout;
    layout.extent = () => layout;
    layout.size = () => layout;
    layout.maxIterationCount = () => layout;
    return layout;
  },
};
