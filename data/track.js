window.TRACK = window.TRACK || { modules: [], exam: [] };
TRACK.meta = {
  "code": "ZCNP",
  "brand": "ZyeemZia™",
  "name": "Certified Network Professional",
  "full": "ZyeemZia™ Certified Network Professional",
  "short": "ZCNP",
  "domain": "zcnp.zyeemzia.com",
  "pdf": "ZCNP-Book.pdf",
  "storeKey": "zcnp.v1",
  "tagline": "Engineer the enterprise.",
  "lead": "A professional certification for engineers who run real enterprise networks: campus architecture, advanced Layer 2, OSPF and BGP, overlays and SD-WAN, enterprise wireless, assurance and model-driven automation.",
  "signature": {
    "type": "hex",
    "name": "The ZCNP Fabric",
    "centerSub": "Enterprise Fabric",
    "caption": "Eight interlocking cells that together make an enterprise network: architecture, switching, IGP, BGP, overlays, wireless, assurance and programmability. Strengthen one cell and the whole fabric gets stronger."
  },
  "hours": "80–100",
  "level": "Professional",
  "audience": [
    "Network engineers with associate-level skills",
    "NOC and infrastructure engineers",
    "Systems engineers owning enterprise WAN/LAN",
    "Engineers preparing for expert tracks"
  ],
  "passMark": 80,
  "distinctionMark": 90,
  "examSize": 40,
  "examMinutes": 75,
  "capstone": {
    "title": "Capstone: Modernise a multi-site enterprise network",
    "brief": "Take a realistic enterprise (for example a garment exporter with a head office, two factories and a cloud presence) and produce a modernisation pack: campus redesign, dual-ISP BGP edge, SD-WAN overlay, secure wireless and an automation pipeline, validated in a lab.",
    "deliverables": [
      "Current-state assessment and requirements",
      "Campus architecture with HA design",
      "Advanced STP/MST design with protection features",
      "Multi-area OSPF design with redistribution and filtering",
      "Dual-homed BGP edge with inbound/outbound policy",
      "VRF and SD-WAN overlay design",
      "Enterprise WLAN design with roaming and 802.1X",
      "Telemetry and assurance plan with KPIs",
      "Automation pipeline (YANG/NETCONF or Ansible) with pre-checks",
      "Migration plan with rollback"
    ],
    "rubric": [
      {
        "criterion": "Architecture",
        "levels": [
          "Ad hoc",
          "Hierarchical and redundant",
          "Justified trade-offs and failure domains"
        ]
      },
      {
        "criterion": "Layer 2",
        "levels": [
          "Defaults",
          "MST/RSTP designed",
          "Protected and verified"
        ]
      },
      {
        "criterion": "IGP",
        "levels": [
          "Single area",
          "Multi-area with summaries",
          "Policy-controlled redistribution, loop-safe"
        ]
      },
      {
        "criterion": "BGP",
        "levels": [
          "Basic peering",
          "Policies applied",
          "Deterministic traffic engineering"
        ]
      },
      {
        "criterion": "Overlays",
        "levels": [
          "None",
          "VRF/VPN working",
          "SD-WAN policy aligned to apps"
        ]
      },
      {
        "criterion": "Wireless",
        "levels": [
          "Coverage only",
          "Secure design",
          "Roaming, QoS and analytics planned"
        ]
      },
      {
        "criterion": "Assurance",
        "levels": [
          "No visibility",
          "Monitoring in place",
          "Telemetry-driven KPIs and alerting"
        ]
      },
      {
        "criterion": "Automation",
        "levels": [
          "Manual",
          "Scripts",
          "Tested pipeline with rollback"
        ]
      }
    ]
  },
  "certificate": {
    "title": "Certificate of Achievement",
    "statement": "has successfully completed all modules of the ZyeemZia™ Certified Network Professional track and passed the ZCNP certification exam",
    "skills": [
      "Enterprise architecture",
      "OSPF & BGP policy",
      "Overlays & SD-WAN",
      "Enterprise wireless",
      "Network automation"
    ]
  },
  "disclaimer": "ZCNP is an independent certification programme created and issued by ZyeemZia. It is not affiliated with, endorsed by, sponsored by or equivalent to any certification from Cisco Systems, Inc. (including CCNA®, CCNP®, CCIE® and CCDE®) or from any other vendor or certifying body. All product names and trademarks belong to their respective owners. Configuration examples use widely taught, vendor-neutral style syntax.",
  "studyPlan": [
    [
      "Week 1–2",
      "m1 Architect",
      "Campus design study"
    ],
    [
      "Week 3",
      "m2 Switch",
      "MST and protection lab"
    ],
    [
      "Week 4–5",
      "m3 IGP",
      "Multi-area OSPF and redistribution lab"
    ],
    [
      "Week 6–7",
      "m4 BGP",
      "Dual-ISP BGP lab"
    ],
    [
      "Week 8",
      "m5 Overlay",
      "VRF, IPsec and SD-WAN lab"
    ],
    [
      "Week 9",
      "m6 Wireless",
      "Enterprise WLAN design"
    ],
    [
      "Week 10",
      "m7 Assure",
      "Telemetry and 802.1X lab"
    ],
    [
      "Week 11–12",
      "m8 Program",
      "Automation pipeline, capstone, exam"
    ]
  ]
};
