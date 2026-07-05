export interface TopologyNode {
  id: string
  label: string
  type: 'router' | 'switch' | 'firewall' | 'server' | 'core'
  status: 'normal' | 'warning' | 'critical' | 'pending'
  ip: string
  vendor: string
  model: string
  x?: number
  y?: number
}

export interface TopologyEdge {
  id: string
  source: string
  target: string
  label: string
  bandwidth: string
  status: 'up' | 'down' | 'degraded'
}

export interface AlarmRecord {
  id: string
  time: string
  level: 'critical' | 'warning' | 'info'
  device: string
  deviceIp: string
  type: string
  message: string
  status: 'active' | 'acknowledged' | 'resolved'
  ackBy?: string
  ackTime?: string
}

export interface DiagnosisTask {
  id: string
  device: string
  deviceIp: string
  issue: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  result?: string
  createTime: string
  completeTime?: string
  confidence?: number
}

export interface DeviceConfig {
  id: string
  deviceName: string
  deviceIp: string
  type: string
  vendor: string
  content: string
  lastModified: string
  version: string
}

export interface DeployTask {
  id: string
  name: string
  targetDevices: string[]
  configContent: string
  type: 'full' | 'incremental' | 'rollback'
  status: 'draft' | 'pending' | 'running' | 'completed' | 'failed' | 'rolled_back'
  createTime: string
  executeTime?: string
  result?: string
  operator: string
}

export function getMockTopologyNodes(): TopologyNode[] {
  return [
    { id: 'core-01', label: 'Core-SW-01', type: 'core', status: 'normal', ip: '10.0.1.1', vendor: 'Huawei', model: 'CE12800', x: 500, y: 100 },
    { id: 'core-02', label: 'Core-SW-02', type: 'core', status: 'normal', ip: '10.0.1.2', vendor: 'Huawei', model: 'CE12800', x: 700, y: 100 },
    { id: 'rt-01', label: 'Router-GW-01', type: 'router', status: 'normal', ip: '10.0.0.1', vendor: 'Huawei', model: 'NE40E', x: 600, y: 30 },
    { id: 'rt-02', label: 'Router-GW-02', type: 'router', status: 'warning', ip: '10.0.0.2', vendor: 'Huawei', model: 'NE40E', x: 400, y: 30 },
    { id: 'sw-01', label: 'Agg-SW-01', type: 'switch', status: 'critical', ip: '10.0.2.1', vendor: 'H3C', model: 'S10500', x: 300, y: 220 },
    { id: 'sw-02', label: 'Agg-SW-02', type: 'switch', status: 'normal', ip: '10.0.2.2', vendor: 'H3C', model: 'S10500', x: 900, y: 220 },
    { id: 'sw-03', label: 'Agg-SW-03', type: 'switch', status: 'normal', ip: '10.0.2.3', vendor: 'H3C', model: 'S7600', x: 600, y: 220 },
    { id: 'sw-04', label: 'Acc-SW-04', type: 'switch', status: 'pending', ip: '10.0.3.1', vendor: 'Ruijie', model: 'RG-S8600', x: 150, y: 360 },
    { id: 'sw-05', label: 'Acc-SW-05', type: 'switch', status: 'normal', ip: '10.0.3.2', vendor: 'Ruijie', model: 'RG-S8600', x: 450, y: 360 },
    { id: 'sw-06', label: 'Acc-SW-06', type: 'switch', status: 'normal', ip: '10.0.3.3', vendor: 'Ruijie', model: 'RG-S8600', x: 750, y: 360 },
    { id: 'sw-07', label: 'Acc-SW-07', type: 'switch', status: 'warning', ip: '10.0.3.4', vendor: 'Ruijie', model: 'RG-S8600', x: 1050, y: 360 },
    { id: 'fw-01', label: 'FW-01', type: 'firewall', status: 'normal', ip: '10.0.0.10', vendor: 'Hillstone', model: 'SG-6000', x: 200, y: 135 },
    { id: 'fw-02', label: 'FW-02', type: 'firewall', status: 'critical', ip: '10.0.0.11', vendor: 'Hillstone', model: 'SG-6000', x: 1000, y: 135 },
    { id: 'srv-01', label: 'AAA-Server', type: 'server', status: 'normal', ip: '10.0.10.1', vendor: 'Dell', model: 'PowerEdge R750', x: 400, y: 480 },
    { id: 'srv-02', label: 'Log-Server', type: 'server', status: 'normal', ip: '10.0.10.2', vendor: 'Dell', model: 'PowerEdge R750', x: 600, y: 480 },
    { id: 'srv-03', label: 'NMS-Server', type: 'server', status: 'warning', ip: '10.0.10.3', vendor: 'Dell', model: 'PowerEdge R750', x: 800, y: 480 },
  ]
}

export function getMockTopologyEdges(): TopologyEdge[] {
  return [
    { id: 'e1', source: 'rt-01', target: 'core-01', label: '10GE', bandwidth: '10Gbps', status: 'up' },
    { id: 'e2', source: 'rt-02', target: 'core-01', label: '10GE', bandwidth: '10Gbps', status: 'up' },
    { id: 'e3', source: 'rt-01', target: 'core-02', label: '10GE', bandwidth: '10Gbps', status: 'up' },
    { id: 'e4', source: 'rt-02', target: 'core-02', label: '10GE', bandwidth: '10Gbps', status: 'degraded' },
    { id: 'e5', source: 'core-01', target: 'fw-01', label: '10GE', bandwidth: '10Gbps', status: 'up' },
    { id: 'e6', source: 'core-02', target: 'fw-02', label: '10GE', bandwidth: '10Gbps', status: 'down' },
    { id: 'e7', source: 'core-01', target: 'sw-01', label: '40GE', bandwidth: '40Gbps', status: 'up' },
    { id: 'e8', source: 'core-02', target: 'sw-02', label: '40GE', bandwidth: '40Gbps', status: 'up' },
    { id: 'e9', source: 'sw-01', target: 'sw-03', label: '10GE', bandwidth: '10Gbps', status: 'up' },
    { id: 'e10', source: 'sw-02', target: 'sw-03', label: '10GE', bandwidth: '10Gbps', status: 'up' },
    { id: 'e11', source: 'sw-01', target: 'sw-04', label: '1GE', bandwidth: '1Gbps', status: 'up' },
    { id: 'e12', source: 'sw-01', target: 'sw-05', label: '1GE', bandwidth: '1Gbps', status: 'up' },
    { id: 'e13', source: 'sw-02', target: 'sw-06', label: '1GE', bandwidth: '1Gbps', status: 'up' },
    { id: 'e14', source: 'sw-02', target: 'sw-07', label: '1GE', bandwidth: '1Gbps', status: 'degraded' },
    { id: 'e15', source: 'sw-05', target: 'srv-01', label: '10GE', bandwidth: '10Gbps', status: 'up' },
    { id: 'e16', source: 'sw-03', target: 'srv-02', label: '10GE', bandwidth: '10Gbps', status: 'up' },
    { id: 'e17', source: 'sw-06', target: 'srv-03', label: '10GE', bandwidth: '10Gbps', status: 'degraded' },
  ]
}

export function getMockAlarms(): AlarmRecord[] {
  return [
    { id: 'ALM-001', time: '2025-07-05 13:30:15', level: 'critical', device: 'Agg-SW-01', deviceIp: '10.0.2.1', type: '端口Down', message: 'GigabitEthernet0/0/24端口物理链路断开', status: 'active' },
    { id: 'ALM-002', time: '2025-07-05 13:25:00', level: 'critical', device: 'FW-02', deviceIp: '10.0.0.11', type: 'HA切换', message: '防火墙HA主备切换，备墙已接管业务', status: 'active' },
    { id: 'ALM-003', time: '2025-07-05 13:20:30', level: 'warning', device: 'Router-GW-02', deviceIp: '10.0.0.2', type: 'CPU告警', message: 'CPU使用率超过85%，当前值87.3%', status: 'acknowledged', ackBy: 'admin', ackTime: '2025-07-05 13:28:00' },
    { id: 'ALM-004', time: '2025-07-05 13:15:00', level: 'warning', device: 'Acc-SW-07', deviceIp: '10.0.3.4', type: '内存告警', message: '内存使用率超过80%，当前值82.1%', status: 'active' },
    { id: 'ALM-005', time: '2025-07-05 13:10:00', level: 'warning', device: 'NMS-Server', deviceIp: '10.0.10.3', type: '磁盘告警', message: '/var分区使用率超过85%，当前值88.5%', status: 'acknowledged', ackBy: 'operator', ackTime: '2025-07-05 13:22:00' },
    { id: 'ALM-006', time: '2025-07-05 12:45:00', level: 'info', device: 'Core-SW-01', deviceIp: '10.0.1.1', type: 'OSPF邻居变化', message: 'OSPF邻居10.0.0.2状态从Full变为Down', status: 'resolved' },
    { id: 'ALM-007', time: '2025-07-05 12:30:00', level: 'info', device: 'Core-SW-02', deviceIp: '10.0.1.2', type: '配置变更', message: '检测到VLAN 200配置变更，已自动备份', status: 'resolved' },
    { id: 'ALM-008', time: '2025-07-05 12:00:00', level: 'critical', device: 'FW-01', deviceIp: '10.0.0.10', type: '攻击告警', message: '检测到DDoS攻击，源IP: 203.0.113.50，流量峰值8.5Gbps', status: 'resolved' },
    { id: 'ALM-009', time: '2025-07-05 11:30:00', level: 'warning', device: 'Core-SW-01', deviceIp: '10.0.1.1', type: '温度告警', message: '设备温度超过65度，当前温度68度', status: 'acknowledged', ackBy: 'operator', ackTime: '2025-07-05 11:45:00' },
    { id: 'ALM-010', time: '2025-07-05 11:00:00', level: 'info', device: 'Agg-SW-03', deviceIp: '10.0.2.3', type: 'STP拓扑变化', message: '生成树拓扑发生变化，新根桥: Core-SW-01', status: 'resolved' },
    { id: 'ALM-011', time: '2025-07-05 10:15:00', level: 'warning', device: 'Router-GW-01', deviceIp: '10.0.0.1', type: 'BGP会话', message: 'BGP邻居203.0.113.1会话震荡，3次flap/5min', status: 'active' },
    { id: 'ALM-012', time: '2025-07-05 09:45:00', level: 'critical', device: 'Acc-SW-04', deviceIp: '10.0.3.1', type: '电源故障', message: '电源模块PWR-2故障，设备单电源运行', status: 'active' },
  ]
}

export function getMockDiagnosisTasks(): DiagnosisTask[] {
  return [
    {
      id: 'DX-001', device: 'Agg-SW-01', deviceIp: '10.0.2.1',
      issue: '端口频繁Down/Up震荡', status: 'completed',
      result: '诊断结论: 端口Gi0/0/24连接的终端设备网卡故障，MAC地址频繁变化导致端口安全策略触发。\n\n详细分析:\n1. 通过日志分析发现端口在5分钟内Up/Down 12次\n2. 对端设备MAC地址从a4:83:e7:xx:xx:01变为a4:83:e7:xx:xx:02，再变回原值\n3. 端口安全策略配置最大MAC数为1，违规动作为shutdown\n\n建议措施:\n- 优先排查对端终端设备网卡硬件状态\n- 暂时将端口安全最大MAC数调整为2作为临时方案\n- 确认终端稳定后恢复原配置',
      createTime: '2025-07-05 13:30:00', completeTime: '2025-07-05 13:32:15', confidence: 92
    },
    {
      id: 'DX-002', device: 'FW-02', deviceIp: '10.0.0.11',
      issue: 'HA主备切换原因分析', status: 'completed',
      result: '诊断结论: 防火墙HA切换由心跳链路抖动触发。\n\n详细分析:\n1. 13:24:58 主墙心跳接口eth1/2出现CRC错误\n2. 13:24:59 心跳超时，备墙抢占Active角色\n3. 13:25:00 主墙检测到心跳恢复但已错过抢占窗口\n\n建议措施:\n- 检查HA心跳链路物理连接\n- 更换心跳线缆或切换至备用心跳接口\n- 调整HA抢占延迟时间为30秒以避免瞬时抖动触发切换',
      createTime: '2025-07-05 13:26:00', completeTime: '2025-07-05 13:27:30', confidence: 88
    },
    {
      id: 'DX-003', device: 'Router-GW-02', deviceIp: '10.0.0.2',
      issue: 'CPU使用率持续偏高', status: 'running',
      createTime: '2025-07-05 13:35:00',
    },
    {
      id: 'DX-004', device: 'Acc-SW-04', deviceIp: '10.0.3.1',
      issue: '设备单电源运行风险分析', status: 'pending',
      createTime: '2025-07-05 13:40:00',
    },
    {
      id: 'DX-005', device: 'NMS-Server', deviceIp: '10.0.10.3',
      issue: '磁盘空间告警根因分析', status: 'pending',
      createTime: '2025-07-05 13:42:00',
    },
  ]
}

export function getMockDeviceConfigs(): DeviceConfig[] {
  return [
    {
      id: 'cfg-01', deviceName: 'Core-SW-01', deviceIp: '10.0.1.1', type: 'switch', vendor: 'Huawei',
      content: `# Core-SW-01 Configuration
sysname Core-SW-01
#
vlan batch 100 200 300 400 500
#
stp mode mstp
stp region-configuration
 region-name CORE-REGION
 revision-level 1
 instance 1 vlan 100 200
 instance 2 vlan 300 400
 active region-configuration
#
stp instance 0 root primary
stp instance 1 root primary
#
interface Vlanif100
 ip address 10.0.1.1 255.255.255.0
#
interface Vlanif200
 ip address 10.0.2.1 255.255.255.0
#
interface GigabitEthernet0/0/1
 description TO-Router-GW-01
 port link-type trunk
 port trunk allow-pass vlan 100 200 300
#
interface GigabitEthernet0/0/2
 description TO-Router-GW-02
 port link-type trunk
 port trunk allow-pass vlan 100 200 300
#
interface GigabitEthernet0/0/3
 description TO-FW-01
 port link-type trunk
 port trunk allow-pass vlan 100
#
interface GigabitEthernet0/0/4
 description TO-Agg-SW-01
 port link-type trunk
 port trunk allow-pass vlan 100 200 300 400
 port-isolate enable group 1
#
ospf 1 router-id 10.0.1.1
 area 0.0.0.0
  network 10.0.1.0 0.0.0.255
  network 10.0.2.0 0.0.0.255
#
snmp-agent
snmp-agent local-engineid 800007DB03AABBCCDDEEFF
snmp-agent community read public123
snmp-agent sys-info version v2c v3
#
ntp-service server 10.0.10.2 source-interface Vlanif100
#
return`,
      lastModified: '2025-07-04 18:00:00', version: 'v2.3.1'
    },
    {
      id: 'cfg-02', deviceName: 'Core-SW-01', deviceIp: '10.0.1.1', type: 'switch', vendor: 'Huawei',
      content: `# Core-SW-01 Configuration (Running Config)
sysname Core-SW-01
#
vlan batch 100 200 300 400 500 600
#
stp mode mstp
stp region-configuration
 region-name CORE-REGION
 revision-level 1
 instance 1 vlan 100 200
 instance 2 vlan 300 400
 instance 3 vlan 500 600
 active region-configuration
#
stp instance 0 root primary
stp instance 1 root primary
stp instance 3 root secondary
#
interface Vlanif100
 ip address 10.0.1.1 255.255.255.0
#
interface Vlanif200
 ip address 10.0.2.1 255.255.255.0
#
interface Vlanif600
 ip address 10.0.6.1 255.255.255.0
#
interface GigabitEthernet0/0/1
 description TO-Router-GW-01
 port link-type trunk
 port trunk allow-pass vlan 100 200 300 600
#
interface GigabitEthernet0/0/2
 description TO-Router-GW-02
 port link-type trunk
 port trunk allow-pass vlan 100 200 300 600
#
interface GigabitEthernet0/0/3
 description TO-FW-01
 port link-type trunk
 port trunk allow-pass vlan 100
#
interface GigabitEthernet0/0/4
 description TO-Agg-SW-01
 port link-type trunk
 port trunk allow-pass vlan 100 200 300 400 500 600
#
ospf 1 router-id 10.0.1.1
 area 0.0.0.0
  network 10.0.1.0 0.0.0.255
  network 10.0.2.0 0.0.0.255
  network 10.0.6.0 0.0.0.255
#
snmp-agent
snmp-agent local-engineid 800007DB03AABBCCDDEEFF
snmp-agent community read public123
snmp-agent sys-info version v2c v3
#
ntp-service server 10.0.10.2 source-interface Vlanif100
#
return`,
      lastModified: '2025-07-05 10:00:00', version: 'v2.3.2-running'
    },
    {
      id: 'cfg-03', deviceName: 'Router-GW-01', deviceIp: '10.0.0.1', type: 'router', vendor: 'Huawei',
      content: `# Router-GW-01 Configuration
sysname Router-GW-01
#
interface GigabitEthernet0/0/0
 description WAN-Uplink
 ip address 203.0.113.10 255.255.255.252
#
interface GigabitEthernet0/0/1
 description TO-Core-SW-01
 ip address 10.0.1.10 255.255.255.0
#
interface GigabitEthernet0/0/2
 description TO-Core-SW-02
 ip address 10.0.1.11 255.255.255.0
#
bgp 65001
 router-id 10.0.0.1
 peer 203.0.113.9 as-number 65000
 peer 10.0.1.1 as-number 65001
 peer 10.0.1.2 as-number 65001
 #
 ipv4-family unicast
  peer 203.0.113.9 enable
  peer 10.0.1.1 enable
  peer 10.0.1.2 enable
  network 10.0.0.0 255.255.0.0
#
ip route-static 0.0.0.0 0.0.0.0 203.0.113.9
#
return`,
      lastModified: '2025-07-04 15:00:00', version: 'v1.5.0'
    },
  ]
}

export function getMockDeployTasks(): DeployTask[] {
  return [
    {
      id: 'DEP-001', name: 'VLAN600全网部署', targetDevices: ['Core-SW-01', 'Core-SW-02', 'Agg-SW-01', 'Agg-SW-02'],
      configContent: 'vlan 600\nname Production-Network\n#\ninterface Vlanif600\n ip address 10.0.6.0 255.255.255.0',
      type: 'incremental', status: 'completed', createTime: '2025-07-05 08:00:00', executeTime: '2025-07-05 09:00:00',
      result: '4台设备全部部署成功', operator: 'admin'
    },
    {
      id: 'DEP-002', name: 'Agg-SW-01端口安全加固', targetDevices: ['Agg-SW-01'],
      configContent: 'interface GigabitEthernet0/0/24\n port-security enable\n port-security max-mac-num 2\n port-security mac-address sticky',
      type: 'incremental', status: 'running', createTime: '2025-07-05 13:35:00',
      operator: 'admin'
    },
    {
      id: 'DEP-003', name: '全网SNMP只读团体字更新', targetDevices: ['Core-SW-01', 'Core-SW-02', 'Router-GW-01', 'Router-GW-02', 'Agg-SW-01', 'Agg-SW-02', 'Agg-SW-03'],
      configContent: 'snmp-agent community read NewSecureRead2025',
      type: 'full', status: 'draft', createTime: '2025-07-05 13:40:00',
      operator: 'operator'
    },
    {
      id: 'DEP-004', name: 'FW-02策略回滚', targetDevices: ['FW-02'],
      configContent: 'rollback to configuration checkpoint 20250704-180000',
      type: 'rollback', status: 'pending', createTime: '2025-07-05 13:45:00',
      operator: 'admin'
    },
  ]
}

export function getFaultStatistics() {
  return {
    totalAlarms: 156,
    activeAlarms: 8,
    resolvedAlarms: 142,
    acknowledgedAlarms: 6,
    criticalAlarms: 4,
    warningAlarms: 8,
    infoAlarms: 144,
    deviceTotal: 48,
    deviceOnline: 43,
    deviceOffline: 3,
    deviceWarning: 2,
    diagnosisTotal: 128,
    diagnosisSuccess: 118,
    diagnosisFailed: 5,
    diagnosisRunning: 5,
    avgDiagnosisTime: 125,
    monthlyFaults: [
      { month: '1月', critical: 5, warning: 12, info: 35 },
      { month: '2月', critical: 3, warning: 10, info: 28 },
      { month: '3月', critical: 7, warning: 15, info: 42 },
      { month: '4月', critical: 4, warning: 11, info: 30 },
      { month: '5月', critical: 6, warning: 14, info: 38 },
      { month: '6月', critical: 2, warning: 8, info: 25 },
      { month: '7月', critical: 4, warning: 8, info: 20 },
    ],
    deviceTypeDist: [
      { type: '核心交换机', count: 2 },
      { type: '汇聚交换机', count: 6 },
      { type: '接入交换机', count: 24 },
      { type: '路由器', count: 4 },
      { type: '防火墙', count: 4 },
      { type: '服务器', count: 8 },
    ],
    topFaultDevices: [
      { device: 'Agg-SW-01', count: 23 },
      { device: 'FW-02', count: 18 },
      { device: 'Router-GW-02', count: 15 },
      { device: 'Acc-SW-07', count: 12 },
      { device: 'NMS-Server', count: 10 },
    ],
  }
}
