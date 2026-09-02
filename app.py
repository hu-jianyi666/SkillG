# -*- coding: utf-8 -*-
"""
SkillG - 本地 Skill 分类管理器
零第三方依赖（标准库）。提供：扫描索引 / 自动分类 / 新增监听 / 安装到智能体。
"""
import argparse
import hashlib
import json
import os
import re
import shutil
import sys
import threading
import time
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs, quote

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

if getattr(sys, "frozen", False):
    # PyInstaller 单文件模式：界面资源在临时解包目录，用户数据放在 exe 同级（持久保留）
    BUNDLE_DIR = getattr(sys, "_MEIPASS",
                         os.path.dirname(os.path.abspath(sys.executable)))
    APP_DIR = os.path.dirname(os.path.abspath(sys.executable))
else:
    BUNDLE_DIR = APP_DIR = os.path.dirname(os.path.abspath(__file__))
WEB_DIR = os.path.join(BUNDLE_DIR, "web")
DATA_DIR = os.path.join(APP_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)
# pythonw（无控制台启动）下 sys.stdout 为 None，print 会崩溃：重定向到日志文件
if sys.stdout is None or sys.stderr is None:
    _log = open(os.path.join(DATA_DIR, "launch.log"), "a", encoding="utf-8")
    sys.stdout = _log
    sys.stderr = _log
CONFIG_PATH = os.path.join(DATA_DIR, "config.json")

# ---------------------------------------------------------------- 分类体系
# 顺序即优先级（前面的类别先命中）；命中数相同按此顺序裁决
CATEGORIES = [
    ("feishu",   "飞书协作", ["lark", "feishu", "飞书", "calendar", "wiki", "okr",
                             "approval", "whiteboard", "bitable", "openapi", "im消息",
                             "通讯录", "日历", "邮箱", "审批", "妙记"]),
    ("medical",  "医疗健康", ["medical", "clinical", "医学", "医疗", "临床", "药", "医院", "健康"]),
    ("legal",    "法律合规", ["legal", "contract", "dpa", "compliance", "law",
                             "法律", "合同", "协议", "合规", "法务", "专利"]),
    ("academic", "学术研究", ["academic", "paper", "research", "scholar", "proposal",
                             "journal", "literature", "thesis", "论文", "学术", "文献",
                             "审稿", "课题", "基金申请"]),
    ("finance",  "金融财经", ["finance", "stock", "earning", "trading", "fund", "bond",
                             "sec ", "wealth", "announcement", "market-hotspot",
                             "金融", "股票", "财报", "基金", "证券", "财经", "投资", "理财"]),
    ("ecom",     "电商营销", ["ecommerce", "e-commerce", "marketing", "customer-service",
                             "oceanengine", "cross-border", "listing", "selection",
                             "product-content", "电商", "营销", "带货", "跨境", "客服",
                             "投放", "商品", "店铺"]),
    ("media",    "音视频",   ["video", "audio", "mediakit", "seedance", "seedream",
                             "cinema", "film", "shot", "drama", "视频", "音频", "剪辑",
                             "配音", "影像", "镜头", "分镜", "coser", "collage", "图像生成",
                             "图片生成", "生图", "image generation", "reference image",
                             "photo", "banana", "cover image", "图像编辑", "图片编辑",
                             "参考图", "gpt image"]),
    ("creative", "内容创作", ["creative", "design", "prompt", "poster", "novel", "writing",
                             "newmedia", "wechat", "headlines", "book-writer", "插画",
                             "设计", "创意", "提示词", "写作", "文案", "公众号", "短剧",
                             "漫画", "网文", "内容", "humaniz", "ai-sounding", "prose",
                             "去ai味", "人设", "persona", "抖音", "douyin", "小红书",
                             "xiaohongshu"]),
    ("office",   "文档办公", ["sheet", "excel", "xlsx", "csv", "word", "docx", "ppt",
                             "pptx", "slide", "pdf", "document", "doc", "表格", "文档",
                             "幻灯", "演示", "排版", "office"]),
    ("data",     "数据分析", ["data-analysis", "dashboard", "analytic", "visualiz",
                             "数据", "可视化", "统计", "问卷", "调研", "指标"]),
    ("product",  "产品商业", ["product-manager", "product-analysis", "product-qa",
                             "game-designer", "app-builder", "产品", "商业", "需求",
                             "prd", "创业", "市场分析", "行业分析"]),
    ("dev",      "开发技术", ["code", "dev", "browser", "computer-use", "automation",
                             "frontend", "verifier", "webhook", "github", "api",
                             "代码", "开发", "部署", "技术", "脚本", "编程", "调试",
                             "skill-creator", "自动化", "eigenflux", "agent network",
                             "agent-to-agent", "元设计器", "mcp", "plugin", "scaffold",
                             "deploy", "website", "computer use", "agent skills",
                             "dependencies", "openai", "codex", "runtime environment",
                             "cli", "pc-control", "workspace startup", "startup error"]),
    ("system",   "系统效率", ["cron", "pc-optimizer", "gift-card", "student-discount",
                             "identity", "record", "定时", "清理", "系统", "优化",
                             "优惠", "订阅", "录音转写", "网盘", "upload", "backup",
                             "storage", "笔记", "note", "knowledge base", "知识库",
                             "music", "音乐", "flight", "travel", "wecom", "企业微信",
                             "待办", "obsidian", "quark", "云存储", "文件上传"]),
    ("game",     "游戏娱乐", ["game", "游戏", "攻略", "娱乐", "ultimate-guide"]),
]
CAT_LABEL = {cid: label for cid, label, _ in CATEGORIES}
CAT_OTHER = "other"
CAT_LABEL[CAT_OTHER] = "其他"


def _kw_hit(kw: str, text: str) -> bool:
    """中文按子串匹配；ASCII 关键词按词边界匹配，避免 Wikipedia 误命中 wiki。"""
    if re.search(r"[A-Za-z0-9]", kw):
        pat = re.escape(kw.lower())
        if re.match(r"^[A-Za-z0-9 .\-]+$", kw):
            pat = r"(?<![A-Za-z0-9])" + pat + r"(?![A-Za-z0-9])"
        return re.search(pat, text) is not None
    return kw.lower() in text


def categorize(name: str, desc: str) -> str:
    text = (name or "").lower() + "\n" + (desc or "").lower()
    namel = (name or "").lower()
    best, best_score = CAT_OTHER, 0
    for cid, _label, kws in CATEGORIES:
        score = 0
        for kw in kws:
            if _kw_hit(kw, namel):
                score += 2
            if _kw_hit(kw, text):
                score += 1
        if score > best_score:
            best, best_score = cid, score
    return best


# ---------------------------------------------------------------- 极简 YAML frontmatter 解析
def parse_frontmatter(text: str):
    """只取我们需要的标量字段与 metadata.requires.bins，容错优先。"""
    meta = {}
    if not text.startswith("---"):
        return meta, text
    m = re.search(r"\r?\n---\s*\r?\n", text[3:])
    if not m:
        return meta, text
    head = text[3:3 + m.start()]
    body = text[3 + m.end():]
    lines = head.splitlines()
    i = 0

    def strip_quotes(v: str) -> str:
        v = v.strip()
        if len(v) >= 2 and v[0] == v[-1] and v[0] in ("'", '"'):
            inner = v[1:-1]
            if v[0] == '"':
                inner = inner.replace('\\"', '"').replace("\\n", " ")
            return inner.strip()
        return v

    while i < len(lines):
        line = lines[i]
        if not line.strip() or line.lstrip().startswith("#"):
            i += 1
            continue
        m1 = re.match(r"^([A-Za-z0-9_\-]+):\s*(.*)$", line)
        if not m1:
            i += 1
            continue
        key, val = m1.group(1), m1.group(2)
        if val in ("|", ">", "|-", ">-"):
            block, j = [], i + 1
            while j < len(lines) and (not lines[j].strip() or lines[j].startswith((" ", "\t"))):
                block.append(lines[j].lstrip(" \t"))
                j += 1
            meta[key] = "\n".join(block).strip()
            i = j
            continue
        if val == "":
            # 嵌套块，只关心 requires.bins
            sub = {}
            j = i + 1
            while j < len(lines) and re.match(r"^\s{2,}\S", lines[j]):
                sm = re.match(r"^\s+([A-Za-z0-9_\-]+):\s*(.*)$", lines[j])
                if sm:
                    sub[sm.group(1)] = sm.group(2)
                j += 1
            if sub:
                meta[key] = sub
            i = j
            continue
        meta[key] = strip_quotes(val)
        i += 1
    bins = []
    md = meta.get("metadata")
    if isinstance(md, dict):
        req = md.get("requires")
        if isinstance(req, str):
            mm = re.search(r"bins:\s*(\[.*?\])", req)
            if mm:
                bins = re.findall(r"[\"']([^\"']+)[\"']", mm.group(1))
    return meta, body


# ---------------------------------------------------------------- 默认配置
def default_config():
    home = os.path.expanduser("~")
    base = os.path.join(home, "AppData", "Local", "Doubao", "User Data", "Default",
                        ".doubao", "agent_mode", "workspace")

    def hd(*parts):
        return os.path.join(home, *parts)

    roots = [
        {"id": "builtin", "label": "豆包 · 系统内置技能",
         "path": os.path.join(base, ".skills")},
        {"id": "user", "label": "豆包 · 用户自建技能",
         "path": os.path.join(base, ".user_skills")},
        {"id": "doubao", "label": "Doubao 技能库",
         "path": hd("Doubao", "skills")},
        {"id": "agents", "label": "通用 Agent 技能 (.agents)",
         "path": hd(".agents", "skills")},
        {"id": "codex", "label": "Codex", "path": hd(".codex", "skills")},
        {"id": "claude", "label": "Claude Code", "path": hd(".claude", "skills")},
        {"id": "openclaw", "label": "OpenClaw", "path": hd(".openclaw", "skills")},
        {"id": "qoder", "label": "Qoder", "path": hd(".qoder", "skills")},
        {"id": "qclaw", "label": "QClaw", "path": hd(".qclaw", "skills")},
        {"id": "qoderwork", "label": "QoderWork（含插件技能）", "path": hd(".qoderworkcn")},
        {"id": "minimax-bin", "label": "MiniMax · 内置技能",
         "path": hd(".minimax", ".builtin-skills")},
        {"id": "minimax", "label": "MiniMax · 用户技能", "path": hd(".minimax", "skills")},
        {"id": "grok", "label": "Grok（含 bundled）", "path": hd(".grok")},
        {"id": "cola", "label": "Cola（resources/skills）", "path": hd(".cola")},
        {"id": "workbuddy", "label": "WorkBuddy（含连接器技能）", "path": hd(".workbuddy")},
        {"id": "zcode", "label": "ZCode", "path": hd(".zcode", "skills")},
        {"id": "boxagent", "label": "Box Agent", "path": hd(".box-agent", "skills")},
        {"id": "skmgr", "label": "skills-manager", "path": hd(".skills-manager", "skills")},
        {"id": "raccoon", "label": "商汤小浣熊（cli-bundle）",
         "path": r"D:\小欢熊\raccoon-ai\resources\cli-bundle"},
    ]
    agents = [
        {"id": "ag-user", "name": "豆包 · 用户技能（.user_skills）",
         "path": os.path.join(base, ".user_skills")},
        {"id": "ag-doubao", "name": "Doubao 技能库（Doubao/skills）",
         "path": hd("Doubao", "skills")},
        {"id": "ag-agents", "name": "通用 Agents（.agents/skills）",
         "path": hd(".agents", "skills")},
        {"id": "ag-codex", "name": "Codex（.codex/skills）", "path": hd(".codex", "skills")},
        {"id": "ag-claude", "name": "Claude Code（.claude/skills）", "path": hd(".claude", "skills")},
        {"id": "ag-openclaw", "name": "OpenClaw（.openclaw/skills）", "path": hd(".openclaw", "skills")},
        {"id": "ag-qoder", "name": "Qoder（.qoder/skills）", "path": hd(".qoder", "skills")},
        {"id": "ag-qclaw", "name": "QClaw（.qclaw/skills）", "path": hd(".qclaw", "skills")},
        {"id": "ag-qoderwork", "name": "QoderWork（.qoderworkcn/skills）", "path": hd(".qoderworkcn", "skills")},
        {"id": "ag-minimax", "name": "MiniMax（.minimax/skills）", "path": hd(".minimax", "skills")},
        {"id": "ag-grok", "name": "Grok（.grok/skills）", "path": hd(".grok", "skills")},
        {"id": "ag-cola", "name": "Cola（.cola/resources/skills）", "path": hd(".cola", "resources", "skills")},
        {"id": "ag-workbuddy", "name": "WorkBuddy（.workbuddy/skills）", "path": hd(".workbuddy", "skills")},
        {"id": "ag-zcode", "name": "ZCode（.zcode/skills）", "path": hd(".zcode", "skills")},
        {"id": "ag-boxagent", "name": "Box Agent（.box-agent/skills）", "path": hd(".box-agent", "skills")},
        {"id": "ag-skmgr", "name": "skills-manager（.skills-manager/skills）",
         "path": hd(".skills-manager", "skills")},
    ]
    return {
        "roots": roots,
        "agents": agents,
        "category_overrides": {},
        "watch": True,
        "scan_interval": 5,
    }


class Store:
    def __init__(self):
        self.lock = threading.RLock()
        self.config = self.load_config()
        self.skills = []            # 全部技能记录
        self.by_id = {}
        self.index_version = 0
        self.recently_found = []    # 最近一次扫描新出现的技能
        self.watching = bool(self.config.get("watch", True))
        self.last_scan = 0
        self._last_sig = set()

    # ---------- config ----------
    def load_config(self):
        if os.path.exists(CONFIG_PATH):
            try:
                with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                    cfg = json.load(f)
                base = default_config()
                for k, v in base.items():
                    cfg.setdefault(k, v)
                # 版本升级：把新增的默认来源/智能体合并进旧配置（按 id 去重，保留用户顺序）
                changed = False
                for key in ("roots", "agents"):
                    defaults_by_id = {item["id"]: item for item in base[key]}
                    have = {item.get("id") for item in cfg[key]}
                    # 补齐新增默认项
                    for item in base[key]:
                        if item["id"] not in have:
                            cfg[key].append(item)
                            changed = True
                    # 刷新默认项的名称/路径（用户自定义项不动）
                    name_field = "label" if key == "roots" else "name"
                    for item in cfg[key]:
                        d = defaults_by_id.get(item.get("id"))
                        if d and (item.get(name_field) != d[name_field]
                                  or item.get("path") != d["path"]):
                            item[name_field] = d[name_field]
                            item["path"] = d["path"]
                            changed = True
                if changed:
                    self.save_config(cfg)
                return cfg
            except Exception:
                pass
        cfg = default_config()
        self.save_config(cfg)
        return cfg

    def save_config(self, cfg=None):
        cfg = cfg or self.config
        tmp = CONFIG_PATH + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump(cfg, f, ensure_ascii=False, indent=2)
        os.replace(tmp, CONFIG_PATH)

    # ---------- scan ----------
    SKIP_DIRS = {".git", "node_modules", "__pycache__", ".cache", ".venv",
                 "venv", ".tmp", "tmp", ".svn", ".hg", ".idea", ".vscode"}

    def _find_skill_dirs(self, root):
        """返回 {skill_dir: skill_md_path}，深度 1~2 层；父目录含 SKILL.md 时不再下钻。"""
        out = {}
        if not os.path.isdir(root):
            return out
        try:
            for name in os.listdir(root):
                p = os.path.join(root, name)
                if not os.path.isdir(p) or name in self.SKIP_DIRS:
                    continue
                md = os.path.join(p, "SKILL.md")
                if os.path.isfile(md):
                    out[p] = md
                    continue
                # 下钻一层
                try:
                    for sub in os.listdir(p):
                        sp = os.path.join(p, sub)
                        smd = os.path.join(sp, "SKILL.md")
                        if os.path.isdir(sp) and sub not in self.SKIP_DIRS and os.path.isfile(smd):
                            out[sp] = smd
                except OSError:
                    pass
        except OSError:
            pass
        return out

    @staticmethod
    def _sid(path):
        return hashlib.md5(os.path.normcase(os.path.abspath(path)).encode("utf-8")).hexdigest()[:12]

    def _read_skill(self, sdir, mdpath, root):
        try:
            with open(mdpath, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read().lstrip("﻿")
        except OSError:
            return None
        meta, _body = parse_frontmatter(text)
        dirname = os.path.basename(sdir)

        def scalar(key, default=""):
            v = meta.get(key, default)
            return v if isinstance(v, str) else default

        name = (scalar("name") or dirname).strip()
        desc = scalar("description").strip()
        if not desc:
            hm = re.search(r"#\s+(.+)", text)
            desc = hm.group(1).strip() if hm else "（该技能未提供描述）"
        # 文件统计（限制遍历规模）
        file_count, total_size = 0, 0
        for dp, dn, fn in os.walk(sdir):
            dn[:] = [d for d in dn if d not in self.SKIP_DIRS]
            for fnm in fn:
                file_count += 1
                if file_count <= 3000:
                    try:
                        total_size += os.path.getsize(os.path.join(dp, fnm))
                    except OSError:
                        pass
        try:
            mtime = int(os.path.getmtime(mdpath))
        except OSError:
            mtime = 0
        sid = self._sid(os.path.realpath(sdir))
        auto_cat = categorize(name, desc + " " + dirname)
        category = self.config.get("category_overrides", {}).get(sid, auto_cat)
        bins = []
        mdblock = meta.get("metadata")
        if isinstance(mdblock, dict):
            req = mdblock.get("requires")
            if isinstance(req, str):
                mm = re.search(r"\[.*?\]", req)
                if mm:
                    bins = re.findall(r"[\"']([^\"']+)[\"']", mm.group(0))
        return {
            "id": sid,
            "name": name,
            "dirname": dirname,
            "version": scalar("version"),
            "license": scalar("license"),
            "description": desc,
            "category": category,
            "auto_category": auto_cat,
            "path": os.path.abspath(sdir),
            "realpath": os.path.realpath(sdir),
            "also_in": [],
            "skill_md": os.path.abspath(mdpath),
            "root_id": root["id"],
            "root_label": root["label"],
            "mtime": mtime,
            "file_count": file_count,
            "size_kb": round(total_size / 1024, 1),
            "bins": bins,
        }

    def scan(self, report_new=True):
        with self.lock:
            found, sig, by_real, by_name = [], set(), {}, {}
            for root in self.config["roots"]:
                for sdir, mdpath in self._find_skill_dirs(root["path"]).items():
                    rec = self._read_skill(sdir, mdpath, root)
                    if not rec:
                        continue
                    entry = {"root_id": root["id"], "root_label": root["label"],
                             "path": rec["path"], "realpath": rec["realpath"]}
                    # 第一层：Junction/软链接去重（同一物理目录）
                    if rec["id"] in by_real:
                        entry["kind"] = "link"
                        by_real[rec["id"]]["also_in"].append(entry)
                        sig.add(rec["id"] + ":" + str(rec["mtime"]))
                        continue
                    # 第二层：同名副本归并（同一技能装在多个 Agent 中）
                    name_key = rec["name"].strip().lower()
                    if name_key in by_name:
                        entry["kind"] = "copy"
                        by_name[name_key]["also_in"].append(entry)
                        sig.add(rec["id"] + ":" + str(rec["mtime"]))
                        continue
                    by_real[rec["id"]] = rec
                    by_name[name_key] = rec
                    found.append(rec)
                    sig.add(rec["id"] + ":" + str(rec["mtime"]))
            old_ids = {s["id"] for s in self.skills}
            new_recs = [r for r in found if r["id"] not in old_ids] if self.skills else []
            found.sort(key=lambda r: (r["category"] != "other", r["name"].lower()))
            self.skills = found
            self.by_id = {s["id"]: s for s in found}
            self.index_version += 1
            self.last_scan = int(time.time())
            if report_new and new_recs:
                self.recently_found = [{"id": r["id"], "name": r["name"],
                                        "category": r["category"],
                                        "category_label": CAT_LABEL.get(r["category"], "其他")}
                                       for r in new_recs]
            self._last_sig = sig
            self._refresh_install_flags_locked()
            return {"new": self.recently_found if report_new else [],
                    "total": len(found)}

    def _installed_targets(self, rec):
        flags = {}
        for ag in self.config["agents"]:
            tdir = os.path.join(ag["path"], rec["dirname"])
            here = os.path.normcase(os.path.abspath(ag["path"])) == \
                   os.path.normcase(os.path.abspath(os.path.dirname(rec["path"])))
            flags[ag["id"]] = {"installed": here or os.path.isdir(tdir), "here": here,
                               "target": os.path.abspath(tdir)}
        return flags

    def _refresh_install_flags_locked(self):
        for rec in self.skills:
            rec["agents"] = self._installed_targets(rec)

    def refresh_install_flags(self):
        with self.lock:
            self._refresh_install_flags_locked()

    # ---------- operations ----------
    def set_category(self, sid, category):
        with self.lock:
            rec = self.by_id.get(sid)
            if not rec:
                return False
            if category == rec["auto_category"]:
                self.config["category_overrides"].pop(sid, None)
            else:
                self.config["category_overrides"][sid] = category
            rec["category"] = category
            self.save_config()
            self.index_version += 1
            return True

    def install(self, sid, agent_id, overwrite=True):
        with self.lock:
            rec = self.by_id.get(sid)
            ag = next((a for a in self.config["agents"] if a["id"] == agent_id), None)
            if not rec or not ag:
                return {"ok": False, "error": "技能或智能体不存在"}
            if not os.path.isdir(ag["path"]):
                try:
                    os.makedirs(ag["path"], exist_ok=True)
                except OSError as e:
                    return {"ok": False, "error": f"目标目录不存在且无法创建：{e}"}
            dst = os.path.join(ag["path"], rec["dirname"])
            if os.path.normcase(os.path.abspath(dst)) == os.path.normcase(rec["path"]):
                return {"ok": False, "error": "该技能本来就在此目录中，无需安装"}
            if os.path.isdir(dst) and not overwrite:
                return {"ok": False, "error": "目标已存在同名技能"}
            try:
                shutil.copytree(rec["path"], dst, dirs_exist_ok=True)
            except Exception as e:
                return {"ok": False, "error": f"复制失败：{e}"}
            self._refresh_install_flags_locked()
            return {"ok": True, "target": dst}

    def uninstall(self, sid, agent_id):
        with self.lock:
            rec = self.by_id.get(sid)
            ag = next((a for a in self.config["agents"] if a["id"] == agent_id), None)
            if not rec or not ag:
                return {"ok": False, "error": "技能或智能体不存在"}
            dst = os.path.join(ag["path"], rec["dirname"])
            if os.path.normcase(os.path.abspath(dst)) == os.path.normcase(rec["path"]):
                return {"ok": False, "error": "这是技能的原始位置，不能移除"}
            if not os.path.isdir(dst):
                return {"ok": False, "error": "目标位置没有该技能"}
            try:
                shutil.rmtree(dst)
            except Exception as e:
                return {"ok": False, "error": f"删除失败：{e}"}
            self._refresh_install_flags_locked()
            return {"ok": True}

    def skill_detail(self, sid):
        with self.lock:
            rec = self.by_id.get(sid)
            if not rec:
                return None
            tree = []
            try:
                for name in sorted(os.listdir(rec["path"])):
                    p = os.path.join(rec["path"], name)
                    if os.path.isdir(p):
                        kids = []
                        try:
                            kids = sorted(os.listdir(p))[:30]
                        except OSError:
                            pass
                        tree.append({"name": name, "dir": True,
                                     "children": kids})
                    else:
                        tree.append({"name": name, "dir": False})
            except OSError:
                pass
            text = ""
            try:
                with open(rec["skill_md"], "r", encoding="utf-8", errors="ignore") as f:
                    text = f.read().lstrip("﻿")
            except OSError:
                pass
            out = dict(rec)
            out["tree"] = tree
            out["doc"] = text
            return out

    def state_payload(self):
        with self.lock:
            cats = {}
            for s in self.skills:
                c = s["category"]
                cats.setdefault(c, {"id": c, "label": CAT_LABEL.get(c, "其他"), "count": 0})
                cats[c]["count"] += 1
            cat_list = sorted(cats.values(),
                              key=lambda c: (c["id"] == "other", -c["count"], c["label"]))
            roots = []
            default_root_ids = {r["id"] for r in default_config()["roots"]}
            for r in self.config["roots"]:
                roots.append({"id": r["id"], "label": r["label"], "path": r["path"],
                              "exists": os.path.isdir(r["path"]),
                              "builtin": r["id"] in default_root_ids})
            return {
                "version": self.index_version,
                "watching": self.watching,
                "scan_interval": self.config.get("scan_interval", 5),
                "last_scan": self.last_scan,
                "skills": self.skills,
                "categories": cat_list,
                "roots": roots,
                "agents": self.config["agents"],
                "recently_found": self.recently_found,
                "cat_labels": CAT_LABEL,
            }


STORE = Store()


# ---------------------------------------------------------------- 后台轮询监听
class Watcher(threading.Thread):
    def __init__(self):
        super().__init__(daemon=True)
        self._stop = threading.Event()

    def run(self):
        time.sleep(2)
        while not self._stop.wait(int(STORE.config.get("scan_interval", 5))):
            if not STORE.watching:
                continue
            # 轻量签名：目录名 + SKILL.md mtime，变化才全量扫描
            sig = set()
            changed = False
            for root in STORE.config["roots"]:
                for sdir, mdpath in STORE._find_skill_dirs(root["path"]).items():
                    try:
                        mt = int(os.path.getmtime(mdpath))
                    except OSError:
                        mt = 0
                    sig.add(STORE._sid(sdir) + ":" + str(mt))
            if sig != STORE._last_sig:
                try:
                    STORE.scan(report_new=True)
                except Exception:
                    pass

    def stop(self):
        self._stop.set()


# ---------------------------------------------------------------- HTTP API
def json_bytes(obj, code=200):
    return code, json.dumps(obj, ensure_ascii=False).encode("utf-8")


MIME = {".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
        ".js": "application/javascript; charset=utf-8", ".svg": "image/svg+xml",
        ".png": "image/png", ".ico": "image/x-icon", ".json": "application/json"}


_PICK_LOCK = threading.Lock()


def _pick_with_tk(initial=""):
    import tkinter as tk
    from tkinter import filedialog
    root = tk.Tk()
    root.withdraw()
    root.update_idletasks()
    # 置顶，避免对话框藏在原生窗口后面
    try:
        root.attributes("-topmost", True)
    except Exception:
        pass
    kwargs = {"title": "选择文件夹", "mustexist": True}
    if initial and os.path.isdir(initial):
        kwargs["initialdir"] = initial
    else:
        kwargs["initialdir"] = os.path.expanduser("~")
    try:
        chosen = filedialog.askdirectory(**kwargs)
    finally:
        root.destroy()
    return os.path.normpath(chosen) if chosen else ""


def _pick_with_powershell(initial=""):
    """不依赖 Tcl/Tk 的兜底通道：调用 Windows 自带的 Shell 文件夹选择框。"""
    import json
    import subprocess
    title = json.dumps("选择 SkillG 要纳入的文件夹", ensure_ascii=False)
    # 第四参数可直接给路径作为对话框根目录；标志：仅文件系统目录+可输入路径+新式对话框
    root = initial if initial and os.path.isdir(initial) else 17  # 17 = 此电脑
    root_arg = json.dumps(root) if isinstance(root, str) else str(root)
    ps = (
        "$ErrorActionPreference='Stop';"
        "$sh=New-Object -ComObject Shell.Application;"
        f"$d=$sh.BrowseForFolder(0,{title},0x51,{root_arg});"
        "if($d){[Console]::OutputEncoding=[Text.Encoding]::UTF8;"
        "[Console]::Out.Write($d.Self.Path)}"
    )
    r = subprocess.run(
        ["powershell", "-NoProfile", "-STA", "-Command", ps],
        capture_output=True, timeout=600)
    chosen = r.stdout.decode("utf-8", "replace").strip()
    return os.path.normpath(chosen) if chosen else ""


def pick_directory(initial=""):
    """弹出系统原生“选择文件夹”对话框，返回选中目录（取消则空串）。
    优先 tkinter；遇到裁剪版 Python（缺 Tcl/Tk）自动回退 PowerShell。"""
    try:
        return _pick_with_tk(initial)
    except Exception:
        return _pick_with_powershell(initial)


class Handler(BaseHTTPRequestHandler):
    server_version = "SkillG/1.0"

    def log_message(self, *a):
        pass

    def _send(self, payload, code=200, ctype="application/json; charset=utf-8"):
        if isinstance(payload, (dict, list)):
            body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        else:
            body = payload
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _body_json(self):
        n = int(self.headers.get("Content-Length", 0) or 0)
        if not n:
            return {}
        try:
            return json.loads(self.rfile.read(n).decode("utf-8"))
        except Exception:
            return {}

    # ---- GET ----
    def do_GET(self):
        u = urlparse(self.path)
        p, q = u.path, parse_qs(u.query)
        try:
            if p == "/api/state":
                return self._send(STORE.state_payload())
            if p == "/api/skill_detail":
                sid = (q.get("id") or [""])[0]
                d = STORE.skill_detail(sid)
                return self._send(d if d else {"error": "not found"},
                                  200 if d else 404)
            if p == "/api/pick_dir":
                # 同时只允许一个选择窗口
                if not _PICK_LOCK.acquire(blocking=False):
                    return self._send({"ok": False,
                                       "error": "文件夹选择窗口已打开，请先在弹窗中选择或取消"})
                try:
                    init = (q.get("initial") or [""])[0]
                    path = pick_directory(init)
                    return self._send({"ok": bool(path), "path": path})
                except Exception as e:
                    return self._send({"ok": False,
                                       "error": "无法打开系统文件夹选择器：%s" % e})
                finally:
                    try:
                        _PICK_LOCK.release()
                    except RuntimeError:
                        pass
            return self._static(p)
        except BrokenPipeError:
            pass
        except Exception as e:
            return self._send({"error": str(e)}, 500)

    def _static(self, p):
        if p in ("/", ""):
            p = "/index.html"
        rel = os.path.normpath(p.lstrip("/")).replace("\\", "/")
        if rel.startswith(".."):
            return self._send(b"forbidden", 403, "text/plain")
        fp = os.path.join(WEB_DIR, rel)
        if not os.path.isfile(fp):
            fp = os.path.join(WEB_DIR, "index.html")
        ext = os.path.splitext(fp)[1].lower()
        with open(fp, "rb") as f:
            body = f.read()
        return self._send(body, 200, MIME.get(ext, "application/octet-stream"))

    # ---- POST ----
    def do_POST(self):
        u = urlparse(self.path)
        p = u.path
        data = self._body_json()
        try:
            if p == "/api/rescan":
                r = STORE.scan(report_new=True)
                return self._send({"ok": True, **r, "state": STORE.state_payload()})
            if p == "/api/seen":
                STORE.recently_found = []
                return self._send({"ok": True})
            if p == "/api/set_category":
                ok = STORE.set_category(data.get("id", ""), data.get("category", "other"))
                return self._send({"ok": ok})
            if p == "/api/install":
                r = STORE.install(data.get("id", ""), data.get("agent_id", ""),
                                  bool(data.get("overwrite", True)))
                return self._send(r)
            if p == "/api/uninstall":
                r = STORE.uninstall(data.get("id", ""), data.get("agent_id", ""))
                return self._send(r)
            if p == "/api/open":
                path = data.get("path", "")
                if path and os.path.exists(path):
                    if os.path.isfile(path):
                        os.startfile(os.path.dirname(path))
                    else:
                        os.startfile(path)
                    return self._send({"ok": True})
                return self._send({"ok": False, "error": "路径不存在"})
            if p == "/api/add_agent":
                name, path = (data.get("name", "").strip(),
                              os.path.abspath(data.get("path", "").strip()))
                if not name or not path:
                    return self._send({"ok": False, "error": "名称和路径不能为空"})
                aid = "ag-" + hashlib.md5(path.encode("utf-8")).hexdigest()[:8]
                ags = STORE.config["agents"]
                if any(a["id"] == aid for a in ags):
                    return self._send({"ok": False, "error": "该目录已作为智能体存在"})
                ags.append({"id": aid, "name": name, "path": path})
                STORE.save_config()
                STORE.refresh_install_flags()
                return self._send({"ok": True})
            if p == "/api/del_agent":
                aid = data.get("id", "")
                STORE.config["agents"] = [a for a in STORE.config["agents"] if a["id"] != aid]
                STORE.save_config()
                STORE.refresh_install_flags()
                return self._send({"ok": True})
            if p == "/api/add_root":
                label, path = data.get("label", "").strip(), os.path.abspath(data.get("path", "").strip())
                if not label or not os.path.isdir(path):
                    return self._send({"ok": False, "error": "标签必填且路径必须是已存在的目录"})
                rid = "root-" + hashlib.md5(path.encode("utf-8")).hexdigest()[:8]
                if any(r["path"] == path for r in STORE.config["roots"]):
                    return self._send({"ok": False, "error": "该目录已在扫描列表中"})
                STORE.config["roots"].append({"id": rid, "label": label, "path": path})
                STORE.save_config()
                STORE.scan()
                return self._send({"ok": True})
            if p == "/api/del_root":
                rid = data.get("id", "")
                default_root_ids = {r["id"] for r in default_config()["roots"]}
                if rid in default_root_ids:
                    return self._send({"ok": False, "error": "内置来源不可删除，可忽略不看"})
                STORE.config["roots"] = [r for r in STORE.config["roots"] if r["id"] != rid]
                STORE.save_config()
                STORE.scan()
                return self._send({"ok": True})
            if p == "/api/set_watch":
                STORE.watching = bool(data.get("on", True))
                STORE.config["watch"] = STORE.watching
                STORE.save_config()
                return self._send({"ok": True, "watching": STORE.watching})
            return self._send({"error": "unknown api"}, 404)
        except Exception as e:
            return self._send({"ok": False, "error": str(e)}, 500)


def find_free_port(preferred=18765):
    import socket
    for port in [preferred] + list(range(18766, 18790)):
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        try:
            s.bind(("127.0.0.1", port))
            s.close()
            return port
        except OSError:
            s.close()
    return 0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--no-window", action="store_true", help="不尝试原生窗口，直接用浏览器打开")
    ap.add_argument("--scan-only", action="store_true")
    args = ap.parse_args()

    print("SkillG 正在扫描本地技能 ...")
    r = STORE.scan(report_new=False)
    print(f"扫描完成，共发现 {r['total']} 个技能")
    if args.scan_only:
        return

    port = find_free_port()
    # 首选端口被占说明已有一个 SkillG 在运行：直接唤起已有实例，不再开第二个
    if port != 18765:
        try:
            import urllib.request
            urllib.request.urlopen("http://127.0.0.1:18765/api/state", timeout=1).read()
            webbrowser.open("http://127.0.0.1:18765")
            print("检测到已有实例运行，已唤起原有窗口")
            return
        except Exception:
            pass
    httpd = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    url = f"http://127.0.0.1:{port}"
    print(f"服务已启动：{url}")

    watcher = Watcher()
    watcher.start()

    if not args.no_window:
        try:
            import webview  # type: ignore
            window = webview.create_window("SkillG · 技能库管理器", url,
                                           width=1280, height=840, min_size=(1040, 680))
            webview.start()
            return
        except Exception:
            import traceback
            print("原生窗口启动失败，回退到浏览器模式：")
            traceback.print_exc()
    webbrowser.open(url)
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        httpd.shutdown()


if __name__ == "__main__":
    main()
