// Simplified Interface - No more GAPI dependence
export interface DriveFile {
  id: string;
  name: string;
}

const API_BASE = '/api/drive';

// --- Folder & File Management via Backend Proxy ---

// Login essentially just means "Check if folders exist and list files"
// We don't need real Auth here, the backend handles the Service Account
export const loginAndListFiles = async (username: string): Promise<{ userFolderId: string, files: DriveFile[] }> => {
  try {
    const res = await fetch(`${API_BASE}?action=list&username=${encodeURIComponent(username)}`);
    if (!res.ok) throw new Error('API Login Failed');
    return await res.json();
  } catch (err) {
    console.error('Login error', err);
    throw err;
  }
};

export const loadFromDrive = async (fileId: string): Promise<any> => {
  try {
    const res = await fetch(`${API_BASE}?action=get&fileId=${fileId}`);
    if (!res.ok) throw new Error('Load file failed');
    return await res.json();
  } catch (err) {
    console.error('Error loading file', err);
    throw err;
  }
};

export const saveToDrive = async (data: any, fileName: string, parentFolderId: string, existingFileId: string | null): Promise<string> => {
  try {
    const body: any = { data };
    
    // Construct Query Params for POST logic separation if needed, or put in body
    // Our API handles logic based on presence of fileId vs folderId+fileName
    if (existingFileId) {
        // Update
        const res = await fetch(`${API_BASE}?fileId=${existingFileId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data })
        });
        if (!res.ok) throw new Error('Update failed');
        const json = await res.json();
        return json.id;
    } else {
        // Create
        const res = await fetch(`${API_BASE}?folderId=${parentFolderId}&fileName=${encodeURIComponent(fileName)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data })
        });
        if (!res.ok) throw new Error('Create failed');
        const json = await res.json();
        return json.id;
    }
  } catch (err) {
    console.error('Error saving file', err);
    throw err;
  }
};

// Legacy placeholders to keep imports in App.tsx from breaking immediately (can be cleaned up later)
export const initGoogleDrive = async () => Promise.resolve();
export const signInToGoogle = async () => Promise.resolve(true);
export const setupUserFolder = async () => Promise.resolve({ rootId: '', userFolderId: '' });
export const listFilesInFolder = async () => Promise.resolve([]);