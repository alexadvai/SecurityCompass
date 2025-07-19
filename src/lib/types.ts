import { type InferPotentialRiskOutput } from "@/ai/flows/infer-potential-risk";

export interface Asset {
  id: string;
  type: "EC2Instance" | "IAMUser" | "VPC" | "SecurityGroup" | string;
  name: string;
  metadata: Record<string, any>;
  riskScore: number;
  tags: string[];
  updatedAt: string;
}

export interface Relationship {
  id: string;
  from: string;
  to: string;
  type: "uses" | "connected_to" | "depends_on" | string;
  discoveredBy: "scan" | "ai";
  createdAt: string;
}

export type AIInsight = InferPotentialRiskOutput[0];
