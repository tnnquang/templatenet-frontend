# Template.net test coding Frontend

Đây là project frontend React + TypeScript + Vite cho một text editor dạng canvas (thêm/sửa text, drag thả, zoom, undo/redo, lock/unlock, gắn link).

## 1) Yêu cầu

- Node.js: v24+
- Yarn classic: v1.x

## 2) Cài đặt và khởi chạy

### Cài dependencies

```bash
yarn install
```

### Chạy môi trường dev

```bash
yarn dev
```

### Build
```bash
yarn build
```

### Preview bản build

```bash
yarn preview
```

### Lint code

```bash
yarn lint
```

### Fix khi chạy lint có lỗi

```bash
yarn lint:fix
```

### Format code

```bash
yarn format
```

### Type check

```bash
yarn typecheck
```

## 3) Scripts hiện có

Khai báo tại `package.json`:

- `dev`: chạy Vite dev server
- `build`: `tsc -b && vite build`
- `preview`: chạy server preview cho bản build
- `lint`: chạy ESLint toàn bộ project
- `lint:fix`: chạy ESLint và tự fix
- `format`: chạy Prettier toàn bộ project
- `typecheck`: kiểm tra type TypeScript (`tsc --noEmit --pretty`)
- `prepare`: cài git hooks (Husky)

## 4) Tổng quan kiến trúc đã làm

### Luồng khởi tạo app

- Entry point: `src/main.tsx`
- App được bọc `Provider` của Redux để toàn bộ component truy cập cùng 1 store
- Ở `src/App.tsx` tạo sẵn một text element ban đầu bằng `seedElement(createTextElement())`
- Có guard bằng `useRef` trong `App` để tránh seed 2 lần khi React StrictMode double invoke ở dev

### Canvas editor

- `src/components/Canvas/CanvasViewport.tsx`:
  - Quản lý zoom (`Ctrl/Cmd + wheel`, nút zoom, fit screen)
  - Tính toán scale và căn giữa canvas
  - Cung cấp `zoom` qua `ViewportContext`
- `src/components/Canvas/Canvas.tsx`:
  - Render danh sách phần tử trên canvas
  - Click nền để bỏ chọn element
  - Bắt phím tắt undo/redo (`Ctrl/Cmd+Z`, `Ctrl/Cmd+Y`, `Shift+Ctrl/Cmd+Z`)
- `src/components/elements/TextElement.tsx`:
  - Render text element
  - Double click để vào edit mode
  - Hiển thị outline, resize handles, link preview, context toolbar

## 5) Cấu hình và sử dụng Redux store

### Mục đích

Dùng để lưu giữ state editor tập trung: element data, selection/editing state, và lịch sử undo/redo.

### File chính

- Store root: `src/store/store.ts`
- Canvas slice: `src/store/slices/canvasSlice.ts`
- UI slice: `src/store/slices/uiSlice.ts`
- Selectors: `src/store/selectors.ts`
- Typed hooks: `src/store/hooks.ts`

### Cách chức năng Undo/redo hoạt động

- `canvasSlice` dùng `history.past` và `history.future`
- Trước các mutation chính (`addElement`, `updateElement`, `commitPosition`, `removeElement`, `duplicateElement`) sẽ gọi `pushHistory`
- Giới hạn số snapshot lịch sử được giữ bởi `HISTORY_LIMIT` ở `src/configs/constants.ts`
- Hiện tại giới hạn là `50`
- `undo` lấy snapshot cuối trong `past` để rollback
- `redo` lấy snapshot đầu trong `future` để đi tới

### Dùng `commitPosition` trong quá trình drag/drop element

Trong lúc kéo thả, app không dispatch liên tục để tránh render dày.
Chỉ khi thả chuột mới dispatch một lần `commitPosition` để ghi nhận trạng thái cuối và push vào history.

## 6) Cách chức năng Drag/drop element xử lý

Logic chính: `src/hooks/useDrag.ts`.

Luồng chi tiết:

1. `onMouseDown`:
   - Chỉ nhận chuột trái
   - Luôn select element trước
   - Nếu element đang lock thì dừng tại đây (chỉ cho chọn, không kéo)
2. Trong lúc kéo (`mousemove`):
   - Tính delta chuột theo màn hình
   - Chia cho `zoom` hiện tại để quy đổi sang canvas-space
   - Gán thẳng `transform` vào DOM để kéo mượt, không cần dispatch Redux liên tục
3. Khi thả (`mouseup`):
   - Nếu vị trí có thay đổi thì dispatch `commitPosition` đúng 1 lần
   - Cleanup listeners

Điểm quan trọng: drag được scale-correct theo zoom nên cảm giác kéo ổn định ở mọi mức zoom.

## 7) Các thư viện đã cài và đang dùng

### Runtime dependencies

| Thư viện | Dùng để làm gì | Vị trí dùng tiêu biểu |
| --- | --- | --- |
| react, react-dom | Nền tảng UI | `src/main.tsx`, toàn bộ component |
| @reduxjs/toolkit | Tạo store, slice, reducer theo chuẩn RTK | `src/store/store.ts`, `src/store/slices/canvasSlice.ts`, `src/store/slices/uiSlice.ts` |
| react-redux | Bridge React <-> Redux (`Provider`, hooks) | `src/main.tsx`, `src/store/hooks.ts` |
| animejs | Hiệu ứng fade/animation cho UI | `src/hooks/useAnime.ts`, `src/components/toolbars/FontSelect.tsx` |
| tailwindcss | Utility-first CSS | `src/index.css` |
| @tailwindcss/vite | Tích hợp Tailwind vào Vite plugin chain | `vite.config.ts` |
| @tailwindcss/postcss, postcss | Xử lý PostCSS cho Tailwind | `postcss.config.mjs` |

## 8) Cấu trúc thư mục quan trọng

- `src/components`: UI components (Canvas, TextElement, toolbars)
- `src/hooks`: custom hooks (`useDrag`, `useAnime`)
- `src/store`: Redux store/slices/selectors/hooks
- `src/models`: kiểu dữ liệu element
- `src/configs`: constants, cấu hình dùng chung
- `src/contexts`: context cho viewport zoom
- `public/fonts/cuprum`: tài nguyên font

## 9) Lưu ý

- Project đang dùng alias `@` trỏ về `src` (khai báo ở `vite.config.ts`).
- Trước khi push nên chạy tối thiểu:

```bash
yarn lint
yarn typecheck
```

- Nếu cần build local để test bản production:

```bash
yarn build
yarn preview
```
