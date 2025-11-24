# Shikoku Project Setup Guide

為了達成您的目標 (React App + Google Drive 儲存 + Vercel 部署)，我們需要完成以下設定。

## 1. 環境準備 (必要)
您的電腦目前缺少 Node.js，這是開發 React 的基礎。
請前往 [Node.js 官網](https://nodejs.org/en/download/) 下載並安裝 **LTS 版本**。
安裝後，請**重開 Terminal** 並輸入 `node -v` 確認。

## 2. Google Cloud 設定 (取得 API Key)
為了讓 App 能讀寫您的 Google Drive，我們需要一個「服務帳號」。

1.  前往 [Google Cloud Console](https://console.cloud.google.com/)。
2.  建立一個新專案 (例如命名為 `TravelBook`).
3.  在左側選單找 **「API 和服務」** -> **「啟用 API 和服務」**。
4.  搜尋 **"Google Drive API"** 並啟用它。
5.  前往 **「IAM 與管理員」** -> **「服務帳號」**。
6.  點擊 **「建立服務帳號」**，隨便取名 (例如 `drive-bot`)，按完成。
7.  點擊剛剛建立的帳號 (Email 格式)，進入 **「金鑰」** 分頁。
8.  點擊 **「新增金鑰」** -> **「建立新金鑰」** -> 選擇 **JSON** -> 下載。
    *   ⚠️ **請妥善保存這個 JSON 檔案，不要給別人！**
    *   打開這個 JSON 檔，您會看到 `client_email` 和 `private_key`，等下會用到。

## 3. Google Drive 設定 (共用資料夾)
1.  前往您的 Google Drive。
2.  建立一個新資料夾，名稱必須是 **`TravelBook`** (大小寫要一樣)。
3.  對這個資料夾按右鍵 -> **「共用」**。
4.  在「新增使用者」欄位，貼上剛剛那個服務帳號的 **Email** (在 JSON 檔裡的 `client_email`)。
5.  權限設為 **「編輯者」** -> 傳送。

## 4. Vercel 部署設定
1.  將目前的程式碼 Push 到 GitHub。
2.  前往 [Vercel](https://vercel.com/) -> **Add New Project** -> Import 您的 GitHub 倉庫。
3.  在 **Environment Variables** (環境變數) 區塊，新增以下兩個變數：
    *   `GOOGLE_CLIENT_EMAIL`: (填入 JSON 檔裡的 `client_email`)
    *   `GOOGLE_PRIVATE_KEY`: (填入 JSON 檔裡的 `private_key`，包含 `-----BEGIN PRIVATE KEY...` 整段)
4.  點擊 **Deploy**。

完成以上步驟後，您的 App 就能在 Vercel 上運作，並且將資料存在您的 Google Drive 了！
