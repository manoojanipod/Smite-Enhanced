// frontend/src/api/tunnels.ts
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 15000,
});

export type TunnelCore = "xray" | "rathole" | "hysteria2" | "wireguard" | string;

export interface TunnelSpec {
  // Hysteria2
  port?: number;
  password?: string;
  up?: string;
  down?: string;

  // WireGuard
  cidr?: string;
  peers?: number;
  dns?: string;
  allowed_ips?: string;

  // سایر فیلدهای دلخواه
  [key: string]: any;
}

export interface Tunnel {
  id: string;
  name: string;
  core: TunnelCore;
  type: string;
  node_id: string | null;
  spec: TunnelSpec;
  status: string;
  error_message?: string | null;
  revision: number;
  created_at: string;
  updated_at: string;
}

export interface CreateTunnelPayload {
  name: string;
  core: TunnelCore;
  type: string;
  node_id: string | null;
  spec: TunnelSpec;
}

export async function listTunnels(): Promise<Tunnel[]> {
  const res = await api.get<Tunnel[]>("/tunnels");
  return res.data;
}

export async function createTunnel(payload: CreateTunnelPayload): Promise<Tunnel> {
  const res = await api.post<Tunnel>("/tunnels", payload);
  return res.data;
}

export async function deleteTunnel(id: string): Promise<void> {
  await api.delete(`/tunnels/${id}`);
}
