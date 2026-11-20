# 声景炼金术

> 状态：Private 开发仓

## 当前完成度

- V0.1 原始源码已迁入，V0.3 开发版已提交。尚未完成真实浏览器验收。
- **未经验收功能不得标记为已完成。**

## 目标 / 架构 / 运行方式

EchoAlchemy：本地实时声景视听实验。单文件 WebGL / Web Audio 原型，默认模拟声景。

运行：在仓库根目录执行 `python -m http.server 8000`，浏览器打开 `http://localhost:8000`。麦克风需要授权，远程部署需 HTTPS。

V0.2 开发改动：速度积分代替累计时间乘当前速度；着色器优先使用 highp。

验证：`node tests/travel.test.cjs`，覆盖 JS 语法、30/60/120 Hz 固定步长、零步长及速度阶跃。上述等价测试在 Node 22 本地通过；未验证 GPU 编译、实际帧率、真实麦克风、心理健康效果。

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

## V0.3：自适应声学前端

- 麦克风 RMS 动态估计底噪，1 秒初始化；不对原始音频进行上传。
- 使用相对增量、快速包络、滞回和 220 ms 不应期检测突发事件；FFT 中高频仍保留原映射。
- 合成特征验证：3 个帧率 × 3 个底噪 × 5 个随机种子，180/180 检出，0 误触发、0 漏检，最大采样检测延迟 22.33 ms；底噪台阶仅触发一次。
- 复现：`node tests/acoustics.test.cjs`。同一算法及基准已在 JavaScript 环境运行，远端测试文件逐字核验；尚未执行远端 Node 脚本本身和真实浏览器麦克风验收。
- 局限：以 RMS 为主，可能漏掉等能量音色变化、短于分析窗口的事件；持续声音突然升高可产生一次误触发。未做旧算法对照及真实录音验证，不能推断实际准确率或心理健康收益。
