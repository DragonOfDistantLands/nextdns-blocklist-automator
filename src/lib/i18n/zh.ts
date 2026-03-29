import type { Dictionary } from './types'

export const zh: Dictionary = {
  localeCode: 'zh-CN',

  header: {
    title: 'NextDNS Blocklist Automator',
    subtitle: '自动将外部屏蔽列表添加到拒绝列表',
  },

  footer: {
    description: 'NextDNS Blocklist Automator — 开源，免费。',
    donate: '请我喝杯咖啡 ☕',
  },

  donate: {
    buttonLabel: '请我喝杯咖啡 ☕',
    title: '支持本项目',
    description:
      '如果您觉得这个开源项目有用，欢迎用 USDT 支持我们。请务必选择正确的网络——发送到错误网络的资金可能永久丢失。',
    copy: '复制',
    copied: '已复制！',
    networks: {
      bsc: 'USDT（BEP20 / BSC）',
      sol: 'USDT（Solana / SPL）',
    },
    warning: '发送前请务必确认网络。',
  },

  hero: {
    badge: '开源 & 免费',
    title: '添加屏蔽列表',
    description:
      '使用您的 API 密钥，将 NextDNS 默认列表中未包含的外部域名屏蔽列表自动添加到您的拒绝列表中。',
  },

  form: {
    cardTitle: '连接信息',
    cardDescription:
      '输入您的 NextDNS API 密钥和目标配置文件 ID，然后指定屏蔽列表的 URL 和格式。',
    apiKey: {
      label: 'NextDNS API 密钥',
      tooltip:
        '前往 my.nextdns.io → 右上角头像 → Account → API 部分获取。',
      hide: '隐藏密钥',
      show: '显示密钥',
    },
    profileId: {
      label: '配置文件 ID',
      tooltip:
        'my.nextdns.io 的 URL 格式为：my.nextdns.io/abc123/setup — 加粗显示的 6 位字符即为您的配置文件 ID。',
    },
    url: {
      label: '屏蔽列表 URL',
      placeholder: 'https://example.com/blocklist.txt',
      hint: '输入包含域名列表的 .txt 文件的完整 URL。',
    },
    format: {
      label: '源格式',
      placeholder: '选择格式...',
      descriptions: {
        adaway: 'Android hosts 格式（127.0.0.1 域名）',
        pihole: 'Pi-hole hosts 格式（0.0.0.0 域名）',
        hosts: '通用 hosts 文件（Windows/Linux/macOS）',
        'hosts-compressed': '每行多个域名（Hagezi 风格）',
        'windows-hosts': 'Windows/Linux hosts 文件 — 每行单个域名',
        dnsmasq: 'dnsmasq address/server/local 指令',
        dnscrypt: 'dnscrypt 伪装规则',
        unbound: 'Unbound local-zone 指令',
        bind9: 'BIND9 RPZ zone 格式',
        rpz: 'DNS RPZ 记录格式 — 兼容 Bind9',
        ublock: 'Adblock Plus 过滤语法',
        adblock: 'Adblock Plus / uBlock Origin 过滤语法',
        plain: '纯域名列表（每行一个）',
        domains: '每行一个域名 — plain 格式',
        subdomains: '子域名纯列表',
        dnscloak: 'iOS/macOS DNS 代理规则',
        'wildcard-asterisk': '仅 *.domain.com 通配符规则',
        'wildcard-domains': '*.domain.com 与普通域名混合列表',
      },
    },
    actions: {
      start: '开始',
      stop: '停止',
      restart: '重新开始',
    },
    processing: {
      fetching: '正在获取 URL...',
      parsing: '正在解析...',
      pushing: '正在发送到 NextDNS...',
    },
  },

  validation: {
    apiKeyRequired: 'API 密钥为必填项。',
    profileIdRequired: '配置文件 ID 为必填项。',
    urlRequired: '屏蔽列表 URL 为必填项。',
    urlInvalidProtocol: '仅允许 http 和 https URL。',
    urlInvalid: '请输入有效的 URL（https://...）。',
  },

  logs: {
    fetchingUrl: '正在获取屏蔽列表 URL...',
    contentFetched: '内容已获取 — {{lines}} 行，{{size}}',
    fetchFailed: '无法获取 URL：{{error}}',
    parsing: "正在以 '{{format}}' 格式解析...",
    noDomainsFound: '未找到有效域名，请检查格式选择。',
    domainsFound: '找到 {{count}} 个唯一域名',
    pushingDomains: '正在将 {{count}} 个域名添加到 NextDNS 拒绝列表...',
    pushInfo: '配置文件：{{profileId}} · 批次：{{batchSize}} · 延迟：{{delay}}s',
    batchComplete: '批次 {{n}} — 已添加 +{{added}}',
    alsoSkipped: '，{{n}} 个已存在',
    alsoErrors: '，{{n}} 个错误',
    waitingNextBatch: '等待 {{s}}s 后处理下一批次...',
    fatalError: '严重错误：{{error}}',
    completed: '完成！{{added}} 已添加 · {{skipped}} 已存在 · {{errors}} 错误 · {{duration}}s',
    aborted: '操作已被用户取消。',
    unexpectedError: '意外错误：{{error}}',
    apiError: 'API 错误：{{error}}',
    responseError: '未收到响应',
  },

  progress: {
    panelTitle: '实时进度',
    status: {
      idle: '空闲',
      fetching: '正在获取 URL...',
      parsing: '正在解析...',
      pushing: '正在发送到 NextDNS...',
      done: '已完成',
      aborted: '已取消',
    },
    stats: {
      total: '总计',
      added: '已添加',
      existing: '已存在',
      error: '错误',
    },
    progressLabel: '进度',
    waiting: '等待中...',
  },
}
