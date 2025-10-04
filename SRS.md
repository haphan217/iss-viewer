1. Mô tả ứng dụng
Application có 2 modes:
Explore mode
User nhìn hình ảnh trái đất cùng với tàu ISS 3D từ bên ngoài không gian.
User được xoay trái đất 3D để nhìn. 
User được chọn hình ảnh trái đất qua các năm từ 2020 đến 2025.
Trong mỗi năm, app cung cấp thông tin về các sự kiện xảy ra trong năm.
User có thể xem chi tiết thông tin các sự kiện bằng 2 cách:
Bấm vào một sự kiện cụ thể được pin trên trái đất
Bấm vào sự kiện trong menu hiện thị trên màn hình
Thông tin về sự kiện bao gồm:
Các hình ảnh
Highlight facts
Mission mode
User ở trong không gian của tàu ISS
User được trải nghiệm cảm giác không trọng lực
User được tham gia mini-game chụp hình sự kiện trái đất thông qua cửa sổ ở Cupola
Capture mini-game
App mô phỏng view trái đất từ Cupola. Tập trung mô phỏng tốc độ di chuyển của ISS quay trái đất (90p/một vòng)
Gameflow:
Người chơi chọn mission (chụp thành phố về đêm, chụp núi lửa, vân vân)
Người chơi trải nghiệm view từ Cupola
App hiển thị sự kiện cần chụp trên trái đất trong trạng thái xoay vòng
Người chơi bắt sự kiện
App hiển thị kết quả (Thành công / Thất bại)
Thành công -> Cung cấp thông tin về sự kiện
Thất bại -> Thử lại / Từ bỏ
Thông tin về sự kiện bao gồm:
Các hình ảnh
Highlight facts
2. Công việc
Explore mode
Tìm thông tin. Ưu tiên tìm của năm gần đây, ưu tiên nguồn của NASA. Chỉ cần tìm tầm 5 năm để demo. (Bình)
Tìm hình ảnh trái đất qua các năm 2020-2025. Hình earth texture map, earth full map.
Tìm 3-5 sự kiện cho mỗi năm. Cho mỗi 
Code
UI cho user nhìn trái đất, hiển thị trái đất với các sự kiện, khi user bấm vào sự kiện bất kỳ trên trái đất / user bấm 1 sự kiện bất kỳ trong menu  -> app xoay trái đất và zoom vào đúng vị trí của sự kiện đó (Na)
UI cho menu sự kiện, user có thể bấm vào 1 sự kiện -> app xoay trái đất và zoom vào đúng vị trí của sự kiện đó -> app hiển thị trang thông tin sự kiện (Na)
UI trang thông tin sự kiện (Minh)
Ghép các UI với nhau (Na)
Mission mode
Tìm thông tin (Huy)
Tìm thông tin 3 sự kiện cho 3 missions. Cho mỗi sự kiện, tìm hình ảnh và thông tin hay về sự kiện đó 
Code (Hưng + Hà)
UI không gian trong khoang tàu + Trải nghiệm không trọng lực (Hà)
UI Game (Hưng)
UI để bắt đầu trò chơi, hướng dẫn chơi và user có thể chọn mission
UI hiển thị trái đất xoay qua lăng kính cupola
UI cho bảng điều khiển để người chơi có thể bấm nút chụp hình
UI hiển thị kết quả game (thành công / thất bại)
Ghép các UI với nhau (Hà)

