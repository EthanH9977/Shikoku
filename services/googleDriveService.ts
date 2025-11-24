// Simplified Interface
export interface DriveFile {
  id: string;
  name: string;
}

const API_BASE = '/api/drive';

// --- MOCK / LOCALSTORAGE FALLBACK IMPLEMENTATION ---
// This allows the app to work 100% locally if the backend is not configured or reachable (e.g. localhost)

const MOCK_DELAY = 600; // Simulate network delay

const mockLoginAndListFiles = async (username: string): Promise<{ userFolderId: string, files: DriveFile[] }> => {
  await new Promise(r => setTimeout(r, MOCK_DELAY));
  console.log(`[Mock] Logging in as ${username}`);
  
  // Store user existence
  localStorage.setItem('shikoku_mock_current_user', username);
  
  // Retrieve file list for this user
  const key = `shikoku_mock_files_${username}`;
  const raw = localStorage.getItem(key);
  const files: DriveFile[] = raw ? JSON.parse(raw) : [];
  
  return { 
    userFolderId: `mock-folder-${username}`, 
    files 
  };
};

const mockLoadFile = async (fileId: string): Promise<any> => {
  await new Promise(r => setTimeout(r, MOCK_DELAY));
  console.log(`[Mock] Loading file ${fileId}`);
  
  const key = `shikoku_mock_content_${fileId}`;
  const raw = localStorage.getItem(key);
  if (!raw) throw new Error("File not found in local mock");
  return JSON.parse(raw);
};

const mockSaveFile = async (data: any, fileName: string, usernameOrFolder: string, existingFileId: string | null): Promise<string> => {
  await new Promise(r => setTimeout(r, MOCK_DELAY));
  
  // If we don't have an ID, generate one
  const fileId = existingFileId || `mock-file-${Date.now()}`;
  const currentUser = localStorage.getItem('shikoku_mock_current_user') || 'guest';

  console.log(`[Mock] Saving file ${fileName} (${fileId}) for ${currentUser}`);

  // 1. Save Content
  localStorage.setItem(`shikoku_mock_content_${fileId}`, JSON.stringify(data));

  // 2. Update Index if it's new or name changed
  const indexKey = `shikoku_mock_files_${currentUser}`;
  const rawIndex = localStorage.getItem(indexKey);
  let files: DriveFile[] = rawIndex ? JSON.parse(rawIndex) : [];

  const existingIdx = files.findIndex(f => f.id === fileId);
  if (existingIdx >= 0) {
    files[existingIdx].name = fileName.endsWith('.json') ? fileName : `${fileName}.json`;
  } else {
    files.push({
      id: fileId,
      name: fileName.endsWith('.json') ? fileName : `${fileName}.json`
    });
  }
  
  localStorage.setItem(indexKey, JSON.stringify(files));
  
  return fileId;
};

// --- MAIN SERVICE FUNCTIONS ---

export const loginAndListFiles = async (username: string): Promise<{ userFolderId: string, files: DriveFile[], isMock: boolean }> => {
  try {
    const res = await fetch(`${API_BASE}?action=list&username=${encodeURIComponent(username)}`);
    
    // Check for HTML response (Vercel 404/500 pages) or non-OK status
    const contentType = res.headers.get("content-type");
    if (!res.ok || (contentType && contentType.includes("text/html"))) {
       throw new Error(`API Error: ${res.status}`);
    }

    const data = await res.json();
    return { ...data, isMock: false };
  } catch (err) {
    console.warn('[Service] Backend API failed, falling back to LocalStorage Mock.', err);
    const mockData = await mockLoginAndListFiles(username);
    return { ...mockData, isMock: true };
  }
};

export const loadFromDrive = async (fileId: string): Promise<any> => {
  if (fileId.startsWith('mock-file-')) {
    return mockLoadFile(fileId);
  }

  try {
    const res = await fetch(`${API_BASE}?action=get&fileId=${fileId}`);
    if (!res.ok) throw new Error('Load file failed');
    return await res.json();
  } catch (err) {
    console.error('Error loading file', err);
    // If it was a real ID but fetch failed, we might want to alert the user
    throw err;
  }
};

export const saveToDrive = async (data: any, fileName: string, parentFolderId: string, existingFileId: string | null): Promise<string> => {
  // Check if we are in mock mode based on ID format
  if ((existingFileId && existingFileId.startsWith('mock-file-')) || parentFolderId.startsWith('mock-folder-')) {
     return mockSaveFile(data, fileName, parentFolderId, existingFileId);
  }

  try {
    // Construct Query Params for POST
    let url = API_BASE;
    if (existingFileId) {
        url += `?fileId=${existingFileId}`; // Update
    } else {
        url += `?folderId=${parentFolderId}&fileName=${encodeURIComponent(fileName)}`; // Create
    }

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data })
    });

    if (!res.ok) throw new Error('Update failed');
    const json = await res.json();
    return json.id;
  } catch (err) {
    console.warn('[Service] Save failed, falling back to Mock for safety (User will strictly operate locally now).', err);
    // Fallback: If API fails during save, we save to local mock to prevent data loss
    // Note: This effectively "disconnects" the file from Drive, but saves the data locally.
    return mockSaveFile(data, fileName, parentFolderId, existingFileId);
  }
};