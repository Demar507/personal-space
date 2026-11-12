# Vertex 网站文件说明

Vertex 的线上版本使用 Netlify Functions 和 Netlify Blobs 保存个人动态，本地 HTML 版本可离线编辑。

## 首次启用云端动态

1. 将整个项目提交到 Git 仓库，并让 Netlify 从该仓库部署。项目根目录中的 `netlify.toml` 已配置构建命令 `npm run build`、发布目录 `dist` 和 Functions 目录 `netlify/functions`。只上传静态文件无法部署发布接口。
2. 在 Netlify 项目的 **Environment variables** 中添加 `VERTEX_ADMIN_PASSWORD`。使用密码管理器生成的长随机密码，供生产环境的 Functions 运行时读取。密码只填写在 Netlify 控制台。
3. 触发一次部署。打开线上网站，点击页脚的「管理员登录」，在「动态」页写文字、添加配图并点击「发布动态」。访客刷新即可看到。发布、编辑和删除动态都无需重新部署。

动态文字和图片存入站点级 `vertex-moments` Blobs 存储。每条动态最多 3 张图，每张最多 2 MB。删除动态会移除列表记录，已上传的图片按内容去重保留。管理员登录有效期为 8 小时，可从页脚退出。更改密码并重新部署会使原有登录失效。

直接打开源目录的 HTML 或使用静态预览时，使用原来的文件保存方式。旧 HTML 和浏览器中已有的私人记录不会自动公开，需要公开的旧记录可登录后重新发布。云端发布目前适用于个人动态，作品和主页资料仍通过 HTML 文件更新。

本地验证可运行 `npm ci`、`npm test` 和 `npm run build`。若需预览完整登录与发布流程，在本地未提交的 `.env` 中配置测试用 `VERTEX_ADMIN_PASSWORD`，构建后使用 Netlify CLI 运行 `netlify dev`。

## 修改内容

- `index.html`：页面结构和大部分文字。搜索页面上看到的文字即可找到对应位置。
- `index.html` 中的 `site-content`：个人资料、作品和动态的数据。修改简介时，搜索 `"bio"` 并修改其后的文字；页面上带 `data-bio` 的位置由这份资料自动填充。离线编辑功能也会更新这部分数据。线上动态从云端读取。
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
