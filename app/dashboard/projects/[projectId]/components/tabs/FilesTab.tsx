"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  File,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Loader2,
  FileCode,
  Copy,
  Check,
  Search,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Types ───────────────────────────────────────────────────────────
type RepoFile = {
  _id: string;
  path: string;
  language?: string;
  size?: number;
  lastCommitSha?: string;
};

type TreeNode = {
  name: string;
  path: string;
  type: "file" | "folder";
  language?: string;
  size?: number;
  children: TreeNode[];
};

// ─── Helpers ─────────────────────────────────────────────────────────
const LANG_COLORS: Record<string, string> = {
  ts: "text-blue-400",
  tsx: "text-blue-400",
  js: "text-yellow-400",
  jsx: "text-yellow-400",
  py: "text-green-400",
  rb: "text-red-400",
  go: "text-cyan-400",
  rs: "text-orange-400",
  java: "text-orange-500",
  css: "text-pink-400",
  scss: "text-pink-400",
  html: "text-orange-400",
  json: "text-amber-400",
  md: "text-muted-foreground",
  yml: "text-purple-400",
  yaml: "text-purple-400",
};

function getExtension(path: string): string {
  const parts = path.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
}

function formatSize(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Build a tree structure from flat file paths */
function buildTree(files: RepoFile[]): TreeNode[] {
  const root: TreeNode[] = [];

  for (const file of files) {
    const parts = file.path.split("/");
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const name = parts[i];
      const isFile = i === parts.length - 1;
      const pathSoFar = parts.slice(0, i + 1).join("/");

      let existing = current.find((n) => n.name === name);

      if (!existing) {
        existing = {
          name,
          path: pathSoFar,
          type: isFile ? "file" : "folder",
          language: isFile ? file.language || getExtension(file.path) : undefined,
          size: isFile ? file.size : undefined,
          children: [],
        };
        current.push(existing);
      }

      current = existing.children;
    }
  }

  // Sort: folders first, then alphabetical
  const sortNodes = (nodes: TreeNode[]): TreeNode[] => {
    return nodes
      .sort((a, b) => {
        if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
        return a.name.localeCompare(b.name);
      })
      .map((n) => ({ ...n, children: sortNodes(n.children) }));
  };

  return sortNodes(root);
}

// ─── Tree Item Component ─────────────────────────────────────────────
function TreeItem({
  node,
  depth,
  expanded,
  selected,
  onToggle,
  onSelect,
}: {
  node: TreeNode;
  depth: number;
  expanded: Set<string>;
  selected: string | null;
  onToggle: (path: string) => void;
  onSelect: (path: string) => void;
}) {
  const isFolder = node.type === "folder";
  const isOpen = expanded.has(node.path);
  const isSelected = selected === node.path;
  const ext = getExtension(node.name);
  const langColor = LANG_COLORS[ext] || "text-muted-foreground";

  return (
    <>
      <button
        onClick={() => {
          if (isFolder) {
            onToggle(node.path);
          } else {
            onSelect(node.path);
          }
        }}
        className={`
          flex items-center gap-1.5 w-full text-left px-2 py-1.5 rounded-md text-[12.5px]
          transition-colors duration-100 group
          ${isSelected
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }
        `}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {/* Chevron for folders */}
        {isFolder ? (
          isOpen ? (
            <ChevronDown className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
          )
        ) : (
          <span className="w-3.5" />
        )}

        {/* Icon */}
        {isFolder ? (
          isOpen ? (
            <FolderOpen className="w-4 h-4 shrink-0 text-amber-400" />
          ) : (
            <Folder className="w-4 h-4 shrink-0 text-amber-400" />
          )
        ) : (
          <FileCode className={`w-4 h-4 shrink-0 ${langColor}`} />
        )}

        {/* Name */}
        <span className="truncate flex-1">{node.name}</span>

        {/* Size badge for files */}
        {!isFolder && node.size && (
          <span className="text-[10px] text-muted-foreground/60 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            {formatSize(node.size)}
          </span>
        )}
      </button>

      {/* Children */}
      {isFolder && isOpen && (
        <div>
          {node.children.map((child) => (
            <TreeItem
              key={child.path}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              selected={selected}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </>
  );
}

// ─── Main Component ──────────────────────────────────────────────────
export default function FilesTab({ projectId }: { projectId: string }) {
  const [files, setFiles] = useState<RepoFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState("");

  // Fetch file list
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/files`);
        if (!res.ok) throw new Error();
        const data: RepoFile[] = await res.json();
        setFiles(data);

        // Auto-expand root-level folders
        const rootFolders = new Set<string>();
        data.forEach((f) => {
          const first = f.path.split("/")[0];
          if (f.path.includes("/")) rootFolders.add(first);
        });
        setExpanded(rootFolders);
      } catch (err) {
        console.error("Failed to load files", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, [projectId]);

  // Fetch file content when selected
  useEffect(() => {
    if (!selectedPath) {
      setFileContent(null);
      return;
    }
    const fetchContent = async () => {
      setContentLoading(true);
      try {
        const res = await fetch(
          `/api/projects/${projectId}/files/content?path=${encodeURIComponent(selectedPath)}`
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        setFileContent(data.content || "// No content available");
      } catch {
        setFileContent("// Failed to load file content");
      } finally {
        setContentLoading(false);
      }
    };
    fetchContent();
  }, [projectId, selectedPath]);

  const tree = useMemo(() => buildTree(files), [files]);

  const filteredTree = useMemo(() => {
    if (!search.trim()) return tree;
    const q = search.toLowerCase();
    const matchingFiles = files.filter((f) => f.path.toLowerCase().includes(q));
    return buildTree(matchingFiles);
  }, [tree, files, search]);

  const toggleFolder = useCallback((path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  const copyContent = async () => {
    if (!fileContent) return;
    try {
      await navigator.clipboard.writeText(fileContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  // ─── Loading ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-full">
        <div className="w-64 border-r p-3 space-y-2">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-7 w-full rounded" />
          ))}
        </div>
        <div className="flex-1 p-6 space-y-3">
          <Skeleton className="h-5 w-48" />
          {[...Array(12)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // ─── Empty state ──────────────────────────────────────────────────
  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-12">
        <div className="rounded-full bg-muted p-4 mb-4">
          <File className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">No files synced</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Files will appear here once the repository has been ingested. Try syncing the repository first.
        </p>
      </div>
    );
  }

  const ext = selectedPath ? getExtension(selectedPath) : "";
  const langColor = LANG_COLORS[ext] || "text-muted-foreground";

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── File Tree Sidebar ── */}
      <div className="w-64 shrink-0 border-r flex flex-col bg-card/50">
        {/* Search */}
        <div className="p-2 border-b">
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-muted/50 border border-border text-sm">
            <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Search files…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-[12px] placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        {/* Tree */}
        <ScrollArea className="flex-1">
          <div className="py-1.5 px-1">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest px-3 py-1.5">
              Explorer
            </p>
            {filteredTree.map((node) => (
              <TreeItem
                key={node.path}
                node={node}
                depth={0}
                expanded={expanded}
                selected={selectedPath}
                onToggle={toggleFolder}
                onSelect={setSelectedPath}
              />
            ))}
          </div>
        </ScrollArea>

        {/* File count */}
        <div className="px-3 py-2 border-t text-[10.5px] text-muted-foreground">
          {files.length} file{files.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* ── Code Viewer ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedPath ? (
          <>
            {/* File header */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b bg-card/30 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <FileCode className={`w-4 h-4 shrink-0 ${langColor}`} />
                <span className="text-[12.5px] font-medium truncate">
                  {selectedPath}
                </span>
                {ext && (
                  <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono text-muted-foreground shrink-0">
                    {ext}
                  </span>
                )}
              </div>
              <button
                onClick={copyContent}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] text-muted-foreground hover:bg-muted transition-colors shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-green-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy
                  </>
                )}
              </button>
            </div>

            {/* Code content */}
            {contentLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ScrollArea className="flex-1">
                <pre className="p-4 text-[12.5px] leading-6 font-mono whitespace-pre overflow-x-auto">
                  <code>
                    {fileContent?.split("\n").map((line, i) => (
                      <div
                        key={i}
                        className="flex hover:bg-muted/30 transition-colors -mx-4 px-4"
                      >
                        <span className="w-10 shrink-0 text-right pr-4 text-muted-foreground/40 select-none tabular-nums">
                          {i + 1}
                        </span>
                        <span className="flex-1">{line || " "}</span>
                      </div>
                    ))}
                  </code>
                </pre>
              </ScrollArea>
            )}
          </>
        ) : (
          /* No file selected */
          <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground gap-3">
            <div className="rounded-full bg-muted p-3">
              <FileCode className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium">Select a file to view</p>
              <p className="text-xs mt-1">
                Browse the tree on the left to explore the codebase
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}