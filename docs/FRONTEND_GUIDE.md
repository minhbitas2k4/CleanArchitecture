# HƯỚNG DẪN SỬ DỤNG FRONTEND REACT

## SALES MANAGEMENT FRONTEND

Tài liệu này hướng dẫn cấu trúc, cách chạy, cách kết nối API và quy ước phát triển frontend React của hệ thống Sales Management.

**Frontend:** React 19, Vite 8  
**Backend:** ASP.NET Core Web API .NET 8  
**Database:** SQL Server  
**Chức năng hiện có:** CRUD quản lý sản phẩm  
**Thư mục frontend:** `SaleManagementFE/`

---

## 1. Mục đích

Frontend cung cấp giao diện web cho các API quản lý sản phẩm hiện có. Ứng dụng hỗ trợ:

- Hiển thị danh sách sản phẩm.
- Tìm kiếm theo tên sản phẩm hoặc SKU.
- Phân trang và thay đổi số dòng hiển thị.
- Thêm sản phẩm.
- Cập nhật sản phẩm.
- Xóa sản phẩm sau khi người dùng xác nhận.
- Kiểm tra dữ liệu trên form trước khi gửi.
- Hiển thị lỗi validation và lỗi nghiệp vụ do API trả về.
- Hiển thị trạng thái loading, không có dữ liệu và kết quả thao tác.
- Responsive cho desktop, tablet và màn hình nhỏ.


```text
React + Vite
     |
     | HTTP/JSON
     v
SalesManagement.Api
     |
     v
Application -> Domain
     ^
     |
Infrastructure -> SQL Server
```

---

## 2. Công nghệ sử dụng

| Thành phần | Công nghệ | Vai trò |
|---|---|---|
| UI library | React 19 | Xây dựng component và quản lý trạng thái giao diện |
| Build tool | Vite 8 | Development server và production build |
| HTTP client | Fetch API | Gửi request tới backend, không cần cài Axios |
| Styling | CSS thuần | Giao diện, responsive và trạng thái component |
| Static analysis | ESLint | Kiểm tra lỗi và quy ước JavaScript/React |
| API format | JSON | Trao đổi dữ liệu giữa frontend và backend |


---

## 3. Cấu trúc thư mục

```text
SaleManagementFE/
|-- public/                         # Tài nguyên public do Vite phục vụ trực tiếp
|-- src/
|   |-- api/
|   |   `-- httpClient.js           # HTTP client dùng chung và chuẩn hóa lỗi API
|   |
|   |-- components/                 # Component dùng chung, không gắn nghiệp vụ cụ thể
|   |   |-- feedback/
|   |   |   |-- Alert.jsx
|   |   |   |-- EmptyState.jsx
|   |   |   `-- LoadingState.jsx
|   |   |-- layout/
|   |   |   `-- AppShell.jsx
|   |   `-- navigation/
|   |       `-- Pagination.jsx
|   |
|   |-- features/                   # Code tổ chức theo feature nghiệp vụ
|   |   `-- products/
|   |       |-- components/
|   |       |   |-- ProductFilters.jsx
|   |       |   |-- ProductForm.jsx
|   |       |   `-- ProductTable.jsx
|   |       `-- productApi.js
|   |
|   |-- pages/
|   |   `-- ProductsPage.jsx        # Ghép component và điều phối state của trang
|   |
|   |-- App.jsx                     # Root component
|   |-- App.css                     # Style giao diện ứng dụng
|   |-- index.css                   # Reset và style toàn cục
|   `-- main.jsx                    # Entry point của React
|
|-- .env.example                    # Ví dụ biến môi trường
|-- eslint.config.js                # Cấu hình ESLint
|-- index.html                      # HTML entry point
|-- package.json                    # Dependencies và npm scripts
`-- vite.config.js                  # Cấu hình Vite và development proxy
```

### 3.1 Quy tắc đặt code

| Loại code | Vị trí |
|---|---|
| HTTP client dùng cho toàn hệ thống | `src/api/` |
| Component có thể dùng cho nhiều feature | `src/components/` |
| API và component riêng của sản phẩm | `src/features/products/` |
| Component đại diện cho một màn hình | `src/pages/` |
| Cấu hình proxy development | `vite.config.js` |
| Biến môi trường mẫu | `.env.example` |

Không đặt trực tiếp toàn bộ logic gọi API, form và bảng dữ liệu trong `App.jsx`. `App.jsx` chỉ nên giữ vai trò ghép layout và page cấp cao.

---

## 4. Luồng xử lý frontend

### 4.1 Tải danh sách sản phẩm

```text
ProductsPage
    |
    v
getProducts() trong productApi.js
    |
    v
request() trong httpClient.js
    |
    v
GET /api/products
    |
    v
API trả PagedResult<ProductDto>
    |
    v
ProductTable + Pagination render dữ liệu
```

### 4.2 Thêm hoặc cập nhật sản phẩm

```text
Người dùng nhập ProductForm
    |
    v
Frontend validation
    |-- Không hợp lệ: hiển thị lỗi tại field
    `-- Hợp lệ: gửi JSON tới API
                     |
                     v
              Backend validation
                     |-- Lỗi: trả ProblemDetails
                     `-- Thành công: frontend tải lại danh sách
```

Frontend validation giúp phản hồi nhanh cho người dùng. Backend validation vẫn là lớp kiểm tra bắt buộc và là nguồn xác thực cuối cùng vì request có thể được gửi từ công cụ khác ngoài giao diện React.

---

## 5. API frontend đang sử dụng

| Chức năng | Method | Endpoint | Frontend function |
|---|---|---|---|
| Danh sách, tìm kiếm, phân trang | GET | `/api/products` | `getProducts()` |
| Tạo sản phẩm | POST | `/api/products` | `createProduct()` |
| Cập nhật sản phẩm | PUT | `/api/products/{id}` | `updateProduct()` |
| Xóa sản phẩm | DELETE | `/api/products/{id}` | `deleteProduct()` |

API có endpoint `GET /api/products/{id}`, nhưng giao diện hiện sử dụng dữ liệu sản phẩm đã có trong danh sách khi mở form chỉnh sửa nên chưa cần gọi riêng endpoint này.

### 5.1 Query danh sách

```http
GET /api/products?search=phone&pageNumber=1&pageSize=10
```

Response:

```json
{
  "items": [
    {
      "id": "11111111-1111-1111-1111-111111111111",
      "name": "Điện thoại mẫu",
      "sku": "PHONE-001",
      "price": 15990000,
      "stockQuantity": 25,
      "description": "Sản phẩm mẫu",
      "isActive": true,
      "createdAtUtc": "2026-09-30T03:00:00Z",
      "updatedAtUtc": null
    }
  ],
  "pageNumber": 1,
  "pageSize": 10,
  "totalCount": 1,
  "totalPages": 1
}
```

### 5.2 Payload tạo và cập nhật

```json
{
  "name": "Điện thoại mẫu",
  "sku": "PHONE-001",
  "price": 15990000,
  "stockQuantity": 25,
  "description": "Sản phẩm mẫu cho quản lý bán hàng",
  "isActive": true
}
```

Các tên thuộc tính dùng camelCase để khớp JSON contract mặc định của ASP.NET Core.

---

## 6. Yêu cầu môi trường

Máy phát triển cần có:

- Node.js `^20.19.0` hoặc `>=22.12.0` theo yêu cầu của Vite 8.
- npm đi kèm Node.js.
- .NET SDK 8.
- SQL Server hoặc SQL Server Express/Developer.
- Database `SalesManagementDb` đã được tạo bằng EF Core migration.

Kiểm tra phiên bản Node.js và npm:

```powershell
node --version
npm --version
```

---

## 7. Cài đặt và chạy toàn hệ thống

Các lệnh dưới đây được chạy từ thư mục gốc của repository, trừ khi có ghi chú khác.

### Bước 1: Kiểm tra connection string

Connection string nằm trong:

```text
src/SalesManagement.Api/appsettings.json
```

Cấu hình mặc định:

```text
Server=localhost;Database=SalesManagementDb;
Trusted_Connection=True;TrustServerCertificate=True;
MultipleActiveResultSets=true
```

### Bước 2: Cập nhật database

```powershell
dotnet ef database update `
  --project src/SalesManagement.Infrastructure `
  --startup-project src/SalesManagement.Api
```

### Bước 3: Chạy backend API

Mở terminal thứ nhất:

```powershell
dotnet run --project src/SalesManagement.Api --launch-profile https
```

API mặc định chạy tại:

```text
https://localhost:7017
http://localhost:5015
```

Swagger trong môi trường Development:

```text
https://localhost:7017/swagger
```

### Bước 4: Cài dependencies frontend

Mở terminal thứ hai:

```powershell
cd SaleManagementFE
npm install
```

### Bước 5: Chạy frontend

```powershell
npm run dev
```

Vite thường cung cấp địa chỉ:

```text
http://localhost:5173
```

Giữ cả terminal API và terminal Vite cùng hoạt động trong quá trình sử dụng hệ thống.

---

## 8. Cấu hình kết nối API

### 8.1 Cấu hình mặc định khi phát triển

`httpClient.js` sử dụng base URL mặc định:

```text
/api
```

`vite.config.js` proxy các request bắt đầu bằng `/api` tới:

```text
https://localhost:7017
```

Luồng request local:

```text
Browser
  -> http://localhost:5173/api/products
  -> Vite proxy
  -> https://localhost:7017/api/products
```

Nhờ proxy, trình duyệt gọi cùng origin với Vite nên không cần sửa CORS của backend trong môi trường local.

### 8.2 Thay đổi cổng API local

Tạo file `SaleManagementFE/.env.local`:

```env
VITE_API_BASE_URL=/api
VITE_API_PROXY_TARGET=https://localhost:7017
```

Thay `VITE_API_PROXY_TARGET` nếu API sử dụng cổng khác. Sau khi sửa biến môi trường, phải khởi động lại Vite.

Không commit `.env.local` nếu file chứa địa chỉ hoặc cấu hình riêng của máy phát triển.

### 8.3 Kết nối API riêng trong production

Ví dụ frontend và API chạy khác domain:

```env
VITE_API_BASE_URL=https://api.example.com/api
```

Khi đó backend phải cấu hình CORS để cho phép domain của frontend. Phương án thường dễ quản lý hơn là đặt frontend và API sau cùng một reverse proxy:

```text
https://sales.example.com/       -> React static files
https://sales.example.com/api/   -> ASP.NET Core API
```

Biến `VITE_*` được Vite đóng gói vào frontend tại thời điểm build. Không đặt password, token hoặc secret trong các biến này vì người dùng có thể xem chúng trong JavaScript đã build.

---

## 9. Validation và xử lý lỗi

### 9.1 Validation phía frontend

`ProductForm.jsx` kiểm tra:

| Thuộc tính | Quy tắc |
|---|---|
| Name | Bắt buộc, tối đa 200 ký tự |
| SKU | Bắt buộc, tối đa 50 ký tự |
| Price | Số lớn hơn hoặc bằng 0 |
| StockQuantity | Số nguyên lớn hơn hoặc bằng 0 |
| Description | Tối đa 1000 ký tự |
| IsActive | Boolean |

### 9.2 Lỗi từ backend

API trả lỗi theo `ProblemDetails`. Với lỗi validation, response có dạng:

```json
{
  "status": 400,
  "title": "Validation failed",
  "detail": "One or more validation errors occurred.",
  "errors": {
    "Name": ["Tên sản phẩm là bắt buộc."],
    "Sku": ["Mã SKU là bắt buộc."]
  }
}
```

Frontend chuyển key như `Name`, `StockQuantity` thành `name`, `stockQuantity` để hiển thị lỗi đúng field.

Các HTTP status frontend cần xử lý:

| Status | Ý nghĩa |
|---|---|
| 200 | Truy vấn hoặc cập nhật thành công |
| 201 | Tạo sản phẩm thành công |
| 204 | Xóa sản phẩm thành công |
| 400 | Dữ liệu không hợp lệ |
| 404 | Không tìm thấy sản phẩm |
| 409 | Xung đột dữ liệu, ví dụ SKU đã tồn tại |
| 500 | Lỗi không mong đợi ở server |

---

## 10. Các npm script

Chạy trong thư mục `SaleManagementFE`:

| Lệnh | Tác dụng |
|---|---|
| `npm run dev` | Chạy development server với hot reload |
| `npm run lint` | Kiểm tra JavaScript và React bằng ESLint |
| `npm run build` | Tạo production build vào thư mục `dist/` |
| `npm run preview` | Chạy thử production build trên máy local |

Trước khi bàn giao hoặc tạo pull request, chạy:

```powershell
npm run lint
npm run build
```

---

## 11. Quy trình thêm frontend feature mới

Ví dụ cần thêm chức năng quản lý khách hàng:

### Bước 1: Xác định API contract

- Liệt kê endpoint, HTTP method và status code.
- Xác định request/response JSON.
- Xác định format lỗi validation.

### Bước 2: Tạo feature folder

```text
src/features/customers/
|-- components/
|   |-- CustomerForm.jsx
|   |-- CustomerFilters.jsx
|   `-- CustomerTable.jsx
`-- customerApi.js
```

### Bước 3: Tạo page

```text
src/pages/CustomersPage.jsx
```

Page chịu trách nhiệm:

- Quản lý state cấp màn hình.
- Gọi function trong `customerApi.js`.
- Ghép component của feature.
- Hiển thị loading, success và error.

### Bước 4: Tái sử dụng component dùng chung

Ưu tiên sử dụng component trong `src/components/` như `Alert`, `LoadingState`, `EmptyState` và `Pagination`. Không sao chép component sang từng feature nếu hành vi giống nhau.

### Bước 5: Kiểm tra hoàn tất

- Chạy ESLint.
- Chạy production build.
- Kiểm tra loading, empty, success và error state.
- Kiểm tra responsive.
- Kiểm tra đầy đủ status code từ API.
- Cập nhật tài liệu nếu thêm convention hoặc biến môi trường mới.

---

## 12. Build và triển khai production

### 12.1 Tạo production build

```powershell
cd SaleManagementFE
npm run build
```

Kết quả nằm trong:

```text
SaleManagementFE/dist/
```

Đây là static files có thể được phục vụ bởi Nginx, IIS, CDN hoặc một static hosting service.

### 12.2 Checklist triển khai

- Cấu hình đúng `VITE_API_BASE_URL` trước khi build.
- Không đưa secret vào biến `VITE_*`.
- Dùng HTTPS cho cả frontend và API.
- Cấu hình CORS nếu frontend và API khác origin.
- Hoặc dùng reverse proxy để frontend và API cùng origin.
- Cấu hình SPA fallback về `index.html` nếu sau này dùng client-side routing.
- Bật cache dài hạn cho asset có hash trong tên file.
- Không cache dài hạn `index.html` để tránh giữ phiên bản cũ.
- Kiểm tra API health, database migration và logging trước khi phát hành.

---

## 13. Xử lý lỗi thường gặp

### 13.1 Frontend báo không thể kết nối tới API

Kiểm tra:

1. API có đang chạy hay không.
2. API có đúng cổng `https://localhost:7017` hay không.
3. `VITE_API_PROXY_TARGET` có khớp cổng API hay không.
4. SQL Server và database có hoạt động hay không.
5. Terminal chạy API có exception hay không.

### 13.2 Swagger chạy nhưng frontend không có dữ liệu

- Mở Developer Tools của trình duyệt và kiểm tra tab Network.
- Xác nhận request đi tới `/api/products`.
- Kiểm tra response status và response body.
- Kiểm tra Vite terminal có lỗi proxy hay không.
- Khởi động lại Vite nếu vừa thay đổi `.env.local`.

### 13.3 API trả 500

Lỗi 500 thường cần kiểm tra log của backend. Các nguyên nhân local phổ biến:

- Connection string sai.
- SQL Server chưa chạy.
- Chưa áp dụng migration.
- Database user không có quyền truy cập.

### 13.4 API trả 409 khi tạo hoặc sửa

SKU được cấu hình unique. Hãy dùng SKU khác hoặc kiểm tra sản phẩm đã tồn tại trong database.

### 13.5 Vite dùng cổng khác 5173

Nếu cổng 5173 đang được sử dụng, Vite sẽ chọn cổng khác. Development proxy vẫn hoạt động vì request `/api` được gửi qua chính Vite server đang chạy.

---

## 14. File quan trọng

| Mục đích | Đường dẫn |
|---|---|
| React entry point | `SaleManagementFE/src/main.jsx` |
| Root component | `SaleManagementFE/src/App.jsx` |
| Trang quản lý sản phẩm | `SaleManagementFE/src/pages/ProductsPage.jsx` |
| Product API functions | `SaleManagementFE/src/features/products/productApi.js` |
| Product form | `SaleManagementFE/src/features/products/components/ProductForm.jsx` |
| Product table | `SaleManagementFE/src/features/products/components/ProductTable.jsx` |
| HTTP client dùng chung | `SaleManagementFE/src/api/httpClient.js` |
| Vite proxy | `SaleManagementFE/vite.config.js` |
| Mẫu biến môi trường | `SaleManagementFE/.env.example` |
| Dependencies và scripts | `SaleManagementFE/package.json` |

---

## 15. Checklist review frontend

- [ ] Component có trách nhiệm rõ ràng và không quá lớn.
- [ ] Logic gọi API nằm trong file API của feature, không đặt rải rác trong component.
- [ ] Component dùng chung nằm trong `src/components/`.
- [ ] Component nghiệp vụ nằm trong `src/features/<feature>/components/`.
- [ ] Có loading, empty, success và error state.
- [ ] Form kiểm tra required, range và độ dài dữ liệu.
- [ ] Backend validation vẫn được hiển thị đúng field.
- [ ] Không hard-code production URL trong source code.
- [ ] Không đặt secret trong biến `VITE_*`.
- [ ] Giao diện hoạt động trên màn hình nhỏ.
- [ ] `npm run lint` thành công.
- [ ] `npm run build` thành công.
- [ ] Tài liệu được cập nhật khi thay đổi cấu trúc hoặc cách cấu hình.

---

Tài liệu này cần được cập nhật cùng frontend. Khi team thay đổi API contract, cấu trúc feature, biến môi trường hoặc quy trình deployment, pull request tương ứng phải cập nhật file hướng dẫn này.
