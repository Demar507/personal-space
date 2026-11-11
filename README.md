# Vertex 网站文件说明

这是一个无需构建工具的静态网站。发布时请保留整个文件夹的结构，把 `index.html`、`css`、`js`、`assets` 和 `logo` 一起提交或上传到 Netlify。

## 修改内容

- `index.html`：页面结构和大部分文字。搜索页面上看到的文字即可找到对应位置。
- `index.html` 中的 `site-content`：个人资料、作品和动态的数据。修改简介时，搜索 `"bio"` 并修改其后的文字；页面上带 `data-bio` 的位置由这份资料自动填充。网站内的编辑功能也会更新这部分数据。
- `css/`：网站样式。`base.css` 是基础样式，`theme.css` 是深色主题和首页视觉，`refinements.css` 和 `motion.css` 控制细节与动效；其他文件提供布局和比赛显示样式。后加载的样式会覆盖前面的样式。
- `js/app.js`：页面交互、编辑功能和赛程逻辑。
- `js/schedule-data.js`：离线使用的赛程快照。
- `assets/images/`：首页星星背景和马刺图片。
- `assets/teams/`：赛程中使用的球队标识。
- `assets/fonts/`：网站字体。
- `logo/vertex-logo.svg`：网站 Logo 和浏览器标签图标。

## 发布和编辑提醒

推送到 Git 仓库后，等待 Netlify 部署完成。修改 `site-content` 数据时，已访问过网站的浏览器可能继续读取同一版本的本地缓存。更新该数据标签上的 `data-revision`（例如换成一个新的唯一字符串）可以让浏览器使用新文件，但旧版本中仅保存在浏览器、尚未写入网页文件的编辑内容可能不再显示；操作前请先保存这些内容。

网页内“下载 HTML 副本”只下载 HTML 文件。使用副本时，应把它放回网站文件夹，与 `css`、`js`、`assets`、`logo` 文件夹 保持相同的相对位置；不要单独上传这个 HTML。网页上传的个人头像及作品图片仍保存在 `site-content` 中，以兼容现有的网页编辑功能。

本地预览可在此文件夹运行 `python -m http.server 8000`，然后在浏览器打开 http://localhost:8000/。
