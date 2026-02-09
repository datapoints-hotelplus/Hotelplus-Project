const { google } = require("googleapis");
const { Readable } = require("stream");

/* ===== AUTH (ตัวเดียวพอ) ===== */
const auth = new google.auth.GoogleAuth({
  keyFile: "service-account.json",
  scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive = google.drive({
  version: "v3",
  auth,
});

/* ===== LIST FILES / FOLDERS ===== */
async function listFiles(parentId) {
  const res = await drive.files.list({
    q: `'${parentId}' in parents and trashed=false`,
    fields: "files(id,name,mimeType,webViewLink)",
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  });

  return res.data.files;
}


/* ===== DOWNLOAD FILE ===== */
async function downloadFile(fileId) {
  const res = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "text" }
  );

  return res.data;
}

/* ===== CREATE FOLDER ===== */
async function createFolder(name, parentId) {
  const res = await drive.files.create({
    requestBody: {
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: parentId ? [parentId] : undefined,
    },
    fields: "id, name",
    supportsAllDrives: true,
  });

  return res.data;
}


/* ===== UPLOAD CSV ===== */
async function uploadCsv({ folderId, filename, content }) {
  const stream = Readable.from(content);

  const res = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [folderId],
    },
    media: {
      mimeType: "text/csv",
      body: stream,
    },
    fields: "id,name,webViewLink",
    supportsAllDrives: true,
  });

  return res.data;
}

/* ===== DELETE FILE / FOLDER ===== */
async function deleteFile(fileId) {
  await drive.files.delete({
    fileId,
    supportsAllDrives: true,
  });
}

async function canAccess(fileId) {
  const res = await drive.files.get({
    fileId,
    fields: "id,name,mimeType,driveId,capabilities",
    supportsAllDrives: true,
  });
  return res.data;
}





module.exports = {
  listFiles,
  downloadFile,
  createFolder,
  uploadCsv,
  deleteFile,
  canAccess
};

