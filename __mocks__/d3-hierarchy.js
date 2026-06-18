module.exports = {
  hierarchy: (data) => ({
    sum: () => {
      const leavesList = (data.children || []).map((child) => ({
        data: child,
      }));
      return {
        leaves: () => leavesList,
      };
    },
  }),
};
