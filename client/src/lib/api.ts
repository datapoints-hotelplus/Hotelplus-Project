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
