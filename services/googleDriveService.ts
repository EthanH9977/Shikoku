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
    
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        
        // Critical: Handle Root Folder Missing Error explicitly
        if (!res.ok && data.error === 'ROOT_FOLDER_NOT_FOUND') {
            throw new Error(`找不到 'TravelBook' 資料夾。\n\n請確認您已在 Google Drive 建立名稱為 'TravelBook' 的資料夾，並已將其「共用」給服務帳號：\n${data.serviceAccountEmail}\n\n權限請設為「編輯者」。`);
        }
        
        // Handle other API errors
        if (!res.ok) {
            throw new Error(data.error || `API Error: ${res.status}`);
        }
        
        return { ...data, isMock: false };
    } else {
        // HTML response usually means 404/500 from Vercel infrastructure itself
        throw new Error(`Connection Error: ${res.status}`);
    }

  } catch (err: any) {
    console.warn('[Service] Backend API failed:', err);
    
    // If it's the specific ROOT_FOLDER error, re-throw it so the user sees the alert
    // instead of silently mocking. This helps them fix the config.
    if (err.message && err.message.includes('TravelBook')) {
        throw err;
    }

    // Otherwise, fall back to mock
    console.log('Falling back to LocalStorage Mock.');
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
    console.warn('[Service] Save failed, falling back to Mock for safety.', err);
    return mockSaveFile(data, fileName, parentFolderId, existingFileId);
  }
};