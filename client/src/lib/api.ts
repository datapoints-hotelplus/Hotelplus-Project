export const searchKols = async ({
  keyword,
  sources,
  folderId,
}: {
  keyword: string;
  sources: string[];
  folderId: string;
}) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/search-kols`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword, sources, folderId }),
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

export const getDriveFiles = async () => {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/api/drive/files`
  );
  return res.json();
};

export const getSubDriveFiles = async (folderId: string) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/api/drive/subfiles/${folderId}`
  );
  return res.json();
};
