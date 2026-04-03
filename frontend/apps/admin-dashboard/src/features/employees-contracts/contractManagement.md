# Rule: Chỉ được thực hiện chỉnh sửa bên phía FE và tuyệt đối không được đụng vào BE. Khi làm phải tách thành các component nhỏ để tái sử dụng và dễ scale sau này. Xem và đối chiếu các models bên BE để hiểu rõ về dữ liệu và tên các trường.
Hãy đóng vai trò là một senior frontend developer và thực hiện các yêu cầu sau:
Việc đầu tiên cần làm là viết lại router với cấu trúc như sau cho Module quản lý nhân sự: "https://.../personnel/employees" và "https://.../personnel/contracts", personnel ở đây biểu thị cho vị trí của module quản lý nhân sự trong hệ thống, employees là bảng hiển thị danh sách nhân viên, contracts là bảng hiển thị danh sách hợp đồng, cả hai đều chung 1 router vì chúng liên quan đến nhau nhưng tách thành 2 trang riêng biệt để quản lý trong 1 module.

# Yêu cầu 1: Xây dựng trang Xem và quản lý Danh sách Hợp đồng lao động:
- UserStory
Là một Quản lý Nhân sự (HR) Tôi muốn xem được danh sách tổng hợp và chi tiết các hợp đồng lao động của nhân viên trên hệ thống Để tôi có thể dễ dàng theo dõi tình trạng hợp đồng (đang hiệu lực, chờ ký, hết hạn) và quản lý thông tin một cách tập trung.
- Acceptance Criteria (AC)
AC 1: Hiển thị các thẻ thống kê tổng quan (Summary Cards)
Hiển thị 3 thẻ thống kê ở góc trên cùng:
[Số lượng] Hợp đồng đang hiệu lực
[Số lượng] Chờ ký
[Số lượng] Hết hạn
Số lượng trên các thẻ này phải được cập nhật real-time hoặc mỗi khi tải lại trang dựa trên dữ liệu thực tế.
AC 2: Hiển thị bảng danh sách hợp đồng (Data Table)
Bảng dữ liệu phải bao gồm các cột sau: Checkbox (để chọn nhiều), STT, Số (Mã hợp đồng), Họ và tên (kèm Avatar/Tên viết tắt), Chi nhánh, Loại hợp đồng, Trạng thái (hiển thị dạng badge màu sắc để dễ nhận diện), Ngày hết hạn, Thao tác (icon 3 chấm) gồm có Xem với icon con mắt và Xóa.
Hiển thị tổng số bản ghi đang có trên màn hình (VD: "Đang hiển thị 2/2").
AC 3: Chức năng Tìm kiếm và Lọc (Search & Filter)
Có thanh tìm kiếm (Tìm kiếm theo Tên nhân viên hoặc Số hợp đồng).
Có nút "Bộ lọc nâng cao" (icon settings), khi thao tác vào nút này sẽ hiển thị filter sidebar để lọc theo Chi nhánh và Phòng ban cho danh sách hiển thị.
Có Dropdown "Tất cả loại" để lọc theo Loại hợp đồng (Hợp đồng chính thức, Hợp đồng thử việc, Hợp đồng mùa vụ).
Hệ thống cập nhật lại danh sách ngay sau khi người dùng nhập từ khóa (có debounce time) hoặc chọn bộ lọc.
AC 4: Các nút Thao tác chính
Nút "+ Tạo mới": Click vào sẽ điều hướng sang modal tạo hợp đồng mới.
Nút "Xuất file": Cho phép xuất danh sách hợp đồng hiện tại (sau khi đã áp dụng các bộ lọc) ra định dạng Excel(dù trong bảng hiển thị và bộ lọc không hiển thị nhưng vẫn phải xuất ra Mã nhân viên và Ngày ký).
- Các task cần làm:
+ Code FE: Dựng layout tổng thể trang "Quản lý hợp đồng lao động" (Header, Tabs, CSS tổng quan).
+ Code FE: Xây dựng component Bảng dữ liệu (Table), xử lý render các cột (bao gồm Avatar chữ, Badge trạng thái màu xanh lam ngọc).
+ Code FE: Xây dựng component và xử lý logic hiển thị cho nút "+ Tạo mới" để hiển thị modal chọn cách tạo hợp đồng với 2 lựa chọn: Tạo mới hợp đồng thông thường và Tạo mới hợp đồng điện tử.
+ Code FE: Xây dựng component Filter Sidebar nâng cao giống 100% với component Filter Sidebar của trang Quản lý nhân viên (lọc theo Chi nhánh, Phòng ban) và tích hợp vào trang.
+ Code FE: Xây dựng component Search Bar (tìm kiếm theo Tên nhân viên hoặc Số hợp đồng) và tích hợp vào trang.
+ Code FE: Xây dựng component Dropdown "Tất cả loại" (lọc theo Loại hợp đồng) và tích hợp vào trang.
+ Code FE: Xây dựng component và xử lý logic hiển thị tổng số bản ghi (VD: "Đang hiển thị 2/2").
+ Code FE: Xây dựng component và xử lý logic hiển thị phân trang giống với component phân trang của trang Quản lý nhân viên.
+ Code FE: Xây dựng component và xử lý logic hiển thị Badge trạng thái màu sắc (đang hiệu lực, chờ ký, hết hạn).
+ Code FE: Xây dựng component và xử lý logic hiển thị Avatar chữ (tên viết tắt của nhân viên).
+ Code FE: Xây dựng component và xử lý logic hiển thị ngày hết hạn (định dạng dd/mm/yyyy).
+ Code FE: Xây dựng component và xử lý logic hiển thị thao tác (icon 3 chấm) gồm có Xem với icon con mắt và Xóa.
+ Code FE: Xây dựng component và xử lý logic hiển thị các thẻ thống kê tổng quan (Summary Cards) gồm có [Số lượng] Hợp đồng đang hiệu lực, [Số lượng] Chờ ký, [Số lượng] Hết hạn.
+ Code FE: Xây dựng component và xử lý logic hiển thị các nút thao tác chính gồm có nút "+ Tạo mới" và nút "Xuất file".
+ Code FE: Xây dựng component và xử lý logic hiển thị cho nút Tùy chỉnh cột (Column Settings) giống 100% với component Tùy chỉnh cột của trang Quản lý nhân viên(gồm các cột như: STT, Số(tức số hợp đồng), Họ và tên, Chi nhánh, Loại hợp đồng, Trạng thái, Ngày hết hạn), có switch bật tắt các cột và bật tắt chức năng phân trang giống như các làm bên trang Quản lý nhân viên.

# Khi người dùng click vào nút "+ Tạo mới" ở màn hình danh sách hợp đồng, hiển thị modal "Tạo mới hợp đồng" sẽ mở ra 2 lựa chọn (Card): "Hợp đồng thông thường" và "Hợp đồng điện tử" như sau:
# Yêu cầu 2: Chọn loại hợp đồng và Tạo Hợp đồng thông thường
- UserStory
Là một Quản lý Nhân sự Tôi muốn có thể chọn loại hình khởi tạo và điền các thông tin cho "Hợp đồng thông thường" Để tôi có thể lưu trữ thông tin và tệp đính kèm của các hợp đồng đã ký giấy/ký tay bên ngoài lên hệ thống một cách chính xác.
- Acceptance Criteria (AC)
AC 1: Hiển thị Modal chọn cách tạo hợp đồng:
Khi click nút "+ Tạo mới" ở màn hình danh sách, hiển thị modal "Tạo mới hợp đồng" chứa 2 lựa chọn (Card): "Hợp đồng thông thường" và "Hợp đồng điện tử".
Có icon X góc trên bên phải để đóng modal.
AC 2: Giao diện Form "Tạo hợp đồng thông thường":
Khi click vào Card "Hợp đồng thông thường", đóng modal chọn và mở ra modal "Tạo hợp đồng thông thường".
Hiển thị đầy đủ các trường thông tin:
Bắt buộc (*): Nhân viên (Dropdown tìm kiếm), Số hợp đồng (Text input), Loại hợp đồng (Dropdown), Người ký (Dropdown tìm kiếm), Ngày ký (Datepicker), Loại thuế thu nhập cá nhân (Dropdown).
Không bắt buộc: Ngày hết hạn (Datepicker), Tệp đính kèm (Upload button).
AC 3: Validation (Xác thực dữ liệu):
Không cho phép submit (nút "Hoàn thành" bị disable hoặc báo lỗi đỏ) nếu các trường bắt buộc bị bỏ trống.
Trường "Ngày hết hạn" phải lớn hơn hoặc bằng "Ngày ký", chặn các ngày trước "Ngày ký" trong Datepicker.
Thực hiện kiểm tra "Hình thức làm việc" trong Tình trạng công việc của nhân viên đang được chọn để tạo Hợp đồng. Nếu nhân viên đó chưa được set Hình thức làm việc thì hiển thị thông báo "Hồ sơ nhân viên bị thiếu Hình thức làm việc. Vui lòng cập nhật hồ sơ." và không cho phép submit, khi hiển thị toast thì phải có button để người dùng đi đến phần Sửa trong employee-detail và thực hiện chọn Hình thức làm việc, việc này giúp tăng UX cho hệ thống.
AC 4: Lưu thông tin:
Người dùng đính kèm file (PDF, Docx) và hệ thống hiển thị trạng thái upload thành công.
Khi bấm "Hoàn thành", hệ thống lưu dữ liệu, đóng modal, hiển thị Toast message "Tạo hợp đồng thành công" và tự động làm mới danh sách hợp đồng.
- Các task cần làm:
+ Code FE: Dựng giao diện Modal "Tạo mới hợp đồng" (chứa 2 tuỳ chọn).
+ Code FE: Xử lý logic Upload "Tệp đính kèm" lên server.
+ Code FE: Dựng giao diện Modal "Tạo hợp đồng thông thường" và xử lý logic validation form.
+ Code FE: Xử lý logic lưu dữ liệu và làm mới danh sách hợp đồng.
+ Code FE: Xử lý logic hiển thị Toast message "Tạo hợp đồng thành công" và tự động làm mới danh sách hợp đồng.
+ Code FE: Xử lý logic hiển thị thông báo "Hồ sơ nhân viên bị thiếu Hình thức làm việc. Vui lòng cập nhật hồ sơ." và không cho phép submit, khi hiển thị toast thì phải có button để người dùng đi đến phần Sửa trong employee-detail và thực hiện chọn Hình thức làm việc, việc này giúp tăng UX cho hệ thống.
+ Code FE: Xử lý logic hiển thị thông báo lỗi khi người dùng cố gắng tạo hợp đồng với số hợp đồng đã tồn tại.

# Yêu cầu 3: Tạo Hợp đồng điện tử
- UserStory
Là một Quản lý Nhân sự Tôi muốn điền các thông tin cơ bản và chọn mẫu văn bản cho "Hợp đồng điện tử" Để tôi có thể chuẩn bị nội dung và thiết lập luồng trình ký số cho nhân viên.
- Acceptance Criteria (AC)
AC 1: Giao diện Form "Tạo hợp đồng điện tử (Bước 1)":
Khi click chọn "Hợp đồng điện tử", hiển thị màn hình tạo mới với thanh Tiến trình (Stepper) 5 bước. Đang active ở Bước 1 "Thông tin hợp đồng".
Các trường hiển thị (tất cả đều bắt buộc trừ Tệp đính kèm): Nhân viên, Số(số hợp đồng), Hợp đồng mẫu(chọn mẫu có sẵn), Tệp đính kèm(upload file), Loại hợp đồng(Hợp đồng chính thức, Hợp đồng thử việc, Hợp đồng mùa vụ), Người ký / Ngày ký(Chọn bên ký và ngày thực hiện ký), Ngày hết hạn, Loại thuế TNCN(Cư trú có hợp đồng lao động 3 tháng trở lên, Cá nhân không cư trú, Không tính thuế, Hợp đồng lao động dưới 3 tháng, Cá nhân chịu thuế TNCN toàn phần, Cá nhân ký hợp đồng khác).
AC 2: Chức năng "Chọn mẫu hợp đồng":
Khi click nút "+ Chọn mẫu hợp đồng", hiển thị popup Modal chứa danh sách các mẫu.
Các mẫu được trình bày dạng Card, hiển thị tiêu đề rõ ràng (Hợp đồng thử việc - F&B,
Hợp đồng lao động xác định thời hạn - F&B,
Hợp đồng lao động không xác định thời hạn - F&B,
Hợp đồng cộng tác - F&B,
Hợp đồng thử việc - (Ngành Công Nghệ),
Hợp đồng lao động xác định thời hạn - (Ngành Công nghệ),
Hợp đồng lao động không xác định thời hạn - (Ngành Công nghệ),
Hợp đồng công tác - Dịch vụ,
Hợp đồng thử việc (Ngành bán lẻ),
Hợp đồng lao động xác định thời hạn (Ngành bán lẻ),
Hợp đồng lao động không xác định thời hạn (Ngành bán lẻ),
Hợp đông cộng tác - (Ngành Bán lẻ) (có thể là "Hợp đồng cộng tác"),
Hợp đồng thử việc - (Ngành xây dựng),
Hợp đồng lao động xác định thời hạn - (Ngành Xây Dựng),
Hợp đồng lao động không xác định thời hạn - (Ngành xây dựng),
Hợp đồng lao động không xác định thời hạng - (Ngành Công nghệ)).
Khi click chọn 1 thẻ Card, popup tự động đóng và cập nhật tên mẫu văn bản đã chọn vào trường "Hợp đồng mẫu" ở màn hình Bước 1.
AC 3: Validation & Chuyển bước:
Bắt buộc người dùng phải điền đủ các trường có dấu (*) và phải chọn ít nhất 1 Mẫu hợp đồng hoặc Tải lên Tệp đính kèm.
Khi bấm nút "Tiếp tục", hệ thống kiểm tra hợp lệ và chuyển sang UI Bước 2 (Xem lại hợp đồng).

- Các task cần làm:s
+ Code FE: Dựng layout Hợp đồng điện tử với Stepper 5 bước (hiển thị UI Bước 1).
+ Code FE: Dựng form Bước 1 và xử lý validation.
+ Code FE: Dựng UI Modal "Chọn mẫu hợp đồng" (Grid layout các thẻ card).
+ Code FE: Xử lý sự kiện click chọn Mẫu hợp đồng, đóng Modal và gán dữ liệu vào form Bước 1.
+ Code FE: Xử lý logic hiển thị thông báo lỗi khi người dùng cố gắng tạo hợp đồng với số hợp đồng đã tồn tại.

# Yêu cầu 4: Tạo Hợp đồng điện tử (Bước 2)
- UserStory
Là một Quản lý Nhân sự Tôi muốn xem trước nội dung file hợp đồng dưới dạng PDF Để đảm bảo các thông tin (từ mẫu hợp đồng hoặc file đính kèm ở Bước 1) đã chính xác trước khi thiết lập luồng trình ký.
- Acceptance Criteria(AC)
AC 1: Hiển thị trình xem PDF (PDF Viewer):
Giao diện hiển thị Stepper đang active ở Bước 2.
Ở vùng nội dung chính, hiển thị component đọc file PDF của hợp đồng đã được tạo/tải lên từ Bước 1.
Có thanh công cụ cơ bản cho PDF: Phóng to (+), Thu nhỏ (-) hiển thị % tỷ lệ, cuộn trang.
AC 2: Điều hướng:
Nút "Quay lại": Trở về Bước 1, giữ nguyên các dữ liệu đã nhập ở Bước 1.
Nút "Tiếp tục": Chuyển sang UI Bước 3.
AC 3: Xử lý ngoại lệ:
Nếu file lỗi hoặc không thể render, hiển thị thông báo lỗi rõ ràng ("Không thể tải tệp hợp đồng, vui lòng thử lại") và disable nút "Tiếp tục".

- Các task cần làm:
+ Code FE: Tích hợp thư viện đọc PDF (ví dụ: pdf.js hoặc react-pdf) vào Bước 2.
+ Code FE: Xử lý logic các nút Zoom In (+), Zoom Out (-) và hiển thị phần trăm (%).
+ Code FE: Xử lý state điều hướng (Quay lại Bước 1, Tiếp tục sang Bước 3).

# Yêu cầu 5: Tạo Hợp đồng điện tử (Bước 3)
- UserStory
Là một Quản lý Nhân sự Tôi muốn thiết lập danh sách những người tham gia, phân quyền vai trò và thứ tự ký của họ Để hệ thống có thể điều phối luồng trình ký đến đúng đối tượng với đúng phương thức xác thực.
- Acceptance Criteria(AC)
AC 1: Cấu hình Thứ tự ký:
Hiển thị Radio box chọn 1 trong 2: Tự do hoặc Theo thứ tự.
Nếu chọn Theo thứ tự: Hiển thị icon kéo thả (Drag & Drop) ở mỗi block người tham gia để người dùng có thể sắp xếp lại thứ tự trước sau.
AC 2: Form thông tin người tham gia (Block):
Mặc định có 1 block. Có nút "+ Thêm" để tạo thêm các block mới.
Mỗi block có Radio box chọn Đối tượng ký: Tổ chức của tôi hoặc Đối tác.
Nếu chọn Tổ chức của tôi: Hiển thị input "Nhân viên". Click vào sẽ mở Modal danh sách nhân viên nội bộ để chọn (tự động lấy Email của nhân viên đó để dùng ngầm bên dưới).
Nếu chọn Đối tác: Giao diện thay đổi, hiển thị 2 input nhập tay là "Tên" và "Email".
Cả 2 trường hợp đều có chung 2 Dropdown bắt buộc: Vai trò (Người ký, Người xem) và Ký / Xác thực (Chữ ký số, Ký ảnh (Xác thực OTP Email)).
AC 3: Thao tác và Validation:
Có thể xóa block (hiển thị icon xóa), nhưng phải giữ lại ít nhất 1 block.
Bắt buộc phải có ít nhất 1 người được gán vai trò là "Người ký".
Bắt buộc điền đủ các trường có dấu (*) và Email đối tác phải đúng định dạng trước khi bấm nút "Tiếp tục".
Bắt buộc nhân viên phải có thông tin CCCD, nếu không có hiển thị toast thông báo ”Nhân viên chưa có thông tin CCCD. Vui lòng bổ sung trong hồ sơ nhân viên.”, có nút chuyển hướng đến trang sửa thông tin CCCD của nhân viên đó.

- Các task cần làm:
+ Code FE: Xây dựng component danh sách block người ký có hỗ trợ Drag & Drop (khi bật chế độ Theo thứ tự).
+ Code FE: Xử lý state động (Dynamic Form): Ẩn/hiện input Nhân viên hoặc Tên + Email dựa trên loại Đối tượng ký.
+ Code FE: Xử lý logic validation form (định dạng email, bắt buộc có "Người ký", không bỏ trống field).
+ Code FE: Xử lý validation và điều hướng sang Bước 4.

# Yêu cầu 4: Tạo Hợp đồng điện tử (Bước 4)
- UserStory
Là một Quản lý Nhân sự Tôi muốn kéo thả các ô chữ ký vào đúng vị trí trên tài liệu PDF và gán nó cho người ký cụ thể Để khi đối tác hoặc nhân viên mở hợp đồng ra, họ biết chính xác chỗ cần ký.
- Acceptance Criteria(AC)
AC 1: Giao diện vùng làm việc (Canvas):
Hiển thị 3 cột: Cột trái chứa công cụ & thuộc tính, Cột giữa hiển thị file PDF, Cột phải là danh sách Thumbnail các trang để cuộn/nhảy trang nhanh.
AC 2: Thao tác Kéo thả & Gán thuộc tính:
Người dùng có thể kéo block "Chữ ký ảnh" từ cột trái thả vào vị trí bất kỳ trên mặt trang PDF ở cột giữa.
Khi click chọn 1 block chữ ký đã nằm trên PDF, cột bên trái hiển thị phần "Thuộc tính".
Tại phần Thuộc tính, có Dropdown "Người ký". Dropdown này xổ ra danh sách chỉ những người có vai trò "Người ký" đã được thiết lập ở Bước 3. Người dùng chọn tên để gán block chữ ký này thuộc về ai.
AC 3: Chỉnh sửa và Xóa:
Các block trên PDF có thể kéo để di chuyển lại tọa độ.
Có nút "Xóa" (xóa block đang được chọn) và "Xóa tất cả" (xóa mọi block trên mọi trang, cần popup xác nhận).
AC 4: Validation chuyển bước:
Tất cả những người có vai trò "Người ký" (từ Bước 3) ĐỀU PHẢI được gán vào ít nhất một vị trí ô chữ ký trên văn bản mới cho phép bấm "Tiếp tục".

- Các task cần làm:
+ Code FE: Tích hợp thư viện PDF Viewer hỗ trợ Canvas và render Thumbnail cột phải.
+ Code FE: Xử lý logic Drag & Drop block từ Toolbar vào vùng PDF và tính toán tọa độ (x, y, trang).
+ Code FE: Xử lý state hiển thị panel "Thuộc tính" khi select block trên PDF, lấy danh sách "Người ký" từ Bước 3 đổ vào Dropdown.
+ Code FE: Cài đặt chức năng Xóa 1 block và Xóa tất cả.
+ Code FE: Viết hàm validation kiểm tra xem tất cả Người ký đã được mapping với tọa độ chưa.

# Yêu cầu 5: Tạo Hợp đồng điện tử (Bước 5)
- UserStory
Là một Quản lý Nhân sự Tôi muốn xem lại bản tóm tắt toàn bộ cấu hình trước khi xác nhận Để đảm bảo không có sai sót nào trước khi chính thức phát hành hợp đồng đến các bên.
- Acceptance Criteria(AC)
AC 1: Hiển thị tóm tắt thông tin (Read-only):
Giao diện chỉ để xem, không cho chỉnh sửa trực tiếp tại bước này.
Hiển thị các trường Thông tin hợp đồng: Tên hợp đồng, Số hợp đồng, File hợp đồng (hiển thị tên file và icon PDF), Ngày hết hạn.
Hiển thị danh sách Người ký với các trường: Đối tượng ký, Nhân viên/Tên đối tác, Email, Vai trò, Ký/Xác thực.
AC 2: Thao tác hoàn thành:
Nút "Quay lại": Trở về Bước 4.
Nút "Hoàn thành":
Hiển thị trạng thái loading khi đang xử lý.
Gọi API lưu toàn bộ luồng. Nếu thành công: Đóng giao diện tạo, hiển thị Toast "Tạo và gửi hợp đồng thành công", chuyển hướng về trang Danh sách hợp đồng.

- Các task cần làm:
+ Code FE: Dựng UI trang tổng kết (form read-only).
+ Code FE: Lấy toàn bộ data từ state của Bước 1, 2, 3, 4 map vào UI của Bước 5.
+ Code FE: Xử lý sự kiện click "Hoàn thành", gom toàn bộ payload và gọi API Submit cuối cùng.
+ Code FE: Xử lý UI Loading, Toast message và điều hướng sau khi API trả về kết quả.

## Lư ý từ bước 2 cho đến bước 5, thì ở các bước đều phải có button "Quay lại" để quay về bước trước đó và button "Tiếp tục" để tiếp tục sang bước tiếp theo.