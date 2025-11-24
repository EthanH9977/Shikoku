// Simplified Interface
export interface DriveFile {
  id: string;
  name: string;
}

const API_BASE = '/api/drive';

// --- MOCK / LOCALSTORAGE FALLBACK IMPLEMENTATION ---
// This allows the app to work 100% locally if the backend is not configured or reachable

const MOCK_DELAY = 600; 

const mockLoginAndListFiles = async (username: string): Promise<{ userFolderId: string, files: DriveFile[] }> => {
  await new Promise(r => setTimeout(r, MOCK_DELAY));
  console.log(`[Mock] Logging in as ${username}`);
  
  localStorage.setItem('shikoku_mock_current_user', username);
  
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
  const key = `shikoku_mock_content_${fileId}`;
  const raw = localStorage.getItem(key);
  if (!raw) throw new Error("File not found in local mock");
  return JSON.parse(raw);
};

const mockSaveFile = async (data: any, fileName: string, usernameOrFolder: string, existingFileId: string | null): Promise<string> => {
  await new Promise(r => setTimeout(r, MOCK_DELAY));
  
  const fileId = existingFileId || `mock-file-${Date.now()}`;
  const currentUser = localStorage.getItem('shikoku_mock_current_user') || 'guest';

  // 1. Save Content
  localStorage.setItem(`shikoku_mock_content_${fileId}`, JSON.stringify(data));

  // 2. Update Index
  const indexKey = `shikoku_mock_files_${currentUser}`;
  const rawIndex = localStorage.getItem(indexKey);
  let files: DriveFile[] = rawIndex ? JSON.parse(rawIndex) : [];

  const existingIdx = files.findIndex(f => f.id === fileId);
  const safeName = fileName.endsWith('.json') ? fileName : `${fileName}.json`;

  if (existingIdx >= 0) {
    files[existingIdx].name = safeName;
  } else {
    files.push({ id: fileId, name: safeName });
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
        
        if (!res.ok && data.error === 'ROOT_FOLDER_NOT_FOUND') {
            throw new Error(`找不到 'TravelBook' 資料夾。\n\n請確認您已在 Google Drive 建立名稱為 'TravelBook' 的資料夾，並已將其「共用」給服務帳號：\n${data.serviceAccountEmail}\n\n權限請設為「編輯者」。`);
        }
        
        if (!res.ok) throw new Error(data.error || `API Error: ${res.status}`);
        return { ...data, isMock: false };
    } else {
        throw new Error(`Connection Error: ${res.status}`);
    }

  } catch (err: any) {
    console.warn('[Service] Backend API failed:', err);
    if (err.message && err.message.includes('TravelBook')) throw err;

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
  
  // LOGIC FIX:
  // 1. If the FOLDER is a mock folder (meaning we are fully offline), we MUST use mock save.
  if (parentFolderId.startsWith('mock-folder-')) {
     return mockSaveFile(data, fileName, parentFolderId, existingFileId);
  }

  // 2. If the FOLDER is Real, but the FILE is Mock (e.g. newly created locally), 
  //    we want to PROMOTE it to a real cloud file.
  //    So we set fileIdParam to null to force a CREATE operation on the server.
  let fileIdParam = existingFileId;
  if (existingFileId && existingFileId.startsWith('mock-file-')) {
      console.log('Promoting Mock File to Cloud File...');
      fileIdParam = null; 
  }

  // 3. Try Real API Save
  // IMPORTANT: We removed the silent try-catch. If this fails, we WANT the user to know 
  // (via the UI alert) that their cloud sync failed, instead of silently saving to local.
  let url = API_BASE;
  if (fileIdParam) {
      url += `?fileId=${fileIdParam}`; // Update
  } else {
      url += `?folderId=${parentFolderId}&fileName=${encodeURIComponent(fileName)}`; // Create
  }

  const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data })
  });

  if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Sync failed');
  }
  
  const json = await res.json();
  return json.id; // Return the NEW real ID
};