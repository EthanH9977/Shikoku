/* eslint-disable @typescript-eslint/no-explicit-any */
// Types for Google API
declare global {
  interface Window {
    google: any;
    gapi: any;
  }
}

const SCOPES = 'https://www.googleapis.com/auth/drive.file';
// Using the v3 discovery URL
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const ROOT_FOLDER_NAME = 'TravelBook';

export interface GoogleDriveConfig {
  clientId: string;
  apiKey: string;
}

export interface DriveFile {
  id: string;
  name: string;
}

let tokenClient: any;
let gapiInited = false;
let gisInited = false;

// Helper: Wait for Google Scripts to be available in window
const waitForGoogleScripts = () => {
  return new Promise<void>((resolve) => {
    const interval = setInterval(() => {
      if (typeof window !== 'undefined' && window.gapi && window.google) {
        clearInterval(interval);
        resolve();
      }
    }, 100);
    // Timeout after 5 seconds to avoid infinite loop, though app might fail
    setTimeout(() => clearInterval(interval), 5000);
  });
};

export const initGoogleDrive = async (config: GoogleDriveConfig): Promise<void> => {
  await waitForGoogleScripts();

  if (!window.gapi || !window.google) {
    throw new Error('Google API scripts failed to load.');
  }

  return new Promise((resolve, reject) => {
    window.gapi.load('client', async () => {
      try {
        // 1. Initialize gapi client with API Key ONLY
        // DO NOT pass discoveryDocs here to avoid "missing required fields" error
        await window.gapi.client.init({
          apiKey: config.apiKey,
        });

        // 2. Manually load the Drive API
        // This is more robust against discovery errors
        try {
          await window.gapi.client.load(DISCOVERY_DOC);
        } catch (loadError) {
          console.warn('Failed to load discovery doc directly, trying shorthand...', loadError);
          await window.gapi.client.load('drive', 'v3');
        }

        gapiInited = true;

        // 3. Initialize Identity Services (GIS)
        tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: config.clientId,
          scope: SCOPES,
          callback: '', // defined at request time
        });
        gisInited = true;

        resolve();
      } catch (err) {
        console.error('GAPI Init Error:', err);
        reject(err);
      }
    });
  });
};

export const signInToGoogle = async (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    if (!tokenClient) return reject('Google Drive API not initialized');

    tokenClient.callback = async (resp: any) => {
      if (resp.error) {
        reject(resp);
      }
      resolve(true);
    };

    // Use prompt: 'consent' to force account selection if needed, otherwise silent
    if (window.gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({prompt: 'consent'});
    } else {
      tokenClient.requestAccessToken({prompt: ''});
    }
  });
};

// --- Folder & File Management ---

// Find a folder by name inside a parent (or root if parentId is null)
export const findFolder = async (name: string, parentId: string | null = null): Promise<string | null> => {
  try {
    const parentQuery = parentId ? `'${parentId}' in parents` : "'root' in parents";
    const response = await window.gapi.client.drive.files.list({
      q: `mimeType = 'application/vnd.google-apps.folder' and name = '${name}' and ${parentQuery} and trashed = false`,
      fields: 'files(id, name)',
      spaces: 'drive',
    });
    const files = response.result.files;
    if (files && files.length > 0) {
      return files[0].id;
    }
    return null;
  } catch (err) {
    console.error(`Error finding folder ${name}`, err);
    throw err;
  }
};

// Create a folder
export const createFolder = async (name: string, parentId: string | null = null): Promise<string> => {
  try {
    const fileMetadata: any = {
      name: name,
      mimeType: 'application/vnd.google-apps.folder',
    };
    if (parentId) {
      fileMetadata.parents = [parentId];
    }

    const response = await window.gapi.client.drive.files.create({
      resource: fileMetadata,
      fields: 'id',
    });
    return response.result.id;
  } catch (err) {
    console.error(`Error creating folder ${name}`, err);
    throw err;
  }
};

// Ensure a folder exists (Find or Create)
export const ensureFolder = async (name: string, parentId: string | null = null): Promise<string> => {
  const existingId = await findFolder(name, parentId);
  if (existingId) return existingId;
  return await createFolder(name, parentId);
};

// List JSON files in a specific folder
export const listFilesInFolder = async (folderId: string): Promise<DriveFile[]> => {
  try {
    const response = await window.gapi.client.drive.files.list({
      q: `'${folderId}' in parents and mimeType = 'application/json' and trashed = false`,
      fields: 'files(id, name)',
      spaces: 'drive',
    });
    return response.result.files || [];
  } catch (err) {
    console.error('Error listing files', err);
    throw err;
  }
};

// Setup the TravelBook -> Username structure
export const setupUserFolder = async (username: string): Promise<{ rootId: string, userFolderId: string }> => {
  const rootId = await ensureFolder(ROOT_FOLDER_NAME);
  const userFolderId = await ensureFolder(username, rootId);
  return { rootId, userFolderId };
};

// Save file (Create new in folder, or Update existing)
export const saveToDrive = async (data: any, fileName: string, parentFolderId: string, existingFileId: string | null): Promise<string> => {
  const content = JSON.stringify(data, null, 2);
  const fileData = new Blob([content], {type: 'application/json'});
  
  try {
    if (existingFileId) {
      // Update
      const url = `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=media`;
      await fetch(url, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${window.gapi.client.getToken().access_token}`,
          'Content-Type': 'application/json'
        },
        body: content
      });
      return existingFileId;
    } else {
      // Create New
      const metadata = {
        name: fileName.endsWith('.json') ? fileName : `${fileName}.json`,
        mimeType: 'application/json',
        parents: [parentFolderId]
      };
      
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', fileData);

      const url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${window.gapi.client.getToken().access_token}`,
        },
        body: form
      });
      const result = await response.json();
      return result.id;
    }
  } catch (err) {
    console.error('Error saving file', err);
    throw err;
  }
};

export const loadFromDrive = async (fileId: string): Promise<any> => {
  try {
    const response = await window.gapi.client.drive.files.get({
      fileId: fileId,
      alt: 'media',
    });
    return response.result;
  } catch (err) {
    console.error('Error loading file', err);
    throw err;
  }
};
