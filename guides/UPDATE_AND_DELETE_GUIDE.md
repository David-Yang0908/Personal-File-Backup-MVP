# 🔄 AWS SAM 資源更新與刪除指南

## 📋 目錄

1. [更新現有資源](#更新現有資源)
2. [刪除資源](#刪除資源)
3. [重命名資源](#重命名資源)
4. [常見更新場景](#常見更新場景)

---

## 🔄 更新現有資源

### 基本流程

當你修改 `template.yaml` 或 Lambda 函數程式碼後，使用以下步驟更新部署：

```bash
# 1. 建置應用程式（必須先執行）
sam build

# 2. 部署更新
sam deploy
```

### 更新前的檢查

在更新前，建議先查看目前的變更：

```bash
# 查看 CloudFormation 會產生的變更
sam deploy --no-execute-changeset

# 或使用 AWS CLI 查看變更集
aws cloudformation describe-change-set \
  --stack-name dropbex-mvp \
  --change-set-name <change-set-name> \
  --region us-east-1
```

### 更新類型

#### 1. 更新 Lambda 函數程式碼

**情況**：只修改了 Lambda 函數的程式碼（`src/Function/index.js` 或 `src/Function2/index.js`）

```bash
# 建置並部署
sam build
sam deploy

# 這會觸發 Lambda 函數的程式碼更新，不會影響其他資源
```

**注意事項**：
- Lambda 函數的邏輯資源 ID（Logical Resource ID）不能改變
- 如果只更新程式碼，其他資源（如 S3 Bucket、API Gateway）不會受影響

#### 2. 更新 Lambda 函數配置

**情況**：修改了 Lambda 函數的配置（如 MemorySize、Timeout、Environment Variables）

```bash
sam build
sam deploy
```

**範例變更**：
- 修改 `MemorySize: 256` → `MemorySize: 512`
- 修改 `Timeout: 10` → `Timeout: 30`
- 新增或修改環境變數

#### 3. 更新 API Gateway 設定

**情況**：修改了 API Gateway 的路徑、方法、CORS 設定等

```bash
sam build
sam deploy
```

**範例變更**：
- 新增 API 端點
- 修改 CORS 設定
- 修改 API 路徑

#### 4. 更新其他資源（S3、SNS 等）

**情況**：修改了 S3 Bucket、SNS Topic 等資源的設定

```bash
sam build
sam deploy
```

**注意事項**：
- 某些資源屬性無法更新（如 S3 Bucket 名稱）
- 如果必須變更不可更新的屬性，需要刪除並重新建立資源

---

## 🗑️ 刪除資源

### 刪除整個 Stack（所有資源）

**⚠️ 警告**：這會刪除 Stack 中的所有資源，包括：
- Lambda 函數
- API Gateway
- S3 Bucket（**注意**：如果 Bucket 中有資料，也會被刪除）
- SNS Topic
- CloudWatch Log Groups（如果沒有設定 `DeletionPolicy: Retain`）

```bash
# 方法 1：使用 SAM CLI（推薦）
sam delete --stack-name dropbex-mvp --region us-east-1

# 方法 2：使用 AWS CLI
aws cloudformation delete-stack \
  --stack-name dropbex-mvp \
  --region us-east-1
```

**確認刪除**：
```bash
# 查看 Stack 狀態
aws cloudformation describe-stacks \
  --stack-name dropbex-mvp \
  --region us-east-1
```

### 刪除特定資源

**⚠️ 重要**：在 CloudFormation/SAM 中，**不能直接刪除 Stack 中的單一資源**。你必須：

1. **從 template.yaml 中移除資源定義**
2. **執行 `sam deploy` 來更新 Stack**

**範例**：刪除 Function2 Lambda 函數

```yaml
# 在 template.yaml 中，移除或註解掉以下資源：
# - Function2
# - Function2LogGroup
# - 以及 API Gateway 中相關的端點定義
```

然後執行：
```bash
sam build
sam deploy
```

**注意事項**：
- 刪除 Lambda 函數時，相關的 Log Group 也會被刪除（除非設定了 `DeletionPolicy: Retain`）
- 刪除 API Gateway 端點時，相關的路徑定義也會被移除
- 如果資源被其他資源引用（如 API Gateway 引用 Lambda），需要先移除引用關係

### 保留特定資源（避免被刪除）

如果你希望某些資源在 Stack 刪除時保留，可以使用 `DeletionPolicy`：

```yaml
FunctionLogGroup:
  Type: AWS::Logs::LogGroup
  DeletionPolicy: Retain  # 即使 Stack 被刪除，Log Group 也會保留
  Properties:
    LogGroupName: !Sub /aws/lambda/${Function}
```

**可用的 DeletionPolicy 值**：
- `Delete`（預設）：Stack 刪除時，資源也會被刪除
- `Retain`：Stack 刪除時，資源保留（需要手動刪除）
- `Snapshot`：僅適用於某些資源類型（如 RDS），刪除前建立快照

---

## 🔀 重命名資源

### 重命名 Lambda 函數

**⚠️ 重要**：在 CloudFormation 中，**重命名邏輯資源 ID 會被視為刪除舊資源並建立新資源**。

#### 步驟 1：更新 template.yaml

將 `Function` 重命名為 `RequestUploadHandler`：

```yaml
# 舊的定義
Function:
  Type: AWS::Serverless::Function
  # ...

# 新的定義
RequestUploadHandler:
  Type: AWS::Serverless::Function
  # ...
```

#### 步驟 2：更新所有引用

必須更新所有引用該資源的地方：

```yaml
# API Gateway 中的引用
uri: !Sub arn:${AWS::Partition}:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${RequestUploadHandler.Arn}/invocations

# Log Group 中的引用
LogGroupName: !Sub /aws/lambda/${RequestUploadHandler}

# Events 中的引用（如果有的話）
RestApiId: !Ref Api
```

#### 步驟 3：更新目錄結構

如果 Lambda 函數的程式碼目錄也需要重命名：

```bash
# Windows (PowerShell)
Rename-Item -Path "src\Function" -NewName "RequestUploadHandler"

# 或使用命令提示字元
ren src\Function RequestUploadHandler
```

然後更新 `template.yaml` 中的 `CodeUri`：

```yaml
RequestUploadHandler:
  Properties:
    CodeUri: src/RequestUploadHandler  # 更新路徑
```

#### 步驟 4：部署更新

```bash
sam build
sam deploy
```

**⚠️ 注意**：
- 這會**刪除舊的 Lambda 函數並建立新的**
- 舊的 Lambda 函數的 Log Group 也會被刪除（除非設定了 `DeletionPolicy: Retain`）
- API Gateway 會重新指向新的 Lambda 函數
- **舊的 Lambda 函數名稱和 ARN 會改變**

### 重命名其他資源

重命名其他資源（如 S3 Bucket、SNS Topic）的流程類似：

1. 更新 `template.yaml` 中的邏輯資源 ID
2. 更新所有引用該資源的地方
3. 執行 `sam build` 和 `sam deploy`

**⚠️ 注意**：
- S3 Bucket 名稱是全域唯一的，如果只是重命名邏輯資源 ID，實際的 Bucket 名稱不會改變（因為使用了 `!Sub ${AWS::StackName}-bucket-${AWS::AccountId}`）
- 如果要改變實際的 Bucket 名稱，需要先刪除舊的 Bucket（**會刪除所有資料**），然後建立新的

---

## 📝 常見更新場景

### 場景 1：新增 Lambda 函數

1. 建立新的目錄和程式碼：
   ```bash
   mkdir src\NewFunction
   # 建立 index.js 和 package.json
   ```

2. 在 `template.yaml` 中新增資源定義

3. 部署：
   ```bash
   sam build
   sam deploy
   ```

### 場景 2：修改 API Gateway 端點

1. 在 `template.yaml` 中修改 API Gateway 的 `DefinitionBody` 或 `Events`

2. 部署：
   ```bash
   sam build
   sam deploy
   ```

### 場景 3：更新環境變數

1. 在 `template.yaml` 中修改 Lambda 函數的 `Environment.Variables`

2. 部署：
   ```bash
   sam build
   sam deploy
   ```

### 場景 4：調整 Lambda 函數資源配置

1. 修改 `MemorySize`、`Timeout` 等設定

2. 部署：
   ```bash
   sam build
   sam deploy
   ```

---

## ⚠️ 重要注意事項

### 1. 資源刪除的不可逆性

- **S3 Bucket**：刪除後，所有資料都會永久遺失
- **Lambda 函數**：刪除後，函數程式碼和配置都會遺失
- **CloudWatch Logs**：如果沒有設定 `DeletionPolicy: Retain`，Log Group 和日誌都會被刪除

### 2. 資源依賴關係

在刪除資源前，確保沒有其他資源依賴它：

- API Gateway 端點依賴 Lambda 函數
- Lambda 函數可能依賴 S3 Bucket 或 SNS Topic
- Log Group 依賴 Lambda 函數

### 3. 更新失敗的回滾

如果更新失敗，CloudFormation 會自動回滾到之前的狀態（除非設定了 `DisableRollback: true`）。

查看回滾原因：
```bash
aws cloudformation describe-stack-events \
  --stack-name dropbex-mvp \
  --region us-east-1 \
  --query 'StackEvents[?ResourceStatus==`UPDATE_ROLLBACK_COMPLETE` || ResourceStatus==`UPDATE_FAILED`].[LogicalResourceId,ResourceStatusReason]' \
  --output table
```

### 4. 變更集（Change Set）

在生產環境，建議先建立變更集來預覽變更：

```bash
# 建立變更集（不執行）
sam deploy --no-execute-changeset

# 查看變更集
aws cloudformation describe-change-set \
  --stack-name dropbex-mvp \
  --change-set-name <change-set-name> \
  --region us-east-1
```

---

## 🔍 檢查更新狀態

### 查看 Stack 狀態

```bash
aws cloudformation describe-stacks \
  --stack-name dropbex-mvp \
  --region us-east-1 \
  --query 'Stacks[0].[StackStatus,StackStatusReason]' \
  --output table
```

### 查看資源更新狀態

```bash
aws cloudformation describe-stack-events \
  --stack-name dropbex-mvp \
  --region us-east-1 \
  --query 'StackEvents[*].[Timestamp,LogicalResourceId,ResourceStatus,ResourceStatusReason]' \
  --output table \
  --max-items 20
```

### 查看 Lambda 函數更新

```bash
# 列出所有 Lambda 函數
aws lambda list-functions \
  --region us-east-1 \
  --query 'Functions[?contains(FunctionName, `dropbex-mvp`)].FunctionName' \
  --output table
```

---

## 📚 相關文件

- [AWS SAM 部署指南](./DEPLOYMENT_GUIDE.md)
- [AWS CloudFormation 文件](https://docs.aws.amazon.com/cloudformation/)
- [AWS SAM 文件](https://docs.aws.amazon.com/serverless-application-model/)

