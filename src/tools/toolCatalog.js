import { Key, Globe, FileSearch, Radio, Cpu, BookOpen, Flag } from 'lucide-react';

export const TOOL_CATALOG = [
  // ── 1. Cryptography (17 Tools) ─────────────────────────────────
  {
    id: 'decoder',
    title: 'Multi Decoder',
    category: 'crypto',
    categoryLabel: 'Cryptography',
    description: 'Instant multi-format string decoding across Base64, Hex, URL, Binary, ROT13, Atbash, and ASCII.',
    badge: 'Java Engine',
    icon: 'Key'
  },
  {
    id: 'xor',
    title: 'XOR Toolkit',
    category: 'crypto',
    categoryLabel: 'Cryptography',
    description: 'Single-byte brute force XOR cracker, key repeating XOR, and multi-encoding decryptor.',
    badge: 'Java Engine',
    icon: 'Key'
  },
  {
    id: 'hash',
    title: 'Hash Utils',
    category: 'crypto',
    categoryLabel: 'Cryptography',
    description: 'Multi-algorithm hasher (MD5, SHA1, SHA256, SHA512, NTLM) with hash type heuristics.',
    badge: 'Java Engine',
    icon: 'Key'
  },
  {
    id: 'encoding',
    title: 'Encoding Lab',
    category: 'crypto',
    categoryLabel: 'Cryptography',
    description: 'Advanced radix encoding: Base32, Base58, Base64, Base85, Ascii85, and Hex.',
    badge: 'Java Engine',
    icon: 'Key'
  },
  {
    id: 'number',
    title: 'Number Converter',
    category: 'crypto',
    categoryLabel: 'Cryptography',
    description: 'Radix conversions: Decimal, Hexadecimal, Octal, Binary, ASCII, and IEEE-754 floating point.',
    badge: 'Java Engine',
    icon: 'Key'
  },
  {
    id: 'rsa-helper',
    title: 'RSA Helper',
    category: 'crypto',
    categoryLabel: 'Cryptography',
    description: 'Compute RSA keys and parameters: N = p * q, phi(N), and private exponent d.',
    badge: 'Java Engine',
    icon: 'Key'
  },
  {
    id: 'atbash',
    title: 'Atbash Cipher',
    category: 'crypto',
    categoryLabel: 'Cryptography',
    description: 'Classic reverse-alphabet monoalphabetic substitution cipher encryptor/decryptor.',
    badge: 'Java Engine',
    icon: 'Key'
  },
  {
    id: 'railfence',
    title: 'Rail Fence Cipher',
    category: 'crypto',
    categoryLabel: 'Cryptography',
    description: 'Transposition zig-zag cipher encryptor and decryptor with dynamic rail count and offset.',
    badge: 'Java Engine',
    icon: 'Key'
  },
  {
    id: 'baconian',
    title: 'Baconian Cipher',
    category: 'crypto',
    categoryLabel: 'Cryptography',
    description: '5-letter binary steganographic substitution cipher (Standard and full 26-letter variant).',
    badge: 'Java Engine',
    icon: 'Key'
  },
  {
    id: 'bitwise',
    title: 'Bitwise Calculator',
    category: 'crypto',
    categoryLabel: 'Cryptography',
    description: 'Interactive visual bitwise operator sandbox (AND, OR, XOR, NOT, shifts, circular rotates).',
    badge: 'Java Engine',
    icon: 'Key'
  },
  {
    id: 'rsa-attack',
    title: 'RSA Attack Lab',
    category: 'crypto',
    categoryLabel: 'Cryptography',
    description: "Wiener's low private exponent attack, Fermat prime factorizer, and Hastad broadcast attack.",
    badge: 'Java Engine',
    icon: 'Key'
  },
  {
    id: 'vigenere',
    title: 'Vigenère Solver',
    category: 'crypto',
    categoryLabel: 'Cryptography',
    description: 'Polyalphabetic cipher solver with automated Index of Coincidence (IoC) key length deduction.',
    badge: 'Java Engine',
    icon: 'Key'
  },
  {
    id: 'padding-oracle',
    title: 'Padding Oracle Sim',
    category: 'crypto',
    categoryLabel: 'Cryptography',
    description: 'Interactive CBC byte-by-byte padding oracle decryption stepping visualizer (PKCS#7).',
    badge: 'Java Engine',
    icon: 'Key'
  },
  {
    id: 'substitution',
    title: 'Substitution Solver',
    category: 'crypto',
    categoryLabel: 'Cryptography',
    description: 'Monoalphabetic cipher solver with n-gram frequency analysis and interactive key-mapping.',
    badge: 'Java Engine',
    icon: 'Key'
  },
  {
    id: 'discrete-log',
    title: 'Discrete Log Solver',
    category: 'crypto',
    categoryLabel: 'Cryptography',
    description: 'Baby-step Giant-step / Pohlig-Hellman discrete logarithm solver for g^x = h (mod p).',
    badge: 'Java Engine',
    icon: 'Key'
  },
  {
    id: 'crib-drag',
    title: 'Crib Dragging Cracker',
    category: 'crypto',
    categoryLabel: 'Cryptography',
    description: 'Two-time pad (one-time pad reuse) ciphertext solver dragging known plaintext cribs.',
    badge: 'Java Engine',
    icon: 'Key'
  },
  {
    id: 'rot-table',
    title: 'Caesar 25-Shift Table',
    category: 'crypto',
    categoryLabel: 'Cryptography',
    description: 'Simultaneous 25-rotation Caesar shift inspector for instant human plaintext recognition.',
    badge: 'Java Engine',
    icon: 'Key'
  },

  // ── 2. Web Exploitation (8 Tools) ──────────────────────────────
  {
    id: 'jwt-analyzer',
    title: 'JWT Analyzer & Exploit Lab',
    category: 'web',
    categoryLabel: 'Web Exploitation',
    description: 'Token inspector, signature tamper, "none" algorithm exploit generator, and HMAC secret dictionary brute-forcer.',
    badge: 'Java Engine',
    icon: 'Globe'
  },

  // ── 4. Network & OSINT (5 Tools) ──────────────────────────────
  {
    id: 'network-calc',
    title: 'CIDR Subnet Calculator',
    category: 'osint',
    categoryLabel: 'Network & OSINT',
    description: 'Server-side IPv4 & IPv6 CIDR subnet calculator, wildcard generator, binary bitmask breakdown, and host range analyzer.',
    badge: 'Java Engine',
    icon: 'Radio'
  },
  {
    id: 'wordlists-ref',
    title: 'Wordlists & Cheat Sheets',
    category: 'osint',
    categoryLabel: 'Network & OSINT',
    description: 'Curated penetration testing wordlists catalog, SecLists, Kali Linux system paths, and dynamic ffuf / gobuster command compiler.',
    badge: 'Java Engine',
    icon: 'Radio'
  },
  {
    id: 'osint-workspace',
    title: 'OSINT Multi-Target Workspace',
    category: 'osint',
    categoryLabel: 'Network & OSINT',
    description: 'Server-side OSINT query compiler for Shodan, Censys, VirusTotal, crt.sh, Google Dorks, and threat intelligence aggregators.',
    badge: 'Java Engine',
    icon: 'Radio'
  },

  // ── 7. Workspace (7 Tools) ─────────────────────────────────────
  {
    id: 'notes',
    title: 'Notes & Scratchpad',
    category: 'workspace',
    categoryLabel: 'Workspace & Notes',
    description: 'Persistent cloud-synced operator challenge notes with tags, pins, and debounced auto-save.',
    badge: 'Java Engine',
    icon: 'Flag'
  },
  {
    id: 'flaghunter',
    title: 'Flag Hunter',
    category: 'workspace',
    categoryLabel: 'Workspace & Notes',
    description: 'Automated heuristic scanner searching for CTF flags across all tool outputs with MongoDB sync.',
    badge: 'Java Engine',
    icon: 'Flag'
  }
];

export const CATEGORY_URL_SLUGS = {
  crypto: 'cryptography',
  web: 'web',
  forensics: 'forensics',
  osint: 'osint',
  pwn: 'pwn',
  workspace: 'workspace',
  reference: 'reference',
  all: 'tools'
};

export const SLUG_TO_CATEGORY = {
  cryptography: 'crypto',
  cryptograpy: 'crypto',
  crypto: 'crypto',
  web: 'web',
  forensics: 'forensics',
  forensic: 'forensics',
  stego: 'forensics',
  osint: 'osint',
  network: 'osint',
  pwn: 'pwn',
  reverse: 'pwn',
  binary: 'pwn',
  workspace: 'workspace',
  notes: 'workspace',
  reference: 'reference',
  cheatsheets: 'reference',
  cheatsheet: 'reference',
  tools: 'all',
  all: 'all'
};

export function getToolUrl(toolOrId) {
  const tool = typeof toolOrId === 'string'
    ? TOOL_CATALOG.find((t) => t.id === toolOrId)
    : toolOrId;
  if (!tool) return `/tools/${toolOrId}`;
  const slug = CATEGORY_URL_SLUGS[tool.category] || tool.category;
  return `/${slug}/${tool.id}`;
}
