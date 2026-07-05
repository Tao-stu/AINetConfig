# AI驱动网络运维智能配置故障诊断平台

## 技术栈
- Vue 3 + Vite + TypeScript
- Element Plus (UI框架)
- AntV G6 (拓扑可视化)
- ECharts (数据图表)
- Monaco Editor (配置编辑与对比)
- Pinia (状态管理)
- Vue Router (路由)

## 启动方式

```bash
npm install
npm run dev
```

开发服务器将在 http://localhost:3000 启动。

## 演示账号

| 角色 | 用户名 | 密码 | 权限 |
|------|--------|------|------|
| 管理员 | admin | admin123 | 全部功能 |
| 运维工程师 | operator | oper123 | 拓扑/配置/诊断/看板/告警 |
| 只读用户 | viewer | view123 | 拓扑/看板/告警 |

## 功能模块

### 网络拓扑 (/topology)
- 基于 AntV G6 的网络设备拓扑图
- 故障节点自动高亮闪烁动画
- 设备状态颜色编码: 墨绿(正常) / 砖红(故障) / 土黄(待诊断)
- 拓扑图缩放、拖拽、自适应

### 配置管理 (/config)
- 基于 Monaco Editor 的设备配置文本查看
- 双版本配置文件差异对比
- 差异行数统计(新增/删除/修改)
- 配置导出下载

### AI故障诊断 (/diagnosis)
- 故障诊断任务管理(创建/执行/查看)
- AI流式诊断结果输出(模拟SSE)
- 诊断报告导出
- 置信度评分展示

### 数据看板 (/dashboard)
- 月度故障趋势柱状图
- 设备类型分布饼图
- 故障Top5设备横向柱状图
- 告警级别折线图
- 统计报表导出

### 告警管理 (/alarms)
- 告警列表(筛选/搜索/分页)
- 告警确认/解决/批量操作
- 告警级别: 严重(砖红) / 告警(土黄) / 信息(灰)
- CSV批量导出

### 配置下发 (/deploy)
- 下发任务管理(创建/执行/回滚)
- 支持增量/全量/回滚三种下发类型
- 部署步骤可视化(Steps组件)
- 管理员权限路由控制

## 项目结构

```
src/
  components/    # AppLayout.vue
  router/        # index.ts (路由+权限守卫)
  stores/        # auth.ts (Pinia状态)
  styles/        # variables.css + global.css
  utils/         # mock-data.ts + mock-stream.ts
  views/         # 6个主要页面
```
