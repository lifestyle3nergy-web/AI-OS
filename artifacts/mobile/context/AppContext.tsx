import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

export interface SystemStatus {
  cpu: number;
  ram: number;
  battery: number;
  storage: { used: number; total: number };
  network: { upload: number; download: number };
  aiStatus: "active" | "idle" | "processing";
  runningAgents: string[];
  workflowQueue: number;
  recentActivity: { id: string; action: string; time: string; type: string }[];
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: "running" | "idle" | "stopped" | "error";
  capabilities: string[];
  tasksCompleted: number;
  uptime: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "pending" | "completed" | "paused";
  createdAt: string;
  updatedAt: string;
  progress: number;
  tags: string[];
}

export interface MemoryEntry {
  id: string;
  content: string;
  category: string;
  timestamp: string;
  importance: "low" | "medium" | "high";
}

export interface Automation {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  trigger: string;
  lastRun: string;
  runCount: number;
}

const INITIAL_AGENTS: Agent[] = [
  {
    id: "1",
    name: "PAI Core",
    description: "Central orchestration and reasoning engine",
    status: "running",
    capabilities: ["planning", "reasoning", "tool_calling"],
    tasksCompleted: 142,
    uptime: "3d 14h",
  },
  {
    id: "2",
    name: "Research Agent",
    description: "Automated web research and data synthesis",
    status: "idle",
    capabilities: ["web_search", "summarization", "citation"],
    tasksCompleted: 87,
    uptime: "1d 6h",
  },
  {
    id: "3",
    name: "Memory Agent",
    description: "Long-term knowledge storage and retrieval",
    status: "idle",
    capabilities: ["storage", "retrieval", "indexing"],
    tasksCompleted: 231,
    uptime: "5d 2h",
  },
  {
    id: "4",
    name: "Automation Agent",
    description: "Task scheduling and workflow automation",
    status: "running",
    capabilities: ["scheduling", "triggers", "pipelines"],
    tasksCompleted: 56,
    uptime: "2d 9h",
  },
  {
    id: "5",
    name: "Energy Agent",
    description: "Lifestyle energy optimization and tracking",
    status: "idle",
    capabilities: ["tracking", "analysis", "recommendations"],
    tasksCompleted: 34,
    uptime: "12h",
  },
  {
    id: "6",
    name: "Content Agent",
    description: "Content creation and editing assistance",
    status: "stopped",
    capabilities: ["writing", "editing", "formatting"],
    tasksCompleted: 19,
    uptime: "—",
  },
  {
    id: "7",
    name: "Device Optimizer",
    description: "System performance and resource management",
    status: "running",
    capabilities: ["optimization", "monitoring", "tuning"],
    tasksCompleted: 78,
    uptime: "4d 1h",
  },
];

const INITIAL_PROJECTS: Project[] = [
  {
    id: "1",
    name: "Lifestyle Energy Dashboard",
    description: "Comprehensive energy tracking and optimization system",
    status: "active",
    createdAt: "2025-06-01",
    updatedAt: "2025-07-01",
    progress: 72,
    tags: ["energy", "tracking", "health"],
  },
  {
    id: "2",
    name: "Research Automation Pipeline",
    description: "Automated research synthesis and report generation",
    status: "active",
    createdAt: "2025-06-15",
    updatedAt: "2025-06-30",
    progress: 45,
    tags: ["research", "automation", "ai"],
  },
  {
    id: "3",
    name: "Memory Architecture v2",
    description: "Next-gen hierarchical memory system for PAI",
    status: "pending",
    createdAt: "2025-07-01",
    updatedAt: "2025-07-01",
    progress: 10,
    tags: ["memory", "architecture"],
  },
];

const INITIAL_AUTOMATIONS: Automation[] = [
  {
    id: "1",
    name: "Daily Research Digest",
    description: "Compile and summarize top research papers daily at 8am",
    enabled: true,
    trigger: "Daily 08:00",
    lastRun: "Today 08:00",
    runCount: 47,
  },
  {
    id: "2",
    name: "Energy Check-in",
    description: "Log and analyze energy levels every 4 hours",
    enabled: true,
    trigger: "Every 4h",
    lastRun: "2h ago",
    runCount: 312,
  },
  {
    id: "3",
    name: "Memory Consolidation",
    description: "Merge and index new memories into long-term storage",
    enabled: false,
    trigger: "Daily 02:00",
    lastRun: "Yesterday 02:00",
    runCount: 31,
  },
  {
    id: "4",
    name: "Project Status Update",
    description: "Generate weekly project progress reports",
    enabled: true,
    trigger: "Weekly Mon 09:00",
    lastRun: "Jun 30",
    runCount: 8,
  },
];

const ACTIVITY_TEMPLATES = [
  { action: "PAI Core completed planning task", type: "agent" },
  { action: "Memory Agent indexed 3 new entries", type: "memory" },
  { action: "Research Agent found 5 relevant papers", type: "research" },
  { action: "Automation pipeline executed successfully", type: "automation" },
  { action: "Device optimization reduced CPU by 12%", type: "system" },
  { action: "Energy Agent logged daily metrics", type: "energy" },
  { action: "Project milestone reached: 75%", type: "project" },
];

function generateStatus(): SystemStatus {
  const runningAgentNames = ["PAI Core", "Automation Agent", "Device Optimizer"];
  const activity = ACTIVITY_TEMPLATES.slice(0, 5).map((t, i) => ({
    id: String(i),
    action: t.action,
    time: i === 0 ? "just now" : `${i * 3}m ago`,
    type: t.type,
  }));

  return {
    cpu: Math.round(20 + Math.random() * 50),
    ram: Math.round(35 + Math.random() * 40),
    battery: Math.round(60 + Math.random() * 35),
    storage: { used: Math.round(45 + Math.random() * 20), total: 128 },
    network: {
      upload: Math.round(1 + Math.random() * 30),
      download: Math.round(10 + Math.random() * 150),
    },
    aiStatus: Math.random() > 0.3 ? "active" : "processing",
    runningAgents: runningAgentNames,
    workflowQueue: Math.round(Math.random() * 5),
    recentActivity: activity,
  };
}

interface AppContextValue {
  systemStatus: SystemStatus;
  agents: Agent[];
  projects: Project[];
  memories: MemoryEntry[];
  automations: Automation[];
  updateAgentStatus: (id: string, status: Agent["status"]) => void;
  addProject: (project: Omit<Project, "id" | "createdAt" | "updatedAt">) => void;
  deleteProject: (id: string) => void;
  toggleAutomation: (id: string) => void;
  addMemory: (entry: Omit<MemoryEntry, "id" | "timestamp">) => void;
  deleteMemory: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const PROJECTS_KEY = "@aios_projects";
const MEMORIES_KEY = "@aios_memories";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [systemStatus, setSystemStatus] = useState<SystemStatus>(generateStatus());
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [automations, setAutomations] = useState<Automation[]>(INITIAL_AUTOMATIONS);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(PROJECTS_KEY).then((data) => {
      if (data) setProjects(JSON.parse(data));
    });
    AsyncStorage.getItem(MEMORIES_KEY).then((data) => {
      if (data) setMemories(JSON.parse(data));
    });
  }, []);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSystemStatus(generateStatus());
    }, 2500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const saveProjects = useCallback((updated: Project[]) => {
    setProjects(updated);
    AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(updated));
  }, []);

  const saveMemories = useCallback((updated: MemoryEntry[]) => {
    setMemories(updated);
    AsyncStorage.setItem(MEMORIES_KEY, JSON.stringify(updated));
  }, []);

  const updateAgentStatus = useCallback((id: string, status: Agent["status"]) => {
    setAgents((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  }, []);

  const addProject = useCallback(
    (project: Omit<Project, "id" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString().split("T")[0];
      const newProject: Project = {
        ...project,
        id: Date.now().toString(),
        createdAt: now,
        updatedAt: now,
      };
      saveProjects([newProject, ...projects]);
    },
    [projects, saveProjects]
  );

  const deleteProject = useCallback(
    (id: string) => {
      saveProjects(projects.filter((p) => p.id !== id));
    },
    [projects, saveProjects]
  );

  const toggleAutomation = useCallback((id: string) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  }, []);

  const addMemory = useCallback(
    (entry: Omit<MemoryEntry, "id" | "timestamp">) => {
      const newEntry: MemoryEntry = {
        ...entry,
        id: Date.now().toString(),
        timestamp: new Date().toLocaleString(),
      };
      saveMemories([newEntry, ...memories]);
    },
    [memories, saveMemories]
  );

  const deleteMemory = useCallback(
    (id: string) => {
      saveMemories(memories.filter((m) => m.id !== id));
    },
    [memories, saveMemories]
  );

  return (
    <AppContext.Provider
      value={{
        systemStatus,
        agents,
        projects,
        memories,
        automations,
        updateAgentStatus,
        addProject,
        deleteProject,
        toggleAutomation,
        addMemory,
        deleteMemory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
