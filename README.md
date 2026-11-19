# 声景炼金术

> 状态：Private 开发仓

## 当前完成度

- 记录进度：待迁入源码 / 版本包后核定
- **未经验收功能不得标记为已完成。**

## 目标 / 架构 / 运行方式

（待补全。）

## 工程约定

1. 一项目一仓库 · 开发期 Private
2. 保留本地 Git 历史与 tags
3. 版本附测试报告与变更记录（docs/）

## 迁移

若本地已有完整历史：

```bash
cd <本地目录>
git remote add origin https://github.com/tortletortle/sound-alchemy.git
git push -u origin --all
git push origin --tags
```

不要用骨架 force push 覆盖已有历史。
