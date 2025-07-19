import type { Asset, Relationship } from './types';

export const mockAssets: Asset[] = [
  {
    id: 'i-0123456789abcdef0',
    type: 'EC2Instance',
    name: 'web-server-01',
    metadata: {
      region: 'us-east-1',
      ip: '192.0.2.1',
      instanceType: 't2.micro',
      state: 'running',
    },
    riskScore: 0.7,
    tags: ['web', 'production'],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'i-abcdef01234567890',
    type: 'EC2Instance',
    name: 'db-server-01',
    metadata: {
      region: 'us-east-1',
      ip: '192.0.2.2',
      instanceType: 'm5.large',
      state: 'running',
    },
    riskScore: 0.4,
    tags: ['database', 'production'],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'user-001',
    type: 'IAMUser',
    name: 'dev-admin',
    metadata: {
      arn: 'arn:aws:iam::123456789012:user/dev-admin',
      groups: ['developers', 'admins'],
    },
    riskScore: 0.9,
    tags: ['admin-access'],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'vpc-01',
    type: 'VPC',
    name: 'main-vpc',
    metadata: {
      cidrBlock: '10.0.0.0/16',
      region: 'us-east-1',
    },
    riskScore: 0.2,
    tags: ['networking', 'core'],
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sg-web',
    type: 'SecurityGroup',
    name: 'web-access-sg',
    metadata: {
      description: 'Allows HTTP and HTTPS access',
      inboundRules: [
        { protocol: 'tcp', port: 80, source: '0.0.0.0/0' },
        { protocol: 'tcp', port: 443, source: '0.0.0.0/0' },
      ],
    },
    riskScore: 0.8,
    tags: ['security', 'web'],
    updatedAt: new Date().toISOString(),
  },
   {
    id: 'sg-db',
    type: 'SecurityGroup',
    name: 'db-access-sg',
    metadata: {
      description: 'Allows DB access from web servers',
      inboundRules: [
        { protocol: 'tcp', port: 5432, source: 'sg-web' },
      ],
    },
    riskScore: 0.3,
    tags: ['security', 'database'],
    updatedAt: new Date().toISOString(),
  },
];

export const mockRelationships: Relationship[] = [
  {
    id: 'rel-1',
    from: 'i-0123456789abcdef0',
    to: 'vpc-01',
    type: 'resides_in',
    discoveredBy: 'scan',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rel-2',
    from: 'i-abcdef01234567890',
    to: 'vpc-01',
    type: 'resides_in',
    discoveredBy: 'scan',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rel-3',
    from: 'i-0123456789abcdef0',
    to: 'sg-web',
    type: 'member_of',
    discoveredBy: 'scan',
    createdAt: new Date().toISOString(),
  },
   {
    id: 'rel-4',
    from: 'i-abcdef01234567890',
    to: 'sg-db',
    type: 'member_of',
    discoveredBy: 'scan',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rel-5',
    from: 'user-001',
    to: 'i-0123456789abcdef0',
    type: 'can_access',
    discoveredBy: 'ai',
    createdAt: new Date().toISOString(),
  },
   {
    id: 'rel-6',
    from: 'sg-web',
    to: 'sg-db',
    type: 'allows_traffic_to',
    discoveredBy: 'scan',
    createdAt: new Date().toISOString(),
  },
];
