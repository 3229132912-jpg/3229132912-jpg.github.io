/* 数据层 · window.RPT —— 全部数值转写自事实源 ecommerce_compete.agent.final.md，
   每个数据集标注估算口径与 K 锚点（见 js/sources.js）。snake_case 英文键。 */
window.RPT = {

/* ── 格局：GMV 份额（高盛口径，机构估算）· K3/K4 ── */
market_share: {
  note: "高盛预测口径，GMV 为非强制披露指标，属机构估算；单一券商观点而非市场共识",
  periods: ["2025Q4", "2025E", "2026E", "2027E"],
  series: [
    { key: "taotian",  name: "淘天",   values: [31, 31, 29, 28] },
    { key: "douyin",   name: "抖音",   values: [24, 22, 24, 26] },
    { key: "pdd",      name: "拼多多", values: [19, 20, 20, 19] },
    { key: "jd",       name: "京东",   values: [16, 16, 15, 15] },
    { key: "kuaishou", name: "快手",   values: [6, 6, 6, 6] },
    { key: "wechat",   name: "视频号", values: [3, 3, 4, 5] }
  ],
  src: "高盛预测（2025-09 报告及 2025-12 转引）· K3/K4"
},

/* ── GMV 规模梯队（2025，估算口径混合）· K6/K7/K8/K9 ── */
gmv_scale_2025: [
  { key: "taotian", name: "淘天",   low: 8.3,  high: 8.3,  unit: "万亿", label: "约8.3万亿",  basis: "市场预计，同比约+6%", est: true },
  { key: "pdd",     name: "拼多多", low: 5.2,  high: 5.2,  unit: "万亿", label: "约5.2万亿",  basis: "2024年口径（2022Q2起停披GMV）", est: true },
  { key: "douyin",  name: "抖音",   low: 4.3,  high: 4.4,  unit: "万亿", label: "4.3–4.4万亿", basis: "媒体/机构估算，同比+25%–30%", est: true },
  { key: "jd",      name: "京东",   low: 3.5,  high: 4.5,  unit: "万亿", label: "3.5–4.5万亿", basis: "口径不一（是否含第三方服务）", est: true },
  { key: "xianyu",  name: "闲鱼",   low: 0.36, high: 0.36, unit: "万亿", label: "约3600亿",    basis: "官方日均GMV超10亿，年化推算", est: true },
  { key: "dewu",    name: "得物",   low: 0.20, high: 0.25, unit: "万亿", label: "2000–2500亿", basis: "媒体估算，官方未确认", est: true },
  { key: "vips",    name: "唯品会", low: 0.2135, high: 0.2135, unit: "万亿", label: "2135亿", basis: "财报口径，同比+2.0%", est: false }
],

/* ── MAU 梯队（QuestMobile 2025-10 为主口径）· K13–K16 ── */
mau_2025_10: [
  { key: "taobao", name: "淘宝",   value: 10.00, yoy: 3.7,   basis: "QuestMobile 2025-10，首破10亿；2026-02回落9.51亿" },
  { key: "douyin", name: "抖音",   value: 9.48,  yoy: 14.4,  basis: "QuestMobile 2025-10；2026-06达10.29亿，常态月反超淘宝" },
  { key: "pdd",    name: "拼多多", value: 7.20,  yoy: 0.9,   basis: "QuestMobile 2025-10；官方2022年起停披买家数" },
  { key: "jd",     name: "京东",   value: 6.48,  yoy: 14.4,  basis: "QuestMobile 2025-10，与外卖高频拉动同步" },
  { key: "xianyu", name: "闲鱼",   value: 2.17,  yoy: 19.64, basis: "QuestMobile 2026-01，电商类增速第一" },
  { key: "dewu",   name: "得物",   value: 1.0,   yoy: null,  basis: "媒体/第三方估算（2024年底约9500万），非官方披露", est: true },
  { key: "vips",   name: "唯品会", value: 0.848, yoy: null,  basis: "2025年全年活跃用户（财报口径），与App MAU不可直接比较", est: true }
],

/* ── 上市主体财务（2025年度 + 2026Q2）· K9/K17–K22 ── */
financials_2025: [
  { key: "baba", name: "阿里巴巴", period: "FY2026（2025.4–2026.3）", revenue: 10237, rev_yoy: 3,
    profit: 606.6, profit_basis: "Non-GAAP净利", profit_yoy: -62,
    note: "剔除已处置业务同口径营收+11%；利润下滑主因AI资本开支与即时零售投入" },
  { key: "jd", name: "京东", period: "2025自然年", revenue: 13091, rev_yoy: 13,
    profit: 196, profit_basis: "归母净利", profit_yoy: -53,
    note: "自营总额法口径，营收不可与平台模式直接比较；净利率约1.5%；Q4单季GAAP净亏27亿" },
  { key: "pdd", name: "拼多多", period: "2025自然年", revenue: 4318, rev_yoy: 10,
    profit: 994, profit_basis: "归母净利", profit_yoy: -12,
    note: "上市以来首次年度利润下滑；净利率约23%；资本开支仅占营收0.3%" },
  { key: "vips", name: "唯品会", period: "2025自然年", revenue: 1059, rev_yoy: -2.3,
    profit: 87, profit_basis: "Non-GAAP归母净利", profit_yoy: -3.3,
    note: "唯一营收负增长但利润基本持平；连续盈利超50个季度" }
],
financials_2026q2: [
  { key: "baba", name: "阿里巴巴", period: "FY2027Q1", revenue: 2689.5, rev_yoy: 9,
    profit: 207.2, profit_basis: "Non-GAAP净利", profit_yoy: -38,
    note: "增长主要由云业务（+45%）驱动；CMR同口径仅+1%；单季资本开支676.78亿（+75%）" },
  { key: "jd", name: "京东", period: "2026Q2", revenue: 3464, rev_yoy: -2.9,
    profit: 89, profit_basis: "Non-GAAP归母净利", profit_yoy: 20.3,
    note: "上市以来首次季度收入下滑（国补退坡高基数）；经营利润45亿扭亏，外卖减亏超50%——利润拐点确认" },
  { key: "pdd", name: "拼多多", period: "2026Q2", revenue: 1123.6, rev_yoy: 8,
    profit: 285, profit_basis: "Non-GAAP归母净利", profit_yoy: -13,
    note: "利润连续第三个季度下滑；交易服务收入（含Temu佣金）+13%超在线营销+3.5%" },
  { key: "vips", name: "唯品会", period: "2026Q2", revenue: 247, rev_yoy: -4.3,
    profit: 3.92, profit_basis: "Non-GAAP净利", profit_yoy: null,
    note: "GAAP净利+189%含REIT上市一次性收益57.9亿；剔除后经营温和收缩" }
],

/* ── 利润下滑投向：三场资本开支战争 · K20/K23–K25/K37/K38 ── */
profit_war: {
  note: "利润同向下滑系主动投入而非经营恶化；投入金额口径各异，并列展示不互除",
  drops: [
    { name: "阿里 Non-GAAP净利", delta: -62 },
    { name: "京东 归母净利", delta: -53 },
    { name: "拼多多 归母净利", delta: -12 },
    { name: "字节跳动 IFRS净利", delta: -70, note: "公司澄清主要系非现金因素，剔除后仍增长（估算口径）" }
  ],
  fronts: [
    { key: "instant", name: "即时零售补贴战", amount: "1500–2200亿", unit: "元",
      detail: "三方2025年总投入：澎湃口径Q2+Q3超2200亿；财新窄口径整场超1500亿。京东新业务年亏466.4亿；美团全年净亏233.5亿",
      color: "neg" },
    { key: "ai", name: "AI资本开支竞赛", amount: "676.78亿/季", unit: "元",
      detail: "阿里2026年6月季度资本开支676.78亿元、+75%，叠加三年3800亿元AI基建投入；字节2025年定位AI优先",
      color: "neg" },
    { key: "merchant", name: "商家生态扶持", amount: "千亿级", unit: "元",
      detail: "拼多多“千亿扶持”三年超1000亿+新拼姆一期150亿；抖音2025年为商家降本超320亿、2026Q1再降85亿",
      color: "neg" }
  ]
},

/* ── 货币化率梯队（估算区间）· K27 ── */
take_rate: {
  note: "除闲鱼为平台官方规则外，均为券商/第三方测算区间；按梯队排序呈现，不给单点精确值",
  rows: [
    { name: "抖音电商", low: 8, high: 10, tier: "第一梯队", basis: "国海证券分层测算；官方自述“行业顶级”；自播场景可达10%–20%", trend: "结构性抬升" },
    { name: "得物", low: 7, high: 15, tier: "名义最高", basis: "华鑫证券测算；含鉴别/仓储履约对价，与纯流量变现不可并列；商家综合口径至30%", trend: "2025年起主动下调" },
    { name: "拼多多（主站）", low: 4.5, high: 5, tier: "第二梯队", basis: "国信证券：2023年约4.4%→2024年约4.7%；主站佣金率仅约0.2%量级", trend: "广告升、佣金降" },
    { name: "淘天", low: 3.8, high: 4.2, tier: "第三梯队", basis: "雪球/海豚投研测算“大概4%”；2024-09起征0.6%基础软件服务费", trend: "持续回升" },
    { name: "京东（3P）", low: 3, high: 10, tier: "弱变现", basis: "类目扣点3%–10%（天风转述）；广告变现偏弱，综合take rate缺乏可靠测算", trend: "广告补短板中", weak: true },
    { name: "闲鱼", low: 0.6, high: 1.6, tier: "最低", basis: "平台官方规则：2024-09全体0.6%（封顶60元）→2026-04统一上调至1.6%并取消封顶", trend: "2026-04起上行" }
  ]
},

/* ── 即时零售战役 · K12/K23–K26 ── */
instant_retail: {
  share_q4_2025: [
    { name: "淘宝闪购", value: 45.2, basis: "易观2025Q4即时交易份额，以0.2pct首次反超" },
    { name: "美团",     value: 45.0, basis: "易观2025Q4；战前晨星GTV口径曾占73%" },
    { name: "京东",     value: 8.4,  basis: "易观2025Q4；官方口径外卖份额超15%，第三方分歧明显" }
  ],
  share_pre: [ { name: "美团", value: 73 }, { name: "阿里系", value: 21 } ],
  orders_2026_08: [
    { name: "美团", value: 8900 }, { name: "淘宝闪购", value: 7500 }, { name: "京东", value: 1600 }
  ],
  invest: { low: 1500, high: 2200, unit: "亿元", basis: "财新窄口径超1500亿；澎湃口径2025Q2+Q3超2200亿" },
  jd_loss: 466.4,
  meituan_loss: 233.5,
  flash_peak: 1.2,
  scale: [ { year: "2024", value: 7810, yoy: 20.15 }, { year: "2026E", value: 10000 }, { year: "2030E", value: 20000 } ]
},

/* ── 用户画像矩阵 · K28–K32 ── */
user_profile: {
  dims: ["年龄结构", "性别", "城市层级", "消费力信号"],
  rows: [
    { name: "淘宝", cells: ["90后+00后 39.0%", "男50.5%·最均衡", "一线12.4%", "MAU 10亿基本盘"] },
    { name: "拼多多", cells: ["90后+00后 38.5%", "女54.4%（另口径约70%）", "一线仅10.5%·三线及以下60%+", "价格敏感基本盘"] },
    { name: "京东", cells: ["90后+00后 48.5%·综合最年轻", "男53.5%·唯一男性过半", "一线15.7%·最高", "PLUS年消费4.2倍"] },
    { name: "抖音", cells: ["全人群覆盖", "未见权威披露", "全人群覆盖", "人均日使用93分钟"] },
    { name: "得物", cells: ["30岁以下约70%·最年轻", "男女约55:45（第三方）", "高线城市潮流人群", "客单价450–500元·约行业5倍"] },
    { name: "唯品会", cells: ["25–40岁超50%", "女71.9%·已婚72%", "一线与五线TGI双高", "SVIP客单价3倍"] },
    { name: "闲鱼", cells: ["95后43%·00后22%（注册口径）", "未见权威披露", "反向高线化·高线人群媒介偏好居首", "重合用户月消费2000元+占51%"] }
  ],
  memberships: [
    { name: "88VIP（淘天）", scale: "约6400万", value: "人均年消费为非会员9倍；贡献头部品牌55%以上生意" },
    { name: "京东PLUS", scale: "超3500万", value: "年消费为普通用户4.2倍；人均消费9倍、下单频次6倍（2026-01口径）" },
    { name: "唯品会SVIP", scale: "980万→破1000万", value: "占活跃用户约12%，贡献线上销售52%；客单价为普通用户3倍" }
  ]
},

/* ── 二手循环赛道 · K33/K35 ── */
secondhand_market: {
  scale_2025: 8500, yoy: 31.8, unit: "亿元",
  xianyu_daily_gmv: "10亿+", xianyu_mau: 2.17,
  policy: "以旧换新累计带动销售额超4.16万亿元；2026年再安排2500亿元超长期特别国债；首批10个二手商品流通试点城市",
  note: "转转2025年全面关停C2C后，闲鱼一家独大（观研口径市占率约72%）"
},

/* ── 出海第二战场（2025，估算口径）· K34 ── */
outbound_2025: [
  { name: "Temu", value: 925, range: "900–950", unit: "亿美元", yoy: "约+93%（2024年约480亿）", basis: "第三方调研估算，未达千亿目标；全托管转半托管应对美欧小包免税取消" },
  { name: "TikTok Shop", value: 643, range: "643", unit: "亿美元", yoy: "+94%", basis: "Momentum Works口径（东南亚456亿、美国151亿）；平台方口径近千亿美元" },
  { name: "京东Joybuy", value: null, range: "—", unit: "", yoy: "", basis: "重资产本地自营：约22亿欧元收购CECONOMY；2026-03上线欧洲六国，投入期无GMV披露" },
  { name: "得物Poizon", value: null, range: "—", unit: "", yoy: "", basis: "鉴别型垂类：海外直邮覆盖9个国家/地区，订单较上线初期增长超4倍，无GMV披露" }
],

/* ── 全文时间线（P3 墙图事件）── */
timeline: [
  { date: "2024-09", title: "淘天开征0.6%基础软件服务费", tag: "货币化", k: "K27" },
  { date: "2024-10", title: "京东物流全面接入淘宝天猫", tag: "履约", k: "K24" },
  { date: "2025-02", title: "京东上线外卖，点燃即时零售大战", tag: "战役", k: "K24", hot: true },
  { date: "2025-04", title: "淘宝闪购全面加码；全行业取消“仅退款”", tag: "战役", k: "K25", hot: true },
  { date: "2025-04", title: "拼多多“千亿扶持”：三年超1000亿反哺商家", tag: "生态", k: "K37" },
  { date: "2025-05", title: "美国取消对华小额包裹免税，Temu转半托管", tag: "出海", k: "K34" },
  { date: "2025-06", title: "饿了么、飞猪并入阿里中国电商事业群", tag: "组织", k: "K25" },
  { date: "2025-07", title: "淘宝闪购宣布一年500亿补贴；监管两度约谈外卖平台", tag: "战役", k: "K25", hot: true },
  { date: "2025-08", title: "闪购日订单峰值1.2亿单；淘宝大会员上线", tag: "战役", k: "K25" },
  { date: "2025-09", title: "高盛预测：2025Q4四强份额合计约90%", tag: "格局", k: "K3" },
  { date: "2025-11", title: "双11全网16950亿；即时零售+138.4%", tag: "大促", k: "K11" },
  { date: "2025-12", title: "京东完成CECONOMY要约，持股59.8%", tag: "出海", k: "K34" },
  { date: "2026-02", title: "市监总局约谈7家平台；直播电商+平台规则两新规施行", tag: "监管", k: "K36" },
  { date: "2026-03", title: "拼多多组建“新拼姆”；Joybuy上线欧洲六国", tag: "组织", k: "K37" },
  { date: "2026-04", title: "闲鱼基础费率统一上调至1.6%并取消封顶", tag: "货币化", k: "K27" },
  { date: "2026-05", title: "千问App与淘宝全面打通，“一句话下单”闭环", tag: "AI", k: "K20" },
  { date: "2026-06", title: "618全网仅+4.0%，综合电商+0.9%失速；《规范十条》后补贴战熄火", tag: "大促", k: "K10", hot: true },
  { date: "2026-08", title: "京东Q2经营利润45亿扭亏，利润拐点确认", tag: "财务", k: "K21", hot: true }
],

/* ── 展望：verdict scale 证据（P18）· K4/K12/K21/K33/K36 ── */
verdict: {
  question: "2026–2027：利润修复与份额重排，哪一边的证据更重？",
  left: {
    name: "基准情景成立：利润修复、份额“二八对换”",
    weights: [
      { t: "京东Q2经营利润45亿扭亏、Non-GAAP +20.3%，拐点已确认", k: "K21" },
      { t: "阿里宣布闪购投入“显著收缩”，补贴战随《规范十条》熄火", k: "K23" },
      { t: "高盛路径：2027年阿里28%、抖音26%，分庭抗礼", k: "K4" },
      { t: "即时零售2026年破万亿、2030年2万亿，规模确定性高", k: "K12" }
    ]
  },
  right: {
    name: "下修风险：修复斜率分化、路径依赖变量",
    weights: [
      { t: "抖音增速回落至20%以内，“每年+2pct”份额路径存疑", k: "K6" },
      { t: "补贴水平仍明显高于2024年，若复燃则利润预测整体下修", k: "K23" },
      { t: "国补退坡反噬：京东收入上市以来首次季度下滑", k: "K21" }
    ]
  },
  triggers: [
    { t: "抖音GMV增速连续两季守住20%", k: "K6" },
    { t: "阿里闪购单均经济模型转正", k: "K25" },
    { t: "闲鱼费率上调后商家留存不失速", k: "K33" }
  ],
  falsify: [
    { t: "补贴战复燃：三家重回“零元购”式投入", k: "K23" },
    { t: "AI入口重构搜索流量分配，淘天CMR同口径转负", k: "K20" },
    { t: "监管进一步压缩价格竞争空间", k: "K36" }
  ]
},

/* ── 证据对象（P17 包裹）：全篇最硬的 7 个数字 ── */
evidence: [
  { site: "waybill",  label: "面单·行业大盘", value: "15.97万亿", sub: "2025年网上零售额，同比+8.6%；实物占比降至26.1%", k: "K1" },
  { site: "boxtop",   label: "箱体·四强份额", value: "约90%", sub: "高盛口径2025Q4淘天31%/抖音24%/拼多多19%/京东16%合计", k: "K3" },
  { site: "cushion",  label: "缓冲层·利润牺牲", value: "-62% / -53% / -12%", sub: "2025年阿里、京东、拼多多净利同向下滑，系主动投入而非经营恶化", k: "K17" },
  { site: "item",     label: "商品·GMV第一梯队", value: "8.3万亿", sub: "淘天2025年GMV独居第一梯队（市场预计口径）", k: "K6" },
  { site: "sticker",  label: "贴纸·即时零售投入", value: "1500–2200亿", sub: "三方2025年合计投入（财新/澎湃两口径）", k: "K23" },
  { site: "tape",     label: "胶带·二手循环", value: "8500亿·+31.8%", sub: "2025年二手电商交易规模，唯一“政策+增长”双红利赛道", k: "K33" },
  { site: "tag",      label: "吊牌·份额预言", value: "28% vs 26%", sub: "高盛预测2027年阿里与抖音进入分庭抗礼区间（单一券商观点）", k: "K4" }
]
};
