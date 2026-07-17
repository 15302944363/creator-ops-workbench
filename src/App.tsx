import { useEffect, useMemo, useState } from 'react'
import {
  Activity, Bell, Check, ChevronDown, CircleHelp, Clock3, Filter, LayoutDashboard,
  ListFilter, Mail, Menu, MoreHorizontal, Play, Plus, Search, Send, Settings,
  Sparkles, Target, Users, X, Youtube, Instagram, Music2, Twitter
} from 'lucide-react'

type Platform = 'YouTube' | 'Instagram' | 'TikTok' | 'X'
type Stage = '待评估' | '已入库' | '待建联' | '已建联' | '已回复' | '合作中'
type Creator = {
  id: number; name: string; handle: string; platform: Platform; niche: string; followers: string
  engagement: string; fit: number; stage: Stage; lastTouch: string; email?: string; avatar: string
}

const initialCreators: Creator[] = [
  { id: 1, name: 'Maya Chen', handle: '@mayamakes', platform: 'YouTube', niche: '科技生活', followers: '186K', engagement: '6.4%', fit: 92, stage: '待建联', lastTouch: '尚未联系', email: 'hello@mayamakes.co', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&q=80' },
  { id: 2, name: 'Jordan Lee', handle: '@thejordanedit', platform: 'Instagram', niche: '男士风格', followers: '72K', engagement: '7.8%', fit: 88, stage: '待建联', lastTouch: '尚未联系', email: 'work@jordanedit.com', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=96&q=80' },
  { id: 3, name: 'Ava Murphy', handle: '@avaontheroad', platform: 'TikTok', niche: '旅行生活', followers: '318K', engagement: '9.1%', fit: 84, stage: '已建联', lastTouch: '今天 10:42', email: 'ava@ontheroad.tv', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=96&q=80' },
  { id: 4, name: 'Theo Grant', handle: '@theogrant', platform: 'X', niche: 'AI 创业', followers: '41K', engagement: '4.8%', fit: 81, stage: '已回复', lastTouch: '昨天', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=96&q=80' },
  { id: 5, name: 'Nora Kim', handle: '@nora.daily', platform: 'Instagram', niche: '护肤美妆', followers: '124K', engagement: '5.7%', fit: 78, stage: '已入库', lastTouch: '7月15日', avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=96&q=80' },
  { id: 6, name: 'Eli Brooks', handle: '@eliplays', platform: 'YouTube', niche: '数码评测', followers: '90K', engagement: '5.2%', fit: 76, stage: '待评估', lastTouch: '7月14日', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=96&q=80' }
]

const platformIcon: Record<Platform, typeof Youtube> = { YouTube: Youtube, Instagram, TikTok: Music2, X: Twitter }
const stages: Stage[] = ['待评估', '已入库', '待建联', '已建联', '已回复', '合作中']
const platformFilter: Array<Platform | '全部平台'> = ['全部平台', 'YouTube', 'Instagram', 'TikTok', 'X']

function loadCreators() {
  try { return JSON.parse(localStorage.getItem('creator-ops-creators') || 'null') || initialCreators } catch { return initialCreators }
}

export default function App() {
  const [creators, setCreators] = useState<Creator[]>(loadCreators)
  const [query, setQuery] = useState('')
  const [platform, setPlatform] = useState<Platform | '全部平台'>('全部平台')
  const [stage, setStage] = useState<Stage | '全部状态'>('全部状态')
  const [selected, setSelected] = useState<number[]>([])
  const [view, setView] = useState('工作台')
  const [companion, setCompanion] = useState(true)
  const [modal, setModal] = useState<'add' | 'draft' | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => { localStorage.setItem('creator-ops-creators', JSON.stringify(creators)) }, [creators])
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(''), 2800); return () => window.clearTimeout(timer) }, [notice])

  const rows = useMemo(() => creators.filter((creator) => {
    const matchesQuery = `${creator.name} ${creator.handle} ${creator.niche}`.toLowerCase().includes(query.toLowerCase())
    return matchesQuery && (platform === '全部平台' || creator.platform === platform) && (stage === '全部状态' || creator.stage === stage)
  }), [creators, query, platform, stage])
  const readyToContact = creators.filter((creator) => creator.stage === '待建联').length
  const replied = creators.filter((creator) => creator.stage === '已回复').length
  const avgFit = Math.round(creators.reduce((total, creator) => total + creator.fit, 0) / creators.length)

  const updateStage = (id: number, next: Stage) => setCreators((items) => items.map((item) => item.id === id ? { ...item, stage: next, lastTouch: next === '已建联' ? '刚刚' : item.lastTouch } : item))
  const toggleSelected = (id: number) => setSelected((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id])
  const addCreator = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const data = new FormData(event.currentTarget)
    const next: Creator = { id: Date.now(), name: String(data.get('name') || '未命名达人'), handle: String(data.get('handle') || '@creator'), platform: data.get('platform') as Platform, niche: String(data.get('niche') || '待补充'), followers: String(data.get('followers') || '-'), engagement: '-', fit: 70, stage: '待评估', lastTouch: '刚刚', avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=96&q=80' }
    setCreators((items) => [next, ...items]); setModal(null); setNotice('达人已加入待评估队列')
  }
  const createDrafts = () => {
    const targets = selected.length ? creators.filter((creator) => selected.includes(creator.id)) : creators.filter((creator) => creator.stage === '待建联')
    targets.forEach((creator) => updateStage(creator.id, '已建联'))
    setSelected([]); setModal(null); setNotice(`已生成 ${targets.length} 封个性化建联草稿，等待人工确认发送`)
  }

  return <div className={`app-shell ${companion ? '' : 'companion-off'}`}>
    <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
      <div className="brand"><span className="brand-mark"><Sparkles size={17} /></span><span>CreatorOps</span></div>
      <button className="workspace-switch" type="button"><span>夏季新品建联</span><ChevronDown size={15} /></button>
      <nav>
        {[['工作台', LayoutDashboard], ['达人库', Users], ['建联任务', Send], ['合作项目', Target]].map(([label, Icon]) => <button key={label as string} className={view === label ? 'nav-item active' : 'nav-item'} onClick={() => { setView(label as string); setMenuOpen(false) }} type="button"><Icon size={17} /><span>{label as string}</span></button>)}
      </nav>
      <div className="sidebar-bottom"><button className="nav-item" type="button"><Settings size={17} /><span>设置</span></button><div className="account"><span className="initials">YC</span><span><strong>Yuchen</strong><small>运营负责人</small></span><MoreHorizontal size={17} /></div></div>
    </aside>
    {menuOpen && <button className="mobile-backdrop" onClick={() => setMenuOpen(false)} aria-label="关闭菜单" />}
    <main className="main-content">
      <header className="topbar"><div className="mobile-brand"><button className="icon-button" onClick={() => setMenuOpen(true)} aria-label="打开菜单"><Menu size={20} /></button><span>CreatorOps</span></div><div className="topbar-spacer" /><button className="status-control" type="button" onClick={() => setCompanion(!companion)} aria-pressed={companion}><Activity size={16} /><span>{companion ? '陪伴模式已开启' : '开启陪伴模式'}</span></button><button className="icon-button" type="button" aria-label="通知"><Bell size={19} /><span className="notification-dot" /></button><button className="avatar-button" type="button" aria-label="账户菜单">YC</button></header>
      <section className="page-heading"><div><p className="eyebrow">{view === '工作台' ? '本地达人运营工作台' : '夏季新品建联'}</p><h1>{view === '工作台' ? '今天的达人建联' : view}</h1><p className="subhead">从发现到合作，每一步都保留人工确认。</p></div><div className="heading-actions"><button className="btn secondary" type="button" onClick={() => setModal('draft')}><Sparkles size={16} />生成建联草稿</button><button className="btn primary" type="button" onClick={() => setModal('add')}><Plus size={17} />新增达人</button></div></section>
      <section className="metric-strip" aria-label="运营概览"><div><span>本周入库</span><strong>{creators.length}</strong><small>已完成资料去重</small></div><div><span>待建联</span><strong>{readyToContact}</strong><small>可生成个性化草稿</small></div><div><span>本周回复</span><strong>{replied}</strong><small>回复率 14.3%</small></div><div><span>平均匹配</span><strong>{avgFit}<em>/100</em></strong><small>基于受众与内容信号</small></div></section>
      <section className="work-area">
        <div className="pipeline-column">
          <div className="section-header"><div><h2>达人管道</h2><p>{rows.length} 位达人符合当前筛选</p></div><button className="link-button" type="button"><ListFilter size={16} />管理字段</button></div>
          <div className="filter-row"><label className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索达人、账号或领域" /></label><label className="select-field"><Filter size={16} /><select value={platform} onChange={(event) => setPlatform(event.target.value as Platform | '全部平台')} aria-label="平台筛选">{platformFilter.map((item) => <option key={item}>{item}</option>)}</select></label><label className="select-field"><select value={stage} onChange={(event) => setStage(event.target.value as Stage | '全部状态')} aria-label="状态筛选"><option>全部状态</option>{stages.map((item) => <option key={item}>{item}</option>)}</select></label></div>
          {selected.length > 0 && <div className="batch-bar"><span>已选择 {selected.length} 位达人</span><button className="btn primary small" onClick={() => setModal('draft')} type="button"><Sparkles size={15} />生成草稿</button></div>}
          <div className="creator-table" role="region" aria-label="达人列表"><div className="table-head"><span><input type="checkbox" aria-label="选择全部" checked={rows.length > 0 && selected.length === rows.length} onChange={() => setSelected(selected.length === rows.length ? [] : rows.map((creator) => creator.id))} /></span><span>达人</span><span>数据</span><span>匹配度</span><span>当前阶段</span><span>最近动作</span></div>{rows.map((creator) => { const Icon = platformIcon[creator.platform]; return <div className="creator-row" key={creator.id}><span><input type="checkbox" aria-label={`选择 ${creator.name}`} checked={selected.includes(creator.id)} onChange={() => toggleSelected(creator.id)} /></span><div className="creator-name"><img src={creator.avatar} alt="" /><span><strong>{creator.name}</strong><small>{creator.handle} <b><Icon size={12} />{creator.platform}</b></small></span></div><div className="creator-data"><strong>{creator.followers}</strong><small>{creator.niche} · {creator.engagement} 互动</small></div><div className="fit"><span className={`fit-value ${creator.fit >= 85 ? 'high' : creator.fit >= 78 ? 'mid' : ''}`}>{creator.fit}</span><small>匹配</small></div><label className="stage-select"><select value={creator.stage} onChange={(event) => updateStage(creator.id, event.target.value as Stage)} aria-label={`${creator.name} 的阶段`}>{stages.map((item) => <option key={item}>{item}</option>)}</select></label><span className="last-touch">{creator.lastTouch}</span></div>})}</div>
        </div>
        {companion && <aside className="companion-panel"><div className="companion-title"><div><span className="live-dot" />运行陪伴</div><button className="icon-button compact" type="button" onClick={() => setCompanion(false)} aria-label="关闭陪伴模式"><X size={16} /></button></div><div className="focus-task"><span className="task-icon"><Target size={18} /></span><div><p>当前优先任务</p><h3>确认 2 位高匹配达人</h3><small>目标：本周完成第一轮建联</small></div></div><ol className="task-list"><li className="done"><span><Check size={14} /></span><div><strong>导入候选达人</strong><small>6 位资料已去重</small></div></li><li className="active"><span>2</span><div><strong>核对匹配与公开联系信息</strong><small>2 位待确认</small></div><button className="mini-action" onClick={() => setPlatform('Instagram')} type="button">查看</button></li><li><span>3</span><div><strong>生成个性化建联草稿</strong><small>发送前需要人工审核</small></div></li><li><span>4</span><div><strong>设置 3 天后跟进提醒</strong><small>仅对未回复达人生效</small></div></li></ol><div className="guardrail"><CircleHelp size={16} /><p>所有发送动作保持人工确认，公开邮箱与拒联状态会记录在本地。</p></div><div className="next-window"><div><Clock3 size={16} /><span>下一提醒</span></div><strong>今天 16:00</strong><p>跟进 Ava Murphy 的合作意向</p></div></aside>}
      </section>
    </main>
    {notice && <div className="toast"><Check size={16} />{notice}</div>}
    {modal && <div className="modal-backdrop" role="presentation"><div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button className="modal-close" type="button" onClick={() => setModal(null)} aria-label="关闭"><X size={18} /></button>{modal === 'add' ? <><p className="eyebrow">手动补充</p><h2 id="modal-title">新增达人</h2><form onSubmit={addCreator}><label>达人名称<input name="name" required placeholder="例如：Maya Chen" /></label><label>账号<input name="handle" required placeholder="例如：@mayamakes" /></label><div className="form-grid"><label>平台<select name="platform" defaultValue="Instagram"><option>YouTube</option><option>Instagram</option><option>TikTok</option><option>X</option></select></label><label>粉丝数<input name="followers" placeholder="例如：50K" /></label></div><label>内容领域<input name="niche" placeholder="例如：科技生活" /></label><button className="btn primary wide" type="submit"><Plus size={16} />加入待评估队列</button></form></> : <><p className="eyebrow">人工审核后发送</p><h2 id="modal-title">生成建联草稿</h2><p className="modal-copy">将为 {selected.length || readyToContact} 位待建联达人建立个性化邮件草稿，并保留在本地的待确认列表。</p><div className="draft-preview"><Mail size={18} /><div><strong>主题：关于夏季新品合作的想法</strong><span>基于达人内容领域和受众数据生成</span></div></div><button className="btn primary wide" type="button" onClick={createDrafts}><Play size={16} />生成待确认草稿</button></>}</div></div>}
  </div>
}
