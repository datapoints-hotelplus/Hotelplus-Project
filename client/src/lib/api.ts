export const searchKols = async (
  keyword: string,
  sources: string[]
) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/search-kols`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword, sources }),
    }
  );

  return res.json();
};

export const exportKolsCsv = async (
  keyword: string,
  results: any[]
) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/export-csv`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword, results }),
    }
  );

  if (!res.ok) {
    throw new Error("Export CSV failed");
  }

  return res.blob();
};
