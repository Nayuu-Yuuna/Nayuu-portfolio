---
title: "CyberDefenders - RedLine: Memory Forensics with Volatility 3"
description: "In-depth investigation of an infected endpoint memory dump to trace a Cobalt Strike beacon, analyze memory injection, and extract C2 configuration."
publishDate: "2026-03-12"
category: "Memory Forensics"
platform: "CyberDefenders"
difficulty: "Medium"
tags: ["volatility3", "memory-dump", "cobalt-strike", "dll-injection", "process-hollowing"]
artifacts: ["redline-memory.raw", "volatility-output.txt"]
mitreAttck: ["T1055 (Process Injection)", "T1071.001 (Web Protocols)", "T1059.001 (PowerShell)"]
verdict: "Cobalt Strike Beacon Injected into svchost.exe communicating with 192.168.1.100"
flag: "FLAG{c0balt_str1ke_m4lfind_svch0st_pwned}"
featured: true
---

## 1. Scenario & Investigation Brief

An endpoint alert triggered regarding suspicious outbound traffic on port 443 from a workstation. The SOC acquired a volatile RAM dump (`redline-memory.raw`) using DumpIt before taking the host offline.

Our objective as Blue Team / DFIR analysts:
1. Identify the rogue process executing in memory.
2. Determine if process injection or hollowed code was utilized.
3. Extract C2 server IP, user-agent, and sleep jitter configurations.
4. Document full timeline and write a Sigma/YARA detection rule.

---

## 2. Process Tree Analysis

We initialize our analysis using Volatility 3's `windows.pstree` plugin:

```bash
python3 vol.py -f redline-memory.raw windows.pstree
```

### Observation:
```text
PID     PPID    ImageFileName           CreateTime
------------------------------------------------------------
4       0       System                  2026-03-12 08:00:10
...
4312    628     explorer.exe            2026-03-12 08:02:15
 \_ 5120 4312   powershell.exe          2026-03-12 08:14:30
     \_ 5892 5120 svchost.exe           2026-03-12 08:15:02
```

> **Anomaly Flagged**: `svchost.exe` (PID 5892) has a parent PID of `5120` (`powershell.exe`). In legitimate Windows environments, `svchost.exe` should strictly be spawned by `services.exe`.

---

## 3. Detecting Code Injection (`windows.malfind`)

To verify if `svchost.exe` was spawned as a hollowed shell, we run `malfind`:

```bash
python3 vol.py -f redline-memory.raw windows.malfind --pid 5892
```

### Output:
```text
Process: svchost.exe Pid: 5892 Address: 0x2210000
Vad Tag: VadS Protection: PAGE_EXECUTE_READWRITE
4d 5a 90 00 03 00 00 00 04 00 00 00 ff ff 00 00   MZ..............
```

Notice the memory page attributes:
- **Protection**: `PAGE_EXECUTE_READWRITE` (RWX)
- **Header**: Starts with standard `MZ` (PE executable header) unmapped from disk.

This confirms an unbacked PE binary injected directly into memory.

---

## 4. Extracting C2 Configuration

Dumping the injected memory section:

```bash
python3 vol.py -f redline-memory.raw -o ./dump windows.dumpfiles --pid 5892
```

Running `strings` and grepping for HTTP parameters:

```bash
strings -a -e l ./dump/file.0x2210000.dmp | grep -E "http://|https://"
```

We found:
- **C2 Server**: `https://192.168.1.100:8443/submit.php`
- **User-Agent**: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36`
- **Sleep Time**: `60s` (Jitter: `20%`)

---

## 5. Indicators of Compromise (IOCs)

| Type | Indicator | Description |
| :--- | :--- | :--- |
| **IP / Port** | `192.168.1.100:8443` | Cobalt Strike C2 listener |
| **SHA256** | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` | Injected beacon payload |
| **Parent/Child** | `powershell.exe -> svchost.exe` | Anomalous execution tree |

---

## 6. Defensive Recommendation & Sigma Rule

Deploy detection on any instance of `svchost.exe` whose parent process is not `services.exe`:

```yaml
title: Suspicious Svchost Parent Process
status: production
logsource:
  category: process_creation
  product: windows
detection:
  selection:
    Image|endswith: '\svchost.exe'
  filter:
    ParentImage|endswith: '\services.exe'
  condition: selection and not filter
falsepositives:
  - Rare third-party diagnostic utilities
level: high
```
