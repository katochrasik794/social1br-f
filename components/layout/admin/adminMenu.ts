import {
  Copy,
  Layers,
  Network,
  LayoutDashboard,
  Users,
  Settings,
  Server,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type AdminMenuItem = {
  icon: LucideIcon;
  label: string;
  to: string;
  children?: { label: string; to: string }[];
};

export type AdminMenuSection = {
  label: string;
  items: AdminMenuItem[];
};

export const ADMIN_MENU: AdminMenuSection[] = [
  {
    label: "OVERVIEW",
    items: [{ icon: LayoutDashboard, label: "Dashboard", to: "dashboard" }],
  },
  {
    label: "SOCIAL TRADING",
    items: [
      {
        icon: Copy,
        label: "Copier",
        to: "copier/copiers",
        children: [
          { label: "Copiers", to: "copier/copiers" },
          { label: "Masters", to: "copier/masters" },
          { label: "Copier Settings", to: "copier/settings" },
        ],
      },
      {
        icon: Layers,
        label: "PAMM",
        to: "pamm/investors",
        children: [
          { label: "Investors", to: "pamm/investors" },
          { label: "Managers", to: "pamm/managers" },
          { label: "PAMM Settings", to: "pamm/settings" },
        ],
      },
      {
        icon: Network,
        label: "MAM",
        to: "mam/investors",
        children: [
          { label: "Investors", to: "mam/investors" },
          { label: "Managers", to: "mam/managers" },
          { label: "MAM Settings", to: "mam/settings" },
        ],
      },
    ],
  },
  {
    label: "MT5 MANAGEMENT",
    items: [
      {
        icon: Server,
        label: "MT5 Management",
        to: "mt5/groups",
        children: [
          { label: "Group Management", to: "mt5/groups" },
          { label: "Manager Connection", to: "mt5/manager" },
        ],
      },
    ],
  },
];

export const ADMIN_ICONS = { Copy, Layers, Network, LayoutDashboard, Users, Settings, Server };
