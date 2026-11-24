import { defineCollection, z } from 'astro:content';

const writeupsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.string(),
    category: z.enum([
      'DFIR',
      'Memory Forensics',
      'Network Forensics',
      'Threat Hunting',
      'Malware Analysis',
      'SOC Labs',
      'CTF Challenge',
      'Active Directory Defense'
    ]),
    platform: z.enum([
      'CyberDefenders',
      'HackTheBox',
      'TryHackMe',
      'LetsDefend',
      'CTF Event',
      'Custom Lab'
    ]),
    difficulty: z.enum(['Easy', 'Medium', 'Hard', 'Insane']),
    tags: z.array(z.string()),
    artifacts: z.array(z.string()).optional(),
    mitreAttck: z.array(z.string()).optional(),
    verdict: z.string().optional(),
    flag: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

export const collections = {
  'writeups': writeupsCollection,
};
