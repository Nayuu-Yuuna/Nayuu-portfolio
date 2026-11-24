---
title: "CTF Writeup - Hidden in Plain Sight: Covert ICMP Tunneling & Audio Stego"
description: "Forensic challenge writeup solving a multi-stage exfiltration puzzle involving covert ICMP data carriage and audio spectrogram analysis."
publishDate: "2026-01-14"
category: "CTF Challenge"
platform: "CTF Event"
difficulty: "Medium"
tags: ["pcap", "icmp-tunnel", "wireshark", "tshark", "audacity", "spectrogram", "forensics"]
artifacts: ["network_traffic.pcapng", "extracted_audio.wav"]
mitreAttck: ["T1095 (Non-Application Layer Protocol)", "T1001 (Data Obfuscation)"]
verdict: "Flag exfiltrated via ICMP Echo Request payload and DTMF tone encoded in audio"
flag: "FLAG{1cmp_tunne1_and_sp3ctr0gram_d3t3ct3d_7821}"
featured: false
---

## 1. Challenge Information

- **Event**: National Collegiate Cyber Defense / CTF Qualifiers
- **Category**: Digital Forensics
- **Description**: *"We intercepted suspicious network traffic leaving our critical server. Can you figure out what was stolen and recover the flag?"*
- **Provided Artifact**: `network_traffic.pcapng`

---

## 2. PCAP Protocol Hierarchy Analysis

Opening the capture file in Wireshark and checking `Statistics -> Protocol Hierarchy`:
- Total packets: `1,280`
- DNS: `12%`
- TCP: `18%`
- **ICMP: 70%** (Unusually high volume for standard ping operations!)

Inspecting ICMP packets:

```bash
tshark -r network_traffic.pcapng -Y "icmp.type == 8" -T fields -e data.data | head -n 5
```

Standard Windows ping data is `abcdefghijklmnopqrstuvwabcdefghi` (32 bytes). Here, each ICMP Echo Request packet contains a 1-byte payload following a specific sequence:

```text
52 49 46 46 24 08 ...
```

Notice the ASCII translation of `52 49 46 46`:
`0x52` = 'R', `0x49` = 'I', `0x46` = 'F', `0x46` = 'F' &rarr; **RIFF Wave Audio Header (`RIFF....WAVE`)!**

---

## 3. Extracting the Embedded WAV File

We write a quick Python script with `scapy` to carve out all ICMP payloads into a binary file:

```python
from scapy.all import rdpcap, ICMP

packets = rdpcap('network_traffic.pcapng')
raw_bytes = bytearray()

for pkt in packets:
    if pkt.haslayer(ICMP) and pkt[ICMP].type == 8: # Echo Request
        # Extract custom data payload
        payload = bytes(pkt[ICMP].payload)
        if payload:
            raw_bytes.extend(payload)

with open('extracted_audio.wav', 'wb') as f:
    f.write(raw_bytes)

print(f"Extracted {len(raw_bytes)} bytes to extracted_audio.wav")
```

---

## 4. Audio Spectrogram Analysis

Opening `extracted_audio.wav` in Audacity:
1. Playing the audio produces robotic beeping and static noise.
2. Switch the track display from **Waveform** to **Spectrogram**:

![Spectrogram Analysis](data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='120' viewBox='0 0 600 120'><rect width='600' height='120' fill='%230f172a'/><text x='30' y='65' fill='%2300ff88' font-family='monospace' font-size='16'>FLAG&#123;1cmp_tunne1_and_sp3ctr0gram_d3t3ct3d_7821&#125;</text></svg>)

The visual frequencies form clean alphanumeric letters spelling the flag:

```text
FLAG{1cmp_tunne1_and_sp3ctr0gram_d3t3ct3d_7821}
```
