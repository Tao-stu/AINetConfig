export interface StreamMessage {
  type: 'thinking' | 'analysis' | 'conclusion' | 'suggestion' | 'error' | 'complete'
  content: string
}

const diagnosisSteps: StreamMessage[] = [
  { type: 'thinking', content: '正在加载设备运行数据...\n' },
  { type: 'analysis', content: '数据加载完成，开始分析设备日志...\n' },
  { type: 'thinking', content: '提取最近24小时日志，共38,742条记录...\n' },
  { type: 'analysis', content: '发现异常模式: 端口Gi0/0/24的CRC错误计数在最近2小时内增长异常\n' },
  { type: 'thinking', content: '分析相邻设备状态...\n' },
  { type: 'analysis', content: '对端设备MAC地址变化频率: 5分钟内3次变化\n' },
  { type: 'thinking', content: '匹配知识库中的故障模式...\n' },
  { type: 'analysis', content: '匹配到故障模式 FP-0231: "终端网卡故障导致的端口震荡"\n' },
  { type: 'thinking', content: '关联分析历史相似案例...\n' },
  { type: 'analysis', content: '找到3个相似历史案例，成功率85.7%\n' },
  { type: 'thinking', content: '生成诊断报告...\n' },
  { type: 'conclusion', content: '\n===== 诊断结论 =====\n故障类型: 端口频繁Up/Down震荡\n根因: 端口Gi0/0/24连接的终端设备网卡硬件故障，MAC地址不稳定触发端口安全策略\n置信度: 92%\n\n===== 详细分析 =====\n1. 端口Gi0/0/24在5分钟内经历了12次Up/Down状态变化\n2. 对端设备MAC地址在以下值之间反复切换:\n   - a4:83:e7:12:34:01 (出现7次)\n   - a4:83:e7:12:34:02 (出现5次)\n3. 当前端口安全配置: max-mac-num=1, violation=shutdown\n4. 每次MAC变化都会触发端口安全策略导致端口shutdown\n\n' },
  { type: 'suggestion', content: '===== 处理建议 =====\n[紧急] 排查终端设备网卡硬件状态，更换故障网卡\n[临时] 将端口安全策略max-mac-num调整为2:\n  interface Gi0/0/24\n  port-security max-mac-num 2\n[验证] 待终端稳定后恢复max-mac-num为1\n[监控] 设置端口CRC错误监控阈值告警\n\n===== 风险评估 =====\n当前影响: 该端口下联终端网络中断\n扩散风险: 低（仅影响单端口）\n建议处理时限: 2小时内\n' },
  { type: 'complete', content: '' },
]

export function simulateStreamDiagnosis(
  taskId: string,
  deviceName: string,
  onMessage: (msg: StreamMessage) => void,
  onComplete: () => void,
  onError: (err: string) => void,
  signal?: AbortSignal
): void {
  let index = 0
  const delays = [600, 800, 1200, 900, 1500, 1000, 800, 900, 1100, 1500, 2000, 500]

  function sendNext() {
    if (signal?.aborted) {
      onComplete()
      return
    }

    if (index >= diagnosisSteps.length) {
      onComplete()
      return
    }

    const msg = diagnosisSteps[index]
    onMessage(msg)

    index++
    if (index < diagnosisSteps.length) {
      setTimeout(sendNext, delays[index] || 800)
    } else {
      setTimeout(onComplete, 300)
    }
  }

  setTimeout(sendNext, 500)
}
