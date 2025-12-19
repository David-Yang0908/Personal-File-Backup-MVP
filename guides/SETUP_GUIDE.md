# 🛠️ 必要工具設定指南

本指南說明第一次使用此專案前需要安裝和設定的工具。

## 📋 必要工具清單

- ✅ **AWS CLI** - 用於與 AWS 服務互動
- ✅ **AWS SAM CLI** - 用於建置和部署 Serverless 應用程式
- ✅ **Node.js** - Lambda 函數使用 Node.js 22.x runtime
- ✅ **Git**（可選）- 用於版本控制

---

## 1. 安裝 AWS CLI

### Windows 11 安裝方式

#### 方法 A：使用 MSI 安裝程式（推薦）

1. **下載安裝程式**：
   - 前往 [AWS CLI 下載頁面](https://awscli.amazonaws.com/AWSCLIV2.msi)
   - 下載 `AWSCLIV2.msi` 安裝程式

2. **執行安裝**：
   - 雙擊下載的 `.msi` 檔案
   - 按照安裝精靈指示完成安裝
   - 預設安裝路徑：`C:\Program Files\Amazon\AWSCLIV2\`

3. **驗證安裝**：
   ```cmd
   aws --version
   ```
   應該顯示類似：`aws-cli/2.x.x Python/3.x.x Windows/10 exe/AMD64`

#### 方法 B：使用 PowerShell 安裝

```powershell
# 下載安裝程式
Invoke-WebRequest -Uri "https://awscli.amazonaws.com/AWSCLIV2.msi" -OutFile "$env:TEMP\AWSCLIV2.msi"

# 執行安裝（需要管理員權限）
Start-Process msiexec.exe -Wait -ArgumentList '/I',"$env:TEMP\AWSCLIV2.msi",'/quiet'
```

### 設定 AWS CLI

#### 步驟 1：配置 AWS 認證

```cmd
aws configure
```

系統會詢問以下資訊：

1. **AWS Access Key ID**：
   - 登入 AWS Console → IAM → Users → 選擇你的使用者
   - 前往 **Security credentials** 標籤
   - 點擊 **Create access key**
   - 選擇 **Command Line Interface (CLI)**
   - 複製 **Access key ID**

2. **AWS Secret Access Key**：
   - 從上一步的頁面複製 **Secret access key**（只會顯示一次，請妥善保存）

3. **Default region name**：
   - 輸入預設區域，例如：`us-east-1` 或 `ap-northeast-1`

4. **Default output format**：
   - 建議輸入：`json`（或 `table`、`text`）

#### 步驟 2：驗證配置

```cmd
# 檢查當前配置
aws configure list

# 測試連線（會顯示你的 AWS 帳號資訊）
aws sts get-caller-identity
```

#### 步驟 3：設定多個 Profile（可選）

如果你有多個 AWS 帳號或環境，可以使用 Profile：

```cmd
# 建立新的 Profile
aws configure --profile production

# 使用特定 Profile
aws s3 ls --profile production

# 設定環境變數使用特定 Profile
set AWS_PROFILE=production
```

---

## 2. 安裝 AWS SAM CLI

### Windows 11 安裝方式

#### 方法 A：使用 MSI 安裝程式（推薦）

1. **下載安裝程式**：
   - 前往 [AWS SAM CLI 下載頁面](https://github.com/aws/aws-sam-cli/releases)
   - 下載最新版本的 `AWSSAMCLISetup.exe`（Windows 安裝程式）

2. **執行安裝**：
   - 雙擊下載的 `.exe` 檔案
   - 按照安裝精靈指示完成安裝

3. **驗證安裝**：
   ```cmd
   sam --version
   ```
   應該顯示類似：`SAM CLI, version 1.x.x`

#### 方法 B：使用 Chocolatey（如果已安裝）

```powershell
choco install aws-sam-cli
```

#### 方法 C：使用 pip（需要 Python）

```cmd
pip install aws-sam-cli
```

### 驗證 SAM CLI 安裝

```cmd
# 檢查版本
sam --version

# 查看幫助
sam --help
```

---

## 3. 安裝 Node.js

### Windows 11 安裝方式

#### 方法 A：使用官方安裝程式（推薦）

1. **下載安裝程式**：
   - 前往 [Node.js 官方網站](https://nodejs.org/)
   - 下載 **LTS 版本**（建議使用 22.x 或 20.x）
   - 選擇 Windows Installer (.msi)

2. **執行安裝**：
   - 雙擊下載的 `.msi` 檔案
   - 按照安裝精靈指示完成安裝
   - **重要**：確保勾選「Add to PATH」選項

3. **驗證安裝**：
   ```cmd
   node --version
   npm --version
   ```
   應該顯示類似：
   - `v22.x.x`（Node.js 版本）
   - `10.x.x`（npm 版本）

#### 方法 B：使用 Chocolatey

```powershell
choco install nodejs-lts
```

#### 方法 C：使用 nvm-windows（管理多個 Node.js 版本）

1. **下載 nvm-windows**：
   - 前往 [nvm-windows GitHub](https://github.com/coreybutler/nvm-windows/releases)
   - 下載 `nvm-setup.exe`

2. **安裝並使用**：
   ```cmd
   # 安裝 Node.js 22.x
   nvm install 22.11.0
   
   # 使用特定版本
   nvm use 22.11.0
   ```

### 驗證 Node.js 安裝

```cmd
# 檢查版本
node --version
npm --version

# 測試執行 JavaScript
node -e "console.log('Node.js is working!')"
```

---

## 4. 安裝 Git（可選）

### Windows 11 安裝方式

#### 方法 A：使用官方安裝程式

1. **下載安裝程式**：
   - 前往 [Git 官方網站](https://git-scm.com/download/win)
   - 下載最新版本的安裝程式

2. **執行安裝**：
   - 雙擊下載的安裝程式
   - 按照安裝精靈指示完成安裝
   - 建議使用預設選項

3. **驗證安裝**：
   ```cmd
   git --version
   ```

#### 方法 B：使用 Chocolatey

```powershell
choco install git
```

---

## 5. 驗證所有工具安裝

建立一個驗證腳本 `verify-setup.bat`：

```batch
@echo off
echo ========================================
echo Verifying Required Tools
echo ========================================
echo.

echo [1/4] Checking AWS CLI...
aws --version
if %errorlevel% neq 0 (
    echo ERROR: AWS CLI not found!
    exit /b 1
)
echo OK: AWS CLI installed
echo.

echo [2/4] Checking AWS SAM CLI...
sam --version
if %errorlevel% neq 0 (
    echo ERROR: AWS SAM CLI not found!
    exit /b 1
)
echo OK: AWS SAM CLI installed
echo.

echo [3/4] Checking Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found!
    exit /b 1
)
echo OK: Node.js installed
echo.

echo [4/4] Checking npm...
npm --version
if %errorlevel% neq 0 (
    echo ERROR: npm not found!
    exit /b 1
)
echo OK: npm installed
echo.

echo ========================================
echo All tools verified successfully!
echo ========================================
```

執行驗證：

```cmd
verify-setup.bat
```

---

## 6. 設定 AWS 認證（詳細步驟）

### 取得 AWS Access Key

1. **登入 AWS Console**：
   - 前往 [AWS Console](https://console.aws.amazon.com/)

2. **建立 IAM 使用者**（如果還沒有）：
   - 前往 **IAM** → **Users** → **Create user**
   - 輸入使用者名稱（例如：`aws-cli-user`）
   - 選擇 **Provide user access to the AWS Management Console**（可選）
   - 點擊 **Next**

3. **設定權限**：
   - 選擇 **Attach policies directly**
   - 選擇適當的政策（例如：`PowerUserAccess` 或自訂政策）
   - 點擊 **Next** → **Create user**

4. **建立 Access Key**：
   - 選擇剛建立的使用者
   - 前往 **Security credentials** 標籤
   - 點擊 **Create access key**
   - 選擇 **Command Line Interface (CLI)**
   - 點擊 **Next** → **Create access key**
   - **重要**：立即下載或複製 Access Key ID 和 Secret Access Key

### 配置 AWS CLI

```cmd
aws configure
```

輸入以下資訊：

```
AWS Access Key ID [None]: AKIAIOSFODNN7EXAMPLE
AWS Secret Access Key [None]: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
Default region name [None]: us-east-1
Default output format [None]: json
```

### 驗證 AWS 認證

```cmd
# 檢查當前身份
aws sts get-caller-identity

# 應該顯示類似：
# {
#     "UserId": "AIDAXXXXXXXXXXXXXXXXX",
#     "Account": "123456789012",
#     "Arn": "arn:aws:iam::123456789012:user/aws-cli-user"
# }
```

---

## 7. 設定 IAM 權限

### 必要權限

SAM 部署需要以下 IAM 權限：

- **CloudFormation**：建立/更新/刪除 Stack、CreateChangeSet、ExecuteChangeSet
- **Lambda**：建立/更新/刪除函數、管理權限
- **API Gateway**：建立/管理 API
- **S3**：建立/管理 Bucket 和 Policy
- **SNS**：建立/管理 Topic
- **CloudWatch Logs**：建立 Log Group
- **IAM**：建立執行角色（供 Lambda 使用）

### 設定權限的方式

#### 方式 A：使用 AWS 管理政策（開發環境）

1. 前往 **IAM** → **Users** → 選擇你的使用者
2. 點擊 **Add permissions** → **Attach policies directly**
3. 搜尋並選擇：
   - `PowerUserAccess`（大部分權限，但無法管理 IAM）
   - 或 `AdministratorAccess`（完整權限，**僅限開發環境**）

#### 方式 B：使用自訂政策（生產環境推薦）

參考 `guides/DEPLOYMENT_GUIDE.md` 中的 IAM 權限設定章節。

---

## 8. 疑難排解

### 問題：`aws: command not found`

**解決方法**：
1. 確認 AWS CLI 已正確安裝
2. 重新啟動命令提示字元或 PowerShell
3. 檢查環境變數 PATH 是否包含 AWS CLI 安裝路徑

### 問題：`sam: command not found`

**解決方法**：
1. 確認 SAM CLI 已正確安裝
2. 重新啟動命令提示字元或 PowerShell
3. 檢查環境變數 PATH

### 問題：`node: command not found`

**解決方法**：
1. 確認 Node.js 已正確安裝
2. 重新啟動命令提示字元或 PowerShell
3. 檢查環境變數 PATH 是否包含 Node.js 安裝路徑

### 問題：AWS CLI 認證失敗

**錯誤訊息**：
```
Unable to locate credentials. You can configure credentials by running "aws configure".
```

**解決方法**：
1. 執行 `aws configure` 重新設定認證
2. 檢查 Access Key 是否正確
3. 確認 Access Key 未被停用

### 問題：權限不足（AccessDenied）

**錯誤訊息**：
```
An error occurred (AccessDenied) when calling the CreateChangeSet operation
```

**解決方法**：
1. 檢查 IAM 使用者權限
2. 參考 `guides/DEPLOYMENT_GUIDE.md` 中的 IAM 權限設定章節
3. 確認已附加必要的政策

---

## 9. 下一步

完成工具設定後，請繼續：

1. ✅ 閱讀 [部署指南](./DEPLOYMENT_GUIDE.md) - 了解如何部署應用程式
2. ✅ 閱讀 [測試指南](./TESTING_GUIDE.md) - 了解如何測試應用程式
3. ✅ 閱讀 [系統架構](./ARCHITECTURE.md) - 了解系統架構設計

---

## 📚 參考資源

- [AWS CLI 安裝文件](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- [AWS SAM CLI 安裝文件](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html)
- [Node.js 官方網站](https://nodejs.org/)
- [Git 官方網站](https://git-scm.com/)

