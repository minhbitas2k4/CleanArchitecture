<!-- cover -->
# HƯỚNG DẪN SỬ DỤNG CLEAN ARCHITECTURE
## SALES MANAGEMENT API
Tài liệu kiến trúc tổng thể, quy ước phát triển và checklist review dành cho dự án mẫu quản lý bán hàng.

**Nền tảng:** .NET 8 Web API, SQL Server, Entity Framework Core
**Mẫu kiến trúc:** Clean Architecture, CQRS, MediatR, Repository, Unit of Work
**Nghiệp vụ minh họa:** CRUD quản lý sản phẩm
**Phiên bản tài liệu:** 1.0
**Ngày cập nhật:** 30/09/2026
**Đối tượng sử dụng:** Giảng viên, reviewer, technical lead và thành viên phát triển
<!-- /cover -->

## Mục lục
<!-- toc-start -->
1. Mục đích và phạm vi
2. Tổng quan kiến trúc
3. Cấu trúc solution
4. Trách nhiệm của từng tầng
5. Luồng xử lý request
6. Các pattern đang sử dụng
7. Chức năng CRUD Product
8. Quy trình thêm feature mới
9. Quy ước phát triển
10. Cấu hình, migration và chạy dự án
11. Checklist review
12. Giới hạn hiện tại và hướng mở rộng
13. Phụ lục tra cứu nhanh
<!-- toc-end -->

<!-- pagebreak -->

# 1. Mục đích và phạm vi

Tài liệu này là hướng dẫn chính thức cho solution `SalesManagement`. Mục tiêu là giúp người đọc hiểu nhanh cấu trúc tổng thể, lý do phân tầng, đường đi của một request và cách mở rộng dự án mà không phá vỡ nguyên tắc Clean Architecture.

Tài liệu phục vụ ba nhu cầu:

- Trình bày kiến trúc với giảng viên, reviewer hoặc thành viên mới.
- Làm chuẩn tham chiếu khi bổ sung module nghiệp vụ.
- Làm checklist khi review pull request và đánh giá chất lượng code.

> **Phạm vi demo:** Project hiện minh họa CRUD quản lý sản phẩm. Đây là baseline kiến trúc, chưa phải bộ khung production hoàn chỉnh. Các phần xác thực, phân quyền, automated test, observability và deployment được liệt kê trong phần hướng mở rộng.

## 1.1 Công nghệ chính

| Thành phần | Công nghệ | Vai trò |
|---|---|---|
| Runtime | .NET 8 | Nền tảng chạy ứng dụng |
| HTTP API | ASP.NET Core Web API | Tiếp nhận và trả HTTP response |
| Mediator | MediatR 12 | Điều phối Command/Query tới Handler |
| Validation | FluentValidation 11 | Kiểm tra dữ liệu đầu vào qua pipeline |
| ORM | Entity Framework Core 8 | Mapping domain entity và truy cập dữ liệu |
| Database | SQL Server | Lưu trữ dữ liệu nghiệp vụ |
| API documentation | Swagger / OpenAPI | Khám phá và thử endpoint trong Development |

## 1.2 Nguyên tắc cốt lõi

- Business rule nằm gần Domain, không nằm trong Controller hoặc Repository.
- Dependency luôn hướng vào trong; tầng lõi không biết tầng triển khai bên ngoài.
- Use case được thể hiện bằng Command hoặc Query độc lập.
- Controller mỏng, chỉ chuyển đổi HTTP request và gọi `ISender`.
- Application phụ thuộc abstraction; Infrastructure cung cấp implementation.
- Entity không được trả trực tiếp ra API; response dùng DTO.
- Validation đầu vào và domain invariant là hai lớp bảo vệ khác nhau.

# 2. Tổng quan kiến trúc

Solution áp dụng Clean Architecture với bốn project chính:

```text
Client
  |
  v
SalesManagement.Api
  |--> SalesManagement.Application --> SalesManagement.Domain
  |
  `--> SalesManagement.Infrastructure --> SalesManagement.Application
                                  `----> SalesManagement.Domain
```

Quy tắc dependency:

| Project | Được phép phụ thuộc | Không được phụ thuộc |
|---|---|---|
| Domain | Không project nội bộ nào | Application, Infrastructure, Api |
| Application | Domain | Infrastructure, Api |
| Infrastructure | Application, Domain | Api |
| Api | Application, Infrastructure | Không chứa business rule |

> **Dependency Rule:** Domain là lõi ổn định nhất. Thay SQL Server, EF Core hoặc giao diện HTTP không được buộc Domain thay đổi.

## 2.1 Vì sao chia bốn project

Việc tách project tạo ra ranh giới compile-time. Nếu một developer cố sử dụng `ApplicationDbContext` trong Domain, project reference không cho phép code compile. Ranh giới kiến trúc vì vậy được bảo vệ tốt hơn so với chỉ chia folder trong một project duy nhất.

## 2.2 Composition Root

`SalesManagement.Api/Program.cs` là composition root. Đây là nơi duy nhất ghép các implementation cụ thể vào abstraction:

```csharp
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
```

Application đăng ký MediatR, handler, validator và pipeline behavior. Infrastructure đăng ký DbContext, repository và unit of work. Controller chỉ yêu cầu `ISender`, không tự khởi tạo dependency.

# 3. Cấu trúc solution

```text
SalesManagement.sln
src/
|-- SalesManagement.Domain/
|   |-- Common/
|   |-- Entities/
|   `-- Exceptions/
|
|-- SalesManagement.Application/
|   |-- Common/
|   |   |-- Behaviors/
|   |   |-- Exceptions/
|   |   |-- Interfaces/
|   |   `-- Models/
|   |-- Features/
|   |   `-- Products/
|   |       |-- Commands/
|   |       |-- Queries/
|   |       |-- DTOs/
|   |       `-- ProductMappings.cs
|   `-- DependencyInjection.cs
|
|-- SalesManagement.Infrastructure/
|   |-- Persistence/
|   |   |-- Configurations/
|   |   |-- Migrations/
|   |   `-- ApplicationDbContext.cs
|   |-- Repositories/
|   `-- DependencyInjection.cs
|
`-- SalesManagement.Api/
    |-- Controllers/
    |-- Middleware/
    |-- Program.cs
    `-- appsettings.json
```

## 3.1 Tổ chức theo feature

Application sử dụng cách tổ chức feature-first. Mỗi feature gom Command, Query, DTO và mapping liên quan vào cùng một nhánh. Khi số lượng module tăng, developer có thể tìm toàn bộ use case của `Products` mà không phải di chuyển qua nhiều folder kỹ thuật ở cấp root.

Ví dụ:

```text
Features/Products/
|-- Commands/
|   |-- CreateProduct/
|   |-- UpdateProduct/
|   `-- DeleteProduct/
|-- Queries/
|   |-- GetProductById/
|   `-- GetProducts/
|-- DTOs/
|   `-- ProductDto.cs
`-- ProductMappings.cs
```

# 4. Trách nhiệm của từng tầng

## 4.1 Domain

Domain chứa mô hình và quy tắc nghiệp vụ cốt lõi. Project này không tham chiếu EF Core, ASP.NET Core hoặc MediatR.

Thành phần hiện có:

- `BaseEntity`: định nghĩa `Id`, `CreatedAtUtc`, `UpdatedAtUtc`.
- `Product`: entity sản phẩm, factory method `Create`, behavior `Update` và invariant.
- `DomainException`: biểu diễn vi phạm quy tắc nghiệp vụ.

Ví dụ invariant trong `Product`:

```csharp
if (price < 0)
{
    throw new DomainException("Giá sản phẩm không được âm.");
}
```

Quy tắc dành cho Domain:

- Entity giữ setter ở mức `private` hoặc `protected` để tránh trạng thái không hợp lệ.
- Thay đổi trạng thái qua method có ý nghĩa nghiệp vụ như `Create`, `Update`, `Deactivate`.
- Không dùng `DbContext`, `IActionResult`, request model hoặc DTO trong Domain.
- Domain rule phải đúng bất kể dữ liệu đến từ API, background job hay message queue.

## 4.2 Application

Application mô tả các use case của hệ thống. Tầng này biết Domain nhưng không biết SQL Server hoặc cách repository được triển khai.

Application đang chứa:

- Command/Query và MediatR Handler.
- FluentValidation Validator.
- DTO và mapping từ entity sang DTO.
- Repository contract và `IUnitOfWork`.
- `PagedResult<T>` và application exception.
- `ValidationBehavior` dùng chung cho MediatR pipeline.

Quy tắc dành cho Application:

- Một handler đại diện cho một use case rõ ràng.
- Handler phụ thuộc interface, không phụ thuộc implementation trong Infrastructure.
- Không trả EF entity ra Controller; luôn map sang DTO.
- Không đặt HTTP status code hoặc `IActionResult` trong Application.
- Query không làm thay đổi dữ liệu; Command có thể thay đổi trạng thái.

## 4.3 Infrastructure

Infrastructure triển khai các cổng mà Application định nghĩa. Đây là nơi chứa công nghệ có thể thay thế như EF Core và SQL Server.

Thành phần hiện có:

- `ApplicationDbContext`: EF Core DbContext và implementation của `IUnitOfWork`.
- `ProductConfiguration`: mapping bảng, độ dài, precision và unique index.
- `Repository<TEntity>`: thao tác dữ liệu cơ bản dùng chung.
- `ProductRepository`: truy vấn đặc thù cho sản phẩm.
- `Migrations`: lịch sử thay đổi schema.
- `DependencyInjection`: ánh xạ interface sang implementation.

Quy tắc dành cho Infrastructure:

- Repository không chứa business rule; repository chỉ truy xuất và lưu dữ liệu.
- Không trả `IQueryable` ra Application vì sẽ làm rò rỉ chi tiết EF Core.
- Query chỉ đọc nên dùng `AsNoTracking()` khi phù hợp.
- Mapping database đặt trong `Persistence/Configurations`, không dùng attribute EF trong Domain.
- Mọi implementation phải được đăng ký tại `DependencyInjection.cs`.

## 4.4 API

API là delivery mechanism qua HTTP. Tầng này chuyển HTTP input thành Command/Query và chuyển kết quả thành HTTP response.

API hiện chứa:

- `ProductsController` với năm endpoint CRUD.
- `ExceptionHandlingMiddleware` chuẩn hóa lỗi thành `ProblemDetails`.
- Swagger trong môi trường Development.
- Cấu hình connection string và logging.

Quy tắc dành cho API:

- Controller không chứa nghiệp vụ hoặc EF query.
- Controller không gọi repository trực tiếp; request đi qua MediatR.
- Middleware xử lý concern dùng chung như exception, correlation, logging.
- API request/response contract phải rõ ràng và có thể version độc lập khi cần.

# 5. Luồng xử lý request

## 5.1 Luồng tạo sản phẩm

```text
POST /api/products
  -> ProductsController
  -> ISender.Send(CreateProductCommand)
  -> ValidationBehavior
  -> CreateProductCommandValidator
  -> CreateProductCommandHandler
  -> IProductRepository.ExistsBySkuAsync
  -> Product.Create
  -> IProductRepository.AddAsync
  -> IUnitOfWork.SaveChangesAsync
  -> ProductDto
  -> HTTP 201 Created
```

Giải thích từng bước:

1. Controller nhận JSON và tạo `CreateProductCommand`.
2. MediatR tìm handler tương ứng.
3. `ValidationBehavior` chạy toàn bộ validator của command trước handler.
4. Handler kiểm tra trùng SKU qua repository abstraction.
5. Domain factory tạo entity hợp lệ và chuẩn hóa SKU.
6. Repository thêm entity vào DbContext.
7. Unit of Work commit thay đổi bằng một lần `SaveChangesAsync`.
8. Entity được map thành `ProductDto` và API trả `201 Created`.

## 5.2 Luồng truy vấn danh sách

```text
GET /api/products?search=phone&pageNumber=1&pageSize=20
  -> ProductsController
  -> GetProductsQuery
  -> ValidationBehavior
  -> GetProductsQueryHandler
  -> IProductRepository.GetPagedAsync
  -> EF Core AsNoTracking + Count + Skip/Take
  -> PagedResult<ProductDto>
  -> HTTP 200 OK
```

Query sử dụng `AsNoTracking()` vì không cập nhật entity, giúp giảm chi phí change tracking. Phân trang được thực hiện tại database, không tải toàn bộ dữ liệu lên memory.

## 5.3 Luồng exception

```text
Handler/Repository throws exception
  -> ExceptionHandlingMiddleware catches exception
  -> Map exception to HTTP status
  -> Serialize ProblemDetails
  -> Return application/problem+json
```

| Exception | HTTP status hiện tại | Ý nghĩa |
|---|---:|---|
| `ValidationException` | 400 | Input không hợp lệ |
| `NotFoundException` | 404 | Không tìm thấy resource |
| `ConflictException` | 409 | Xung đột dữ liệu, ví dụ SKU trùng |
| Exception khác | 500 | Lỗi chưa dự kiến |

# 6. Các pattern đang sử dụng

## 6.1 CQRS

CQRS tách thao tác ghi thành Command và thao tác đọc thành Query.

| Loại | Ví dụ | Đặc điểm |
|---|---|---|
| Command | `CreateProductCommand` | Thay đổi trạng thái, có thể commit dữ liệu |
| Command | `UpdateProductCommand` | Cập nhật entity đã được tracking |
| Command | `DeleteProductCommand` | Xóa entity và commit |
| Query | `GetProductByIdQuery` | Chỉ đọc, không thay đổi trạng thái |
| Query | `GetProductsQuery` | Tìm kiếm và phân trang |

CQRS trong demo dùng chung một SQL Server và một domain model. Đây là logical CQRS, không phải mô hình tách riêng read database và write database.

## 6.2 MediatR

MediatR giúp Controller không cần biết handler cụ thể:

```csharp
var result = await sender.Send(command, cancellationToken);
```

Lợi ích chính:

- Giảm coupling giữa API và use case implementation.
- Mỗi use case có một handler dễ đọc và dễ test.
- Pipeline behavior xử lý concern dùng chung mà không lặp code.

Không nên dùng MediatR để che giấu một handler quá lớn. Nếu handler chứa nhiều nghiệp vụ, cần chuyển rule vào Domain service/entity hoặc tách use case phù hợp.

## 6.3 Validation Pipeline

`ValidationBehavior<TRequest,TResponse>` được đăng ký bằng `AddOpenBehavior`. Mọi request đi qua MediatR đều được tìm validator và chạy bất đồng bộ trước handler.

Phân biệt hai lớp validation:

| Lớp | Ví dụ | Mục tiêu |
|---|---|---|
| Input validation | Tên tối đa 200 ký tự | Phản hồi sớm, thông báo thân thiện |
| Domain invariant | Giá không được âm | Bảo vệ entity trong mọi entry point |

Không bỏ domain invariant chỉ vì đã có FluentValidation. Command có thể được gọi từ background worker hoặc test mà không đi qua API model binding.

## 6.4 Repository

Application định nghĩa `IRepository<TEntity>` và `IProductRepository`. Infrastructure triển khai bằng EF Core.

Generic repository chỉ giữ thao tác phổ biến:

- Lấy entity theo `Id` để update/delete.
- Thêm entity.
- Xóa entity.

Product repository chứa truy vấn có ngữ nghĩa riêng:

- Lấy sản phẩm read-only.
- Kiểm tra SKU đã tồn tại.
- Tìm kiếm và phân trang.

Không nên thêm một method generic như `GetAll()` rồi lọc ở memory. Query có filter, sorting và paging nên được thực hiện tại database.

## 6.5 Unit of Work

`ApplicationDbContext` triển khai `IUnitOfWork`. Handler gọi `SaveChangesAsync` một lần sau khi hoàn thành các thay đổi của use case.

Lợi ích:

- Application không phụ thuộc trực tiếp DbContext.
- Một use case có điểm commit rõ ràng.
- Có thể mở rộng transaction behavior khi use case gồm nhiều repository.

## 6.6 DTO và Mapping

`ProductDto` nằm tại `Application/Features/Products/DTOs`. DTO là contract dữ liệu Application trả cho delivery layer.

Không trả entity trực tiếp vì:

- Tránh lộ navigation property hoặc field nội bộ.
- Tránh client phụ thuộc cấu trúc persistence/domain.
- Cho phép thay đổi API response mà không phá entity.
- Giảm rủi ro over-posting.

Mapping hiện được viết thủ công trong `ProductMappings`. Cách này rõ ràng và đủ nhẹ cho demo. Khi số lượng mapping lớn, team có thể cân nhắc mapper library nhưng vẫn phải review mapping explicit ở các boundary quan trọng.

## 6.7 Dependency Injection

Application đăng ký MediatR và validators bằng assembly scanning. Infrastructure đăng ký implementation:

```csharp
services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
services.AddScoped<IProductRepository, ProductRepository>();
services.AddScoped<IUnitOfWork>(provider =>
    provider.GetRequiredService<ApplicationDbContext>());
```

Lifetime `Scoped` phù hợp với DbContext: mỗi HTTP request có một scope và một DbContext dùng chung cho repository/unit of work trong request đó.

# 7. Chức năng CRUD Product

## 7.1 Danh sách endpoint

| Method | Route | Request | Response thành công |
|---|---|---|---|
| GET | `/api/products` | `search`, `pageNumber`, `pageSize` | 200 + `PagedResult<ProductDto>` |
| GET | `/api/products/{id}` | Route Guid | 200 + `ProductDto` |
| POST | `/api/products` | `CreateProductCommand` | 201 + `ProductDto` |
| PUT | `/api/products/{id}` | `UpdateProductRequest` | 200 + `ProductDto` |
| DELETE | `/api/products/{id}` | Route Guid | 204 No Content |

## 7.2 Ví dụ tạo sản phẩm

```http
POST /api/products
Content-Type: application/json
```

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

## 7.3 Ví dụ response phân trang

```json
{
  "items": [
    {
      "id": "11111111-1111-1111-1111-111111111111",
      "name": "Điện thoại mẫu",
      "sku": "PHONE-001",
      "price": 15990000,
      "stockQuantity": 25,
      "description": "Sản phẩm mẫu cho quản lý bán hàng",
      "isActive": true,
      "createdAtUtc": "2026-09-30T03:00:00Z",
      "updatedAtUtc": null
    }
  ],
  "pageNumber": 1,
  "pageSize": 20,
  "totalCount": 1,
  "totalPages": 1
}
```

## 7.4 Ràng buộc dữ liệu

| Thuộc tính | Application validation | Database mapping |
|---|---|---|
| Name | Bắt buộc, tối đa 200 | `nvarchar(200)`, required |
| Sku | Bắt buộc, tối đa 50 | `nvarchar(50)`, unique index |
| Price | Lớn hơn hoặc bằng 0 | `decimal(18,2)`, required |
| StockQuantity | Lớn hơn hoặc bằng 0 | Integer |
| Description | Tối đa 1000 | `nvarchar(1000)`, nullable |
| IsActive | Boolean | Boolean |

# 8. Quy trình thêm feature mới

Ví dụ cần thêm feature `Customers`. Thực hiện theo thứ tự sau.

## Bước 1: Thiết kế Domain

- Tạo `Domain/Entities/Customer.cs`.
- Xác định invariant, factory method và behavior.
- Không thêm EF attribute hoặc HTTP concern.

## Bước 2: Tạo repository contract

- Tạo `ICustomerRepository` trong `Application/Common/Interfaces`.
- Chỉ khai báo query có ý nghĩa cho use case.
- Kế thừa `IRepository<Customer>` nếu cần thao tác cơ bản.

## Bước 3: Tạo feature folder

```text
Application/Features/Customers/
|-- Commands/
|-- Queries/
|-- DTOs/
`-- CustomerMappings.cs
```

## Bước 4: Tạo Command/Query

Mỗi use case nên có các file gần nhau:

```text
Commands/CreateCustomer/
|-- CreateCustomerCommand.cs
|-- CreateCustomerCommandValidator.cs
`-- CreateCustomerCommandHandler.cs
```

## Bước 5: Implement repository

- Tạo `Infrastructure/Repositories/CustomerRepository.cs`.
- Dùng `AsNoTracking()` cho query read-only.
- Không trả `IQueryable` khỏi Infrastructure.
- Đăng ký `ICustomerRepository` tại Infrastructure DI.

## Bước 6: Cấu hình EF Core

- Thêm `DbSet<Customer>` vào `ApplicationDbContext`.
- Tạo `CustomerConfiguration`.
- Cấu hình table, key, length, index, precision và relationship.
- Tạo migration mới và review SQL/schema diff.

## Bước 7: Tạo API endpoint

- Tạo `CustomersController` hoặc bổ sung endpoint phù hợp.
- Controller gọi `ISender.Send`.
- Khai báo response type và HTTP status đúng semantics.
- Không đưa business rule vào Controller.

## Bước 8: Bổ sung test

- Unit test Domain invariant.
- Unit test Handler với repository mock/fake.
- Integration test repository với database test.
- API integration test cho status code và contract.

## Bước 9: Kiểm tra hoàn tất

- Build solution không warning/error.
- Migration chạy được trên database mới.
- Swagger hiển thị đúng endpoint/schema.
- Error response theo `ProblemDetails`.
- Dependency không đi ngược vào Infrastructure/API.

# 9. Quy ước phát triển

## 9.1 Naming

| Thành phần | Quy ước | Ví dụ |
|---|---|---|
| Command | Động từ + Entity + `Command` | `CreateProductCommand` |
| Query | `Get` + Entity + tiêu chí + `Query` | `GetProductByIdQuery` |
| Handler | Tên request + `Handler` | `CreateProductCommandHandler` |
| Validator | Tên request + `Validator` | `CreateProductCommandValidator` |
| DTO | Entity + mục đích + `Dto` | `ProductDto` |
| Repository interface | `I` + Entity + `Repository` | `IProductRepository` |
| EF configuration | Entity + `Configuration` | `ProductConfiguration` |

## 9.2 CancellationToken

Mọi thao tác I/O bất đồng bộ phải truyền `CancellationToken` từ Controller tới MediatR, Handler, Repository và EF Core. Điều này cho phép hủy query khi client ngắt kết nối hoặc request timeout.

## 9.3 Async

- Dùng API async cho database và network I/O.
- Không dùng `.Result`, `.Wait()` hoặc tạo thread thủ công trong request pipeline.
- Không thêm hậu tố `Async` cho MediatR `Handle`, nhưng repository method async nên có `Async`.

## 9.4 Error handling

- Dùng exception có nghĩa ở Application: not found, conflict, validation.
- Không bắt exception rồi bỏ qua.
- Không trả stack trace hoặc thông tin nội bộ cho client production.
- Log lỗi bất ngờ với correlation/request identifier.

## 9.5 Database

- Migration phải được commit cùng thay đổi model.
- Không chỉnh migration đã chạy ở môi trường chia sẻ; tạo migration mới.
- Unique constraint phải tồn tại ở database, không chỉ kiểm tra bằng code.
- Truy vấn danh sách phải phân trang.
- Review index theo query thực tế.

## 9.6 Secret và configuration

- Không commit password, token hoặc production connection string.
- Development có thể dùng User Secrets hoặc biến môi trường.
- Production nên dùng secret manager của nền tảng triển khai.

# 10. Cấu hình, migration và chạy dự án

## 10.1 Yêu cầu môi trường

- .NET SDK 8.
- SQL Server hoặc SQL Server Express/Developer.
- EF Core CLI `dotnet-ef` phiên bản tương thích 8.x.

## 10.2 Connection string

Connection string mặc định nằm trong `src/SalesManagement.Api/appsettings.json`:

```text
Server=localhost;Database=SalesManagementDb;
Trusted_Connection=True;TrustServerCertificate=True;
MultipleActiveResultSets=true
```

Hãy thay đổi theo môi trường local. Không dùng cấu hình demo này trực tiếp cho production.

## 10.3 Restore và build

```powershell
dotnet restore SalesManagement.sln
dotnet build SalesManagement.sln
```

## 10.4 Cập nhật database

Migration `InitialCreate` đã có sẵn:

```powershell
dotnet ef database update `
  --project src/SalesManagement.Infrastructure `
  --startup-project src/SalesManagement.Api
```

## 10.5 Tạo migration mới

```powershell
dotnet ef migrations add AddCustomers `
  --project src/SalesManagement.Infrastructure `
  --startup-project src/SalesManagement.Api `
  --output-dir Persistence/Migrations
```

## 10.6 Chạy API

```powershell
dotnet run --project src/SalesManagement.Api
```

Trong Development, mở `/swagger` trên URL được terminal hiển thị.

# 11. Checklist review

## 11.1 Kiến trúc và dependency

- [ ] Domain không tham chiếu Application, Infrastructure hoặc Api.
- [ ] Application không tham chiếu Infrastructure hoặc Api.
- [ ] Business rule không nằm trong Controller/Repository.
- [ ] Handler chỉ phụ thuộc abstraction cần thiết.
- [ ] Implementation mới đã đăng ký trong DI.

## 11.2 Command, Query và Handler

- [ ] Tên request mô tả đúng use case.
- [ ] Command và Query không bị trộn trách nhiệm.
- [ ] Handler đủ nhỏ và có một lý do thay đổi chính.
- [ ] CancellationToken được truyền xuyên suốt.
- [ ] Query read-only dùng `AsNoTracking()` khi phù hợp.

## 11.3 DTO và API contract

- [ ] API không trả trực tiếp Domain entity.
- [ ] Request/response không lộ trường nội bộ.
- [ ] Status code đúng: 200, 201, 204, 400, 404, 409.
- [ ] Swagger mô tả đúng response type.
- [ ] Thay đổi contract có đánh giá backward compatibility.

## 11.4 Validation và error

- [ ] Validator kiểm tra format/range/required.
- [ ] Domain vẫn bảo vệ invariant cốt lõi.
- [ ] Exception được middleware ánh xạ đúng status.
- [ ] Response lỗi không lộ stack trace.
- [ ] Lỗi bất ngờ được log đủ context.

## 11.5 Persistence

- [ ] Mapping độ dài, required, precision và index đầy đủ.
- [ ] Query danh sách có phân trang.
- [ ] Không gọi `SaveChangesAsync` nhiều lần không cần thiết trong một use case.
- [ ] Migration mới đã được review.
- [ ] Constraint quan trọng được bảo vệ ở database.

## 11.6 Chất lượng bàn giao

- [ ] Build thành công, không warning.
- [ ] Unit test và integration test liên quan đều pass.
- [ ] Không commit secret hoặc dữ liệu nhạy cảm.
- [ ] README/tài liệu được cập nhật khi kiến trúc thay đổi.

# 12. Giới hạn hiện tại và hướng mở rộng

## 12.1 Các điểm cần review trước khi dùng làm production baseline

| Hạng mục | Hiện trạng | Khuyến nghị |
|---|---|---|
| Automated tests | Chưa có test project | Thêm Domain, Application và Integration tests |
| Authentication | Chưa có | Thêm JWT/OIDC và authorization policy |
| DomainException | Chưa được middleware map riêng | Map về 400/422 theo convention của team |
| Audit timestamp | `UpdatedAtUtc` được gán ở Domain và DbContext | Chọn một source of truth để tránh trùng trách nhiệm |
| API contract | POST bind trực tiếp Command | Tách request contract nếu cần versioning độc lập |
| Observability | Logging cơ bản | Thêm structured logging, tracing, correlation ID, metrics |
| Health checks | Chưa có | Thêm liveness/readiness và database check |
| Transactions | SaveChanges theo handler | Thêm transaction behavior cho use case nhiều aggregate |
| Concurrency | Chưa có concurrency token | Thêm row version cho dữ liệu có cập nhật đồng thời |
| Soft delete | Xóa vật lý | Chọn policy soft delete/audit theo yêu cầu nghiệp vụ |

## 12.2 Thứ tự mở rộng đề xuất

1. Thêm test projects và architecture tests.
2. Chuẩn hóa API contract và error code.
3. Thêm authentication/authorization.
4. Thêm logging, tracing, health checks.
5. Thêm transaction behavior và concurrency handling.
6. Chuẩn hóa CI/CD, migration deployment và environment configuration.

## 12.3 Không nên over-engineer quá sớm

Không cần tách microservice, event bus hoặc read database riêng khi chưa có yêu cầu tải, ownership và deployment độc lập. Baseline hiện tại phù hợp modular monolith/API có quy mô nhỏ đến trung bình. Chỉ bổ sung pattern khi có vấn đề thực tế cần giải quyết.

# 13. Phụ lục tra cứu nhanh

## 13.1 File quan trọng

| Mục đích | Đường dẫn |
|---|---|
| Composition root | `src/SalesManagement.Api/Program.cs` |
| Product endpoints | `src/SalesManagement.Api/Controllers/ProductsController.cs` |
| Global exception handling | `src/SalesManagement.Api/Middleware/ExceptionHandlingMiddleware.cs` |
| Application DI | `src/SalesManagement.Application/DependencyInjection.cs` |
| Validation pipeline | `src/SalesManagement.Application/Common/Behaviors/ValidationBehavior.cs` |
| Product repository contract | `src/SalesManagement.Application/Common/Interfaces/IProductRepository.cs` |
| Product DTO | `src/SalesManagement.Application/Features/Products/DTOs/ProductDto.cs` |
| Product entity | `src/SalesManagement.Domain/Entities/Product.cs` |
| DbContext | `src/SalesManagement.Infrastructure/Persistence/ApplicationDbContext.cs` |
| Product EF mapping | `src/SalesManagement.Infrastructure/Persistence/Configurations/ProductConfiguration.cs` |
| Product repository | `src/SalesManagement.Infrastructure/Repositories/ProductRepository.cs` |
| Infrastructure DI | `src/SalesManagement.Infrastructure/DependencyInjection.cs` |

## 13.2 Quy tắc quyết định đặt code ở đâu

| Câu hỏi | Nếu câu trả lời là có | Tầng |
|---|---|---|
| Đây có phải business invariant/mô hình nghiệp vụ? | Entity, Value Object, Domain service | Domain |
| Đây có phải use case của ứng dụng? | Command, Query, Handler | Application |
| Đây có phải abstraction mà use case cần? | Repository/service interface | Application |
| Đây có phụ thuộc EF Core, SQL Server hoặc external service? | Implementation | Infrastructure |
| Đây có liên quan HTTP, status code hoặc middleware? | Controller/middleware | Api |

## 13.3 Definition of Done cho feature

Một feature được xem là hoàn tất khi:

- Domain rule rõ ràng và được bảo vệ.
- Command/Query, Validator và Handler đúng trách nhiệm.
- DTO không làm lộ entity.
- Repository query hiệu quả và không rò rỉ EF Core.
- Mapping database và migration đầy đủ.
- API contract/status/error nhất quán.
- Test phù hợp đã pass.
- Build không warning/error.
- Tài liệu được cập nhật nếu có quy ước hoặc dependency mới.

---

Tài liệu này cần được cập nhật cùng codebase. Khi team thay đổi dependency rule, convention, error contract hoặc quy trình migration, pull request phải cập nhật tài liệu trong cùng thay đổi.
