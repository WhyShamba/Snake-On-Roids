export const cacheImages = async (sources: string[]) => {
  const promises = sources.map(
    (src) =>
      new Promise((resolve, reject) => {
        const img = new Image();

        img.src = src;
        img.onload = resolve(src) as any;
        img.onerror = reject(src) as any;
      })
  );

  await Promise.all(promises);
};
