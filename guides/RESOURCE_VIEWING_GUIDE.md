# 🔍 如何查看佈署的 AWS 資源

本指南說明如何查看和管理已佈署的 AWS 資源。

## 📋 目錄

1. [使用 AWS Console 查看](#使用-aws-console-查看)
2. [使用 AWS CLI 查看](#使用-aws-cli-查看)
3. [使用 SAM CLI 查看](#使用-sam-cli-查看)
4. [查看特定資源](#查看特定資源)
5. [查看資源狀態和健康狀況](#查看資源狀態和健康狀況)

---

## 使用 AWS Console 查看

### 方法 1：透過 CloudFormation Stack 查看所有資源

1. **登入 AWS Console**
   - 前往 [AWS Console](https://console.aws.amazon.com/)

2. **前往 CloudFormation**
   - 在服務搜尋框中輸入 "CloudFormation"
   - 點擊 **CloudFormation** 服務

3. **選擇 Stack**
   - 在 Stacks 列表中，找到並點擊 `dropbex-mvp`（或你的 Stack 名稱）

4. **查看資源**
   - 點擊 **Resources** 標籤
   - 可以看到所有資源的：
     - **Logical ID**：在 template.yaml 中定義的資源名稱
     - **Physical ID**：實際的 AWS 資源名稱
     - **Resource type**：資源類型（如 AWS::Lambda::Function）
     - **Status**：資源狀態

5. **查看輸出**
   - 點擊 **Outputs** 標籤
   - 可以看到 Stack 的輸出值（如 API Gateway URL）

### 方法 2：個別服務查看

#### Lambda 函數

1. 前往 **Lambda** → **Functions**
2. 搜尋包含 `dropbex-mvp` 的函數：
   - `dropbex-mvp-RequestUploadHandler`
   - `dropbex-mvp-NotifyUploadedHandler`
   - `dropbex-mvp-SubscribeEmailHandler`

#### API Gateway

1. 前往 **API Gateway** → **APIs**
2. 找到名稱為 `Api From Stack dropbex-mvp` 的 API
3. 點擊進入可以查看：
   - 端點路徑（如 `/request-upload`）
   - 整合的 Lambda 函數
   - CORS 設定

#### S3 Bucket

1. 前往 **S3** → **Buckets**
2. 搜尋包含 `dropbex-mvp-bucket` 的 Bucket
3. 點擊進入可以查看：
   - 上傳的檔案
   - Bucket 政策
   - Event notifications 設定

#### SNS Topic

1. 前往 **SNS** → **Topics**
2. 找到對應的 Topic（通常名稱包含 Stack 名稱）
3. 點擊進入可以查看：
   - 訂閱者列表
   - 發送訊息統計

#### CloudWatch Logs

1. 前往 **CloudWatch** → **Log groups**
2. 搜尋包含 `dropbex-mvp` 的 Log Groups：
   - `/aws/lambda/dropbex-mvp-RequestUploadHandler`
   - `/aws/lambda/dropbex-mvp-NotifyUploadedHandler`
   - `/aws/lambda/dropbex-mvp-SubscribeEmailHandler`

---

## 使用 AWS CLI 查看

### 查看 CloudFormation Stack 資源

```cmd
# 列出 Stack 中的所有資源
aws cloudformation describe-stack-resources ^
  --stack-name dropbex-mvp ^
  --region us-east-1 ^
  --query "StackResources[*].[LogicalResourceId,ResourceType,ResourceStatus,PhysicalResourceId]" ^
  --output table
```

### 查看 Stack 輸出

```cmd
# 取得 Stack 輸出（如 API Gateway URL）
aws cloudformation describe-stacks ^
  --stack-name dropbex-mvp ^
  --region us-east-1 ^
  --query "Stacks[0].Outputs" ^
  --output table
```

### 查看 Stack 狀態

```cmd
# 查看 Stack 狀態
aws cloudformation describe-stacks ^
  --stack-name dropbex-mvp ^
  --region us-east-1 ^
  --query "Stacks[0].[StackName,StackStatus,CreationTime]" ^
  --output table
```

### 查看 Stack 事件

```cmd
# 查看最近的 Stack 事件
aws cloudformation describe-stack-events ^
  --stack-name dropbex-mvp ^
  --region us-east-1 ^
  --query "StackEvents[*].[Timestamp,LogicalResourceId,ResourceStatus,ResourceStatusReason]" ^
  --output table ^
  --max-items 20
```

---

## 使用 SAM CLI 查看

### 列出 Stack 輸出

```cmd
sam list stack-outputs --stack-name dropbex-mvp --region us-east-1
```

### 列出 Stack 資源

```cmd
sam list stack-resources --stack-name dropbex-mvp --region us-east-1
```

### 查看 Lambda 函數

```cmd
# 列出所有 Lambda 函數
sam list resources --stack-name dropbex-mvp --region us-east-1
```

---

## 查看特定資源

### Lambda 函數

#### 使用 AWS CLI

```cmd
# 列出所有 Lambda 函數
aws lambda list-functions ^
  --region us-east-1 ^
  --query "Functions[?contains(FunctionName, 'dropbex-mvp')].[FunctionName,Runtime,LastModified]" ^
  --output table

# 查看特定函數的詳細資訊
aws lambda get-function ^
  --function-name dropbex-mvp-RequestUploadHandler ^
  --region us-east-1

# 查看函數配置
aws lambda get-function-configuration ^
  --function-name dropbex-mvp-RequestUploadHandler ^
  --region us-east-1
```

#### 使用 PowerShell 腳本

建立 `list-lambda-functions.ps1`：

```powershell
param(
    [string]$StackName = "dropbex-mvp",
    [string]$Region = "us-east-1"
)

Write-Host "Lambda Functions in Stack: $StackName" -ForegroundColor Cyan
Write-Host ""

$functions = aws lambda list-functions `
    --region $Region `
    --query "Functions[?contains(FunctionName, '$StackName')].[FunctionName,Runtime,LastModified]" `
    --output json | ConvertFrom-Json

foreach ($func in $functions) {
    Write-Host "Function: $($func[0])" -ForegroundColor Yellow
    Write-Host "  Runtime: $($func[1])" -ForegroundColor Gray
    Write-Host "  Last Modified: $($func[2])" -ForegroundColor Gray
    Write-Host ""
}
```

### API Gateway

#### 取得 API Gateway URL

```cmd
# 方法 1：從 API Gateway 取得
aws apigateway get-rest-apis ^
  --region us-east-1 ^
  --query "items[?name=='Api From Stack dropbex-mvp'].id" ^
  --output text

# 方法 2：組合 URL（需要先取得 API ID）
set API_ID=<從上一步取得的 API ID>
echo https://%API_ID%.execute-api.us-east-1.amazonaws.com/Prod
```

#### 使用 PowerShell 腳本

建立 `get-api-url.ps1`：

```powershell
param(
    [string]$StackName = "dropbex-mvp",
    [string]$Region = "us-east-1"
)

$apiId = aws apigateway get-rest-apis `
    --region $Region `
    --query "items[?name=='Api From Stack $StackName'].id" `
    --output text

if ($apiId) {
    $apiUrl = "https://$apiId.execute-api.$Region.amazonaws.com/Prod"
    Write-Host "API Gateway URL: $apiUrl" -ForegroundColor Green
    return $apiUrl
} else {
    Write-Host "API Gateway not found" -ForegroundColor Red
    exit 1
}
```

### S3 Bucket

#### 列出 Bucket 中的檔案

```cmd
# 列出所有檔案
aws s3 ls s3://dropbex-mvp-bucket-<account-id>/ --region us-east-1

# 列出特定前綴的檔案
aws s3 ls s3://dropbex-mvp-bucket-<account-id>/prefix/ --region us-east-1
```

#### 取得 Bucket 名稱

```cmd
# 從 CloudFormation Stack 取得 Bucket 名稱
aws cloudformation describe-stack-resources ^
  --stack-name dropbex-mvp ^
  --region us-east-1 ^
  --logical-resource-id Bucket ^
  --query "StackResources[0].PhysicalResourceId" ^
  --output text
```

### SNS Topic

#### 查看 Topic 資訊

```cmd
# 列出所有 SNS Topics
aws sns list-topics --region us-east-1

# 取得 Topic ARN
aws cloudformation describe-stack-resources ^
  --stack-name dropbex-mvp ^
  --region us-east-1 ^
  --logical-resource-id Topic ^
  --query "StackResources[0].PhysicalResourceId" ^
  --output text

# 查看 Topic 屬性
aws sns get-topic-attributes ^
  --topic-arn <Topic ARN> ^
  --region us-east-1

# 列出訂閱者
aws sns list-subscriptions-by-topic ^
  --topic-arn <Topic ARN> ^
  --region us-east-1
```

### CloudWatch Logs

#### 查看 Log Groups

```cmd
# 列出所有 Log Groups
aws logs describe-log-groups ^
  --region us-east-1 ^
  --log-group-name-prefix "/aws/lambda/dropbex-mvp" ^
  --query "logGroups[*].[logGroupName,retentionInDays,creationTime]" ^
  --output table
```

#### 查看最近的日誌

```cmd
# 查看最近的日誌（最後 1 小時）
aws logs tail /aws/lambda/dropbex-mvp-RequestUploadHandler ^
  --since 1h ^
  --region us-east-1

# 持續監控日誌（類似 tail -f）
aws logs tail /aws/lambda/dropbex-mvp-RequestUploadHandler ^
  --follow ^
  --region us-east-1
```

---

## 查看資源狀態和健康狀況

### 使用 PowerShell 腳本查看所有資源狀態

建立 `check-resources.ps1`：

```powershell
param(
    [string]$StackName = "dropbex-mvp",
    [string]$Region = "us-east-1"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Checking Resources for Stack: $StackName" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check Stack Status
Write-Host "[1/5] Checking CloudFormation Stack..." -ForegroundColor Yellow
$stackStatus = aws cloudformation describe-stacks `
    --stack-name $StackName `
    --region $Region `
    --query "Stacks[0].StackStatus" `
    --output text

if ($stackStatus) {
    Write-Host "  Stack Status: $stackStatus" -ForegroundColor Green
} else {
    Write-Host "  Stack not found!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 2. Check Lambda Functions
Write-Host "[2/5] Checking Lambda Functions..." -ForegroundColor Yellow
$functions = aws lambda list-functions `
    --region $Region `
    --query "Functions[?contains(FunctionName, '$StackName')].FunctionName" `
    --output text

if ($functions) {
    $funcArray = $functions -split "`t"
    foreach ($func in $funcArray) {
        Write-Host "  ✓ $func" -ForegroundColor Green
    }
} else {
    Write-Host "  No Lambda functions found" -ForegroundColor Red
}
Write-Host ""

# 3. Check API Gateway
Write-Host "[3/5] Checking API Gateway..." -ForegroundColor Yellow
$apiId = aws apigateway get-rest-apis `
    --region $Region `
    --query "items[?name=='Api From Stack $StackName'].id" `
    --output text

if ($apiId) {
    $apiUrl = "https://$apiId.execute-api.$Region.amazonaws.com/Prod"
    Write-Host "  ✓ API Gateway found" -ForegroundColor Green
    Write-Host "  URL: $apiUrl" -ForegroundColor Gray
} else {
    Write-Host "  API Gateway not found" -ForegroundColor Red
}
Write-Host ""

# 4. Check S3 Bucket
Write-Host "[4/5] Checking S3 Bucket..." -ForegroundColor Yellow
$bucketName = aws cloudformation describe-stack-resources `
    --stack-name $StackName `
    --region $Region `
    --logical-resource-id Bucket `
    --query "StackResources[0].PhysicalResourceId" `
    --output text

if ($bucketName) {
    Write-Host "  ✓ Bucket: $bucketName" -ForegroundColor Green
    
    # Count files in bucket
    $fileCount = (aws s3 ls "s3://$bucketName/" --region $Region 2>$null | Measure-Object -Line).Lines
    Write-Host "  Files: $fileCount" -ForegroundColor Gray
} else {
    Write-Host "  S3 Bucket not found" -ForegroundColor Red
}
Write-Host ""

# 5. Check SNS Topic
Write-Host "[5/5] Checking SNS Topic..." -ForegroundColor Yellow
$topicArn = aws cloudformation describe-stack-resources `
    --stack-name $StackName `
    --region $Region `
    --logical-resource-id Topic `
    --query "StackResources[0].PhysicalResourceId" `
    --output text

if ($topicArn) {
    Write-Host "  ✓ Topic ARN: $topicArn" -ForegroundColor Green
    
    # Count subscriptions
    $subCount = (aws sns list-subscriptions-by-topic `
        --topic-arn $topicArn `
        --region $Region `
        --query "Subscriptions | length(@)" `
        --output text 2>$null)
    
    if ($subCount) {
        Write-Host "  Subscriptions: $subCount" -ForegroundColor Gray
    }
} else {
    Write-Host "  SNS Topic not found" -ForegroundColor Red
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Resource Check Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
```

使用方式：

```powershell
.\check-resources.ps1
.\check-resources.ps1 -StackName "dropbex-mvp" -Region "us-east-1"
```

---

## 快速參考命令

### 取得常用資訊

```cmd
# 取得 API Gateway URL（一行命令）
for /f "tokens=*" %i in ('aws apigateway get-rest-apis --region us-east-1 --query "items[?name=='Api From Stack dropbex-mvp'].id" --output text') do @echo https://%i.execute-api.us-east-1.amazonaws.com/Prod

# 取得 S3 Bucket 名稱
aws cloudformation describe-stack-resources --stack-name dropbex-mvp --region us-east-1 --logical-resource-id Bucket --query "StackResources[0].PhysicalResourceId" --output text

# 取得 SNS Topic ARN
aws cloudformation describe-stack-resources --stack-name dropbex-mvp --region us-east-1 --logical-resource-id Topic --query "StackResources[0].PhysicalResourceId" --output text
```

---

## 相關資源

- [CloudFormation 文件](https://docs.aws.amazon.com/cloudformation/)
- [AWS CLI 參考](https://docs.aws.amazon.com/cli/latest/reference/)
- [SAM CLI 文件](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)

