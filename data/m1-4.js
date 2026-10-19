window.TRACK = window.TRACK || { modules: [], exam: [] };
TRACK.modules.push({
 "id": "m1",
 "order": 1,
 "code": "Architect",
 "title": "Enterprise Network Architecture",
 "subtitle": "Hierarchy, fabrics, high availability and edge placement — the decisions every other cell depends on.",
 "outcomes": [
  "Design a hierarchical campus and decide when to collapse or separate the core.",
  "Plan a spine-leaf fabric, including oversubscription and scale-out.",
  "Choose between Layer 2, multi-chassis and routed access with clear high-availability reasoning.",
  "Explain fabric campus underlay, overlay and policy, and place WAN, internet and cloud edges.",
  "Record architecture decisions and trade-offs in a reusable format."
 ],
 "lessons": [
  {
   "id": "m1-l1",
   "title": "The Hierarchical Campus and the ZCNP Fabric",
   "subtitle": "Access, distribution and core: why the three-tier model still anchors enterprise design, and when to collapse it.",
   "minutes": 30,
   "objectives": [
    "Explain the role, functions and failure domain of the access, distribution and core layers.",
    "Decide when a collapsed-core design is the better choice for a site.",
    "Use the eight cells of the ZCNP Fabric as a design-review agenda."
   ],
   "blocks": [
    {
     "type": "text",
     "text": "A professional network engineer is judged less on whether a single protocol works and more on whether the **whole network behaves predictably** when links fail, traffic doubles or a new building opens. That predictability comes from structure. The hierarchical campus model splits the network into layers with clear jobs, so that each layer can be sized, secured and troubleshot on its own terms."
    },
    {
     "type": "framework",
     "items": [
      {
       "label": "C1",
       "title": "Architect",
       "text": "Topology, layering, redundancy and placement decisions that every other cell depends on."
      },
      {
       "label": "C2",
       "title": "Switch",
       "text": "Loop-free, resilient Layer 2: RSTP, MST, protection features and link aggregation."
      },
      {
       "label": "C3",
       "title": "IGP",
       "text": "Fast, scalable internal routing with OSPF or IS-IS, plus redistribution and route control."
      },
      {
       "label": "C4",
       "title": "BGP",
       "text": "Policy-driven routing at the edges: providers, data centres and large internal domains."
      },
      {
       "label": "C5",
       "title": "Overlay",
       "text": "VRFs, tunnels, VPNs and fabric encapsulations that separate services over shared infrastructure."
      },
      {
       "label": "C6",
       "title": "Wireless",
       "text": "Enterprise WLAN design, roaming and security as a first-class access layer."
      },
      {
       "label": "C7",
       "title": "Assure",
       "text": "Telemetry, flow data, access control and a disciplined troubleshooting method."
      },
      {
       "label": "C8",
       "title": "Program",
       "text": "Models, APIs and automation that turn designs into repeatable, testable changes."
      }
     ],
     "title": "The ZCNP Fabric — eight interlocking cells"
    },
    {
     "type": "callout",
     "kind": "insight",
     "text": "A design choice in one cell always lands somewhere else. Choosing Layer 3 access (Architect) removes most spanning-tree work (Switch) but doubles the number of IGP adjacencies (IGP). Review every change against all eight cells, not just the one you are touching.",
     "title": "Cells interlock"
    },
    {
     "type": "layers",
     "items": [
      {
       "label": "Core",
       "parts": [
        "High-speed Layer 3 transport between distribution blocks",
        "No end-user ports and minimal policy",
        "Fast convergence, ECMP, simple configuration"
       ]
      },
      {
       "label": "Distribution",
       "parts": [
        "Aggregates access switches for one building or zone",
        "Layer 2/Layer 3 boundary in classic designs",
        "Route summarisation, policy, first-hop redundancy"
       ]
      },
      {
       "label": "Access",
       "parts": [
        "Connects users, phones, access points and IoT",
        "Port security, 802.1X, PoE, QoS marking",
        "Edge spanning-tree protection"
       ]
      }
     ],
     "title": "Three-tier campus hierarchy"
    },
    {
     "type": "table",
     "head": [
      "Layer",
      "Primary job",
      "Typical features",
      "Design rule of thumb"
     ],
     "rows": [
      [
       "Access",
       "Attach endpoints",
       "PoE, VLANs, 802.1X, BPDU guard, QoS trust",
       "Keep it consistent and templated"
      ],
      [
       "Distribution",
       "Aggregate and apply policy",
       "SVIs, VRRP, ACLs, summarisation, uplink ECMP",
       "Deploy in redundant pairs"
      ],
      [
       "Core",
       "Move packets fast between blocks",
       "Routed point-to-point links, ECMP, fast IGP timers",
       "Never connect hosts or apply heavy policy"
      ]
     ],
     "title": "What each layer is responsible for"
    },
    {
     "type": "text",
     "text": "A **distribution block** is one pair of distribution switches plus the access switches beneath them. It is also a failure domain: a broadcast storm or misconfiguration inside one block should never spill into the core or into other blocks. Summarising the block's address space at the distribution layer reinforces this — the core sees one route per block, so a flapping access subnet does not ripple through the whole routing domain."
    },
    {
     "type": "compare",
     "columns": [
      {
       "title": "Three-tier (dedicated core)",
       "items": [
        "Best for large campuses with many buildings or distribution blocks",
        "Core can grow independently of the edge",
        "Fewer links: blocks connect only to the core, not to each other",
        "Higher equipment and cabling cost"
       ]
      },
      {
       "title": "Collapsed core",
       "items": [
        "Distribution and core functions merged into one redundant pair",
        "Ideal for a single building or a medium site",
        "Lower cost and fewer devices to manage",
        "Becomes a bottleneck when blocks keep being added"
       ]
      }
     ],
     "title": "Three-tier versus collapsed core"
    },
    {
     "type": "formula",
     "items": [
      {
       "name": "Full-mesh links between blocks",
       "expr": "links = n × (n − 1) / 2",
       "meaning": "Without a core, connecting n distribution pairs directly grows quadratically: 4 blocks need 6 meshes, 8 blocks need 28."
      },
      {
       "name": "Links with a dedicated core",
       "expr": "links ≈ 2 × n (per core pair)",
       "meaning": "Each block uplinks to the two core switches, so cabling grows linearly with the number of blocks."
      }
     ],
     "title": "Sizing the core decision"
    },
    {
     "type": "callout",
     "kind": "pro",
     "text": "When a site has more than two or three distribution blocks, or plans to add buildings within the hardware's life cycle, a dedicated core usually pays for itself in simpler cabling and isolated change windows.",
     "title": "A practical threshold"
    },
    {
     "type": "cli",
     "device": "DS1 · IOS-style CLI",
     "lines": [
      "interface Vlan20",
      " description USERS-FLOOR2",
      " ip address 10.20.20.2 255.255.255.0",
      " vrrp 20 ip 10.20.20.1",
      " vrrp 20 priority 110",
      " vrrp 20 preempt",
      "!",
      "DS1# show vrrp brief",
      "Interface   Grp Pri Time  Own Pre State   Master addr   Group addr",
      "Vl20        20  110 3570       Y  Master  10.20.20.2    10.20.20.1"
     ],
     "title": "Distribution pair with VRRP gateway redundancy",
     "note": "VRRP (RFC 5798) gives hosts one virtual gateway. Align the VRRP master with the spanning-tree root for that VLAN so traffic does not take an extra hop across the inter-switch link."
    },
    {
     "type": "scenario",
     "title": "Choosing the topology",
     "situation": "A logistics company is building a single four-storey office for 600 staff, with a small server room. Growth is expected to be modest for the next six years. The architect proposes three tiers with a dedicated core pair. What is the better recommendation?",
     "options": [
      {
       "text": "Use a collapsed core: one redundant distribution/core pair aggregating the floor switches.",
       "feedback": "Correct. One building with modest growth gains nothing from a separate core; a collapsed pair is cheaper, simpler and still fully redundant.",
       "best": true
      },
      {
       "text": "Keep the dedicated core because three tiers are always the professional standard.",
       "feedback": "The hierarchy is a model, not a rule. A separate core adds cost and links without solving a real problem here.",
       "best": false
      },
      {
       "text": "Remove the distribution layer entirely and connect every access switch straight to the core.",
       "feedback": "That is effectively a collapsed core but described badly; a dedicated core with hosts attached below it mixes roles and loses the block boundary.",
       "best": false
      },
      {
       "text": "Use a single large chassis with no redundancy to save money.",
       "feedback": "A single device is a single point of failure for the whole site; the saving does not justify the outage risk.",
       "best": false
      }
     ]
    },
    {
     "type": "keypoints",
     "items": [
      "Hierarchy creates predictable failure domains and lets each layer be sized for its job.",
      "The core moves packets; it does not host users or heavy policy.",
      "Collapse the core when the site is small; separate it when blocks multiply.",
      "Review every design decision against all eight cells of the ZCNP Fabric."
     ],
     "title": "Key points"
    },
    {
     "type": "quiz",
     "items": [
      {
       "q": "Which layer of the hierarchical campus is the usual place to summarise a building's subnets toward the rest of the network?",
       "options": [
        "The access layer",
        "The distribution layer",
        "The core layer",
        "The internet edge routers"
       ],
       "answer": 1,
       "explain": "Distribution switches aggregate one block and are the natural Layer 3 boundary, so they summarise the block toward the core. The access layer has no routing view, and the core should stay simple."
      },
      {
       "q": "A campus has two buildings and no growth plans. Which design is usually most appropriate?",
       "options": [
        "A collapsed core with one redundant pair",
        "A dedicated three-tier core and distribution",
        "A full mesh between every access switch",
        "A single non-redundant core chassis"
       ],
       "answer": 0,
       "explain": "With few blocks, merging distribution and core into one redundant pair gives the same resilience at lower cost. A dedicated core only pays off as blocks multiply."
      },
      {
       "q": "Why should end-user devices not be connected directly to core switches?",
       "options": [
        "Core switches are unable to forward any Layer 2 frames between ports",
        "Core ports are unable to supply Power over Ethernet",
        "Hosts cannot use addresses from the core's subnets",
        "It mixes roles and drags edge policy into the fast transport layer"
       ],
       "answer": 3,
       "explain": "The core should be simple and stable. Attaching hosts adds edge features, policy and failure modes to the layer that every block depends on."
      },
      {
       "q": "How many links are needed to full-mesh six distribution blocks without a core?",
       "options": [
        "12",
        "30",
        "15",
        "36"
       ],
       "answer": 2,
       "explain": "n × (n − 1) / 2 = 6 × 5 / 2 = 15. The quadratic growth is the main argument for a dedicated core in large campuses."
      },
      {
       "q": "On a distribution pair running VRRP, why align the VRRP master with the spanning-tree root for the same VLAN?",
       "options": [
        "To avoid traffic crossing the inter-switch link before routing",
        "Because VRRP refuses to run on the non-root switch",
        "To let both switches answer ARP for the virtual MAC",
        "Because only the root bridge is allowed to hold an SVI for that VLAN"
       ],
       "answer": 0,
       "explain": "If the gateway sits on one switch and the forwarding path leads to the other, frames take an extra Layer 2 hop. Alignment keeps the path short and predictable."
      }
     ]
    }
   ]
  },
  {
   "id": "m1-l2",
   "title": "Spine-Leaf and Data-Centre Fabrics",
   "subtitle": "Clos topologies, ECMP and oversubscription: the design behind modern data centres and large campuses.",
   "minutes": 30,
   "objectives": [
    "Describe the spine-leaf topology and the rules that keep it predictable.",
    "Calculate oversubscription ratios and plan scale-out.",
    "Contrast a routed spine-leaf underlay with a traditional three-tier data centre."
   ],
   "blocks": [
    {
     "type": "text",
     "text": "Traditional data centres were built like campuses: access, aggregation and core, with Layer 2 stretched widely and spanning tree blocking half the links. Modern application traffic is mostly **east-west** — server to server, service to service — and that design gives unequal paths and wasted capacity. The **spine-leaf** topology, a form of folded Clos network, fixes this."
    },
    {
     "type": "keypoints",
     "items": [
      "Every leaf connects to every spine.",
      "Leaves never connect to other leaves for data traffic, and spines never connect to other spines.",
      "Servers, storage, firewalls and border routers attach only to leaves.",
      "Any leaf-to-leaf path is exactly leaf → spine → leaf: two hops, equal cost.",
      "Links are routed point-to-point and load-shared with ECMP."
     ],
     "title": "Spine-leaf rules"
    },
    {
     "type": "layers",
     "items": [
      {
       "label": "Spine",
       "parts": [
        "4 switches",
        "Pure transit: no endpoints",
        "Adds bandwidth when you add a spine"
       ]
      },
      {
       "label": "Leaf",
       "parts": [
        "Top-of-rack switches",
        "Default gateway (often anycast)",
        "Border leaves for WAN, internet and firewalls"
       ]
      },
      {
       "label": "Endpoints",
       "parts": [
        "Servers and hypervisors",
        "Storage",
        "Service appliances"
       ]
      }
     ],
     "title": "A two-tier spine-leaf fabric"
    },
    {
     "type": "formula",
     "items": [
      {
       "name": "Leaf oversubscription",
       "expr": "ratio = total server-facing bandwidth ÷ total spine-facing bandwidth",
       "meaning": "48 × 25G down (1,200G) with 6 × 100G up (600G) gives 2:1. Lower is better for east-west heavy workloads."
      },
      {
       "name": "Maximum leaves",
       "expr": "leaves ≤ ports per spine",
       "meaning": "Each leaf consumes one port on every spine, so spine port count caps the fabric's width."
      },
      {
       "name": "ECMP paths between two leaves",
       "expr": "paths = number of spines (with one link per spine)",
       "meaning": "Losing one of four spines removes 25% of fabric capacity, not connectivity."
      }
     ],
     "title": "Oversubscription and scale"
    },
    {
     "type": "compare",
     "columns": [
      {
       "title": "Three-tier data centre",
       "items": [
        "Optimised for north-south traffic",
        "Spanning tree blocks redundant links",
        "Unequal path lengths between racks",
        "Scale-up: buy bigger aggregation switches"
       ]
      },
      {
       "title": "Spine-leaf fabric",
       "items": [
        "Optimised for east-west traffic",
        "All links active through Layer 3 ECMP",
        "Predictable two-hop latency",
        "Scale-out: add spines for bandwidth, leaves for ports"
       ]
      }
     ],
     "title": "Three-tier DC versus spine-leaf"
    },
    {
     "type": "text",
     "text": "The **underlay** of a spine-leaf fabric is usually a simple routed network: point-to-point /31 links, loopbacks for each switch, and either OSPF, IS-IS or eBGP as the routing protocol. eBGP underlays, with a private AS number per leaf (or per rack) and one shared AS for the spines, are common in very large fabrics because BGP's policy and scale are well suited to thousands of links. Layer 2 services for workloads are then delivered as an **overlay**, typically VXLAN with an EVPN control plane — covered in the Overlay cell."
    },
    {
     "type": "cli",
     "device": "LEAF1 · IOS-style CLI",
     "lines": [
      "interface Ethernet1/49",
      " description to SPINE1",
      " no switchport",
      " mtu 9216",
      " ip address 10.0.1.1 255.255.255.254",
      " ip ospf network point-to-point",
      " ip ospf 1 area 0",
      "!",
      "interface Loopback0",
      " ip address 10.255.1.1 255.255.255.255",
      " ip ospf 1 area 0"
     ],
     "title": "Routed leaf uplink in an OSPF underlay",
     "note": "/31 masks (RFC 3021) save address space on point-to-point links. The jumbo MTU leaves room for overlay encapsulation headers."
    },
    {
     "type": "callout",
     "kind": "warning",
     "text": "Adding a leaf-to-leaf link 'for extra resilience' breaks the equal-cost model and can create unexpected traffic patterns. The exception is a dedicated peer link used by a multi-chassis aggregation pair for dual-homed servers, which is not used for routed fabric traffic.",
     "title": "Do not cross-connect leaves"
    },
    {
     "type": "steps",
     "items": [
      {
       "title": "Count endpoints and growth",
       "text": "Estimate server ports per rack and racks per hall for the hardware life cycle."
      },
      {
       "title": "Pick the leaf model",
       "text": "Choose port speeds and uplink count; this sets the oversubscription ratio."
      },
      {
       "title": "Size the spines",
       "text": "Spine port count must cover the maximum number of leaves you will ever need."
      },
      {
       "title": "Design the underlay",
       "text": "Address plan for /31 links and loopbacks, routing protocol, MTU and BFD."
      },
      {
       "title": "Design the overlay and borders",
       "text": "Tenant VRFs, gateway model and where WAN, internet and firewalls attach (border leaves)."
      }
     ],
     "title": "Planning a spine-leaf build"
    },
    {
     "type": "scenario",
     "title": "Capacity alarm",
     "situation": "A fabric has four spines and 20 leaves, each leaf with 4 × 100G uplinks and 48 × 25G server ports. Storage replication jobs saturate uplinks at night. The spines have spare ports. What is the most effective change?",
     "options": [
      {
       "text": "Add more leaves so the replication traffic spreads across more racks.",
       "feedback": "More leaves add server ports, not uplink capacity for the existing racks.",
       "best": false
      },
      {
       "text": "Connect the busiest leaves directly to each other with 100G links.",
       "feedback": "Leaf-to-leaf links break the predictable two-hop model and are not used by fabric ECMP.",
       "best": false
      },
      {
       "text": "Add spines and a matching uplink on each leaf to raise leaf uplink bandwidth.",
       "feedback": "Correct. Each new spine adds one more ECMP path per leaf, lowering oversubscription from 3:1 towards 2:1 without redesign.",
       "best": true
      },
      {
       "text": "Enable spanning tree on the spine uplinks so that it blocks the congested paths.",
       "feedback": "Blocking links reduces capacity; the fabric relies on routed ECMP precisely to avoid this.",
       "best": false
      }
     ]
    },
    {
     "type": "keypoints",
     "items": [
      "Spine-leaf gives every pair of leaves equal-cost, two-hop paths.",
      "Add spines for bandwidth, leaves for ports; spine port count limits width.",
      "Oversubscription = downlink bandwidth ÷ uplink bandwidth at the leaf.",
      "The underlay is routed; workload Layer 2 is delivered as an overlay."
     ],
     "title": "Key points"
    },
    {
     "type": "quiz",
     "items": [
      {
       "q": "In a spine-leaf fabric, where should a firewall cluster and the WAN routers attach?",
       "options": [
        "Directly to the spines",
        "To a dedicated spine-to-spine link",
        "To border leaves",
        "To any access switch in the campus"
       ],
       "answer": 2,
       "explain": "Spines are pure transit. All services, including external connectivity, attach to leaves — often called border or service leaves."
      },
      {
       "q": "A leaf has 32 × 100G server ports and 8 × 400G uplinks. What is the oversubscription ratio?",
       "options": [
        "2:1",
        "4:1",
        "1:2",
        "1:1"
       ],
       "answer": 3,
       "explain": "Down: 32 × 100G = 3,200G. Up: 8 × 400G = 3,200G. The ratio is 3,200 ÷ 3,200 = 1:1, a non-blocking leaf."
      },
      {
       "q": "What primarily limits the maximum number of leaves in a two-tier spine-leaf fabric?",
       "options": [
        "The number of server ports on each leaf",
        "The number of ports on each spine switch",
        "The number of VLANs configured on the leaves",
        "The maximum MTU supported by the uplinks"
       ],
       "answer": 1,
       "explain": "Every leaf uses one port on every spine, so the spine's port count sets the ceiling. Beyond that, a three-stage design with super-spines is needed."
      },
      {
       "q": "Why are /31 masks common on spine-leaf links?",
       "options": [
        "They give two usable addresses on a point-to-point link",
        "They are required for ECMP load sharing to work",
        "They prevent the IGP from forming adjacencies",
        "They let spanning tree keep running on routed uplink ports"
       ],
       "answer": 0,
       "explain": "RFC 3021 allows /31 on point-to-point links, saving half the space of a /30. It has no effect on ECMP or spanning tree."
      },
      {
       "q": "A fabric with four spines loses one spine. What is the effect on leaf-to-leaf traffic?",
       "options": [
        "All leaf-to-leaf traffic stops until it is replaced",
        "Capacity drops by about a quarter; connectivity remains",
        "Traffic is switched through peer links between the leaves",
        "Spanning tree reconverges and blocks a spine link"
       ],
       "answer": 1,
       "explain": "Each spine is one of four equal-cost paths. Losing one removes its share of bandwidth while ECMP continues over the remaining three."
      }
     ]
    }
   ]
  },
  {
   "id": "m1-l3",
   "title": "Access Designs and High Availability",
   "subtitle": "Layer 2 versus Layer 3 access, redundant links, multi-chassis aggregation, stacking and fast convergence.",
   "minutes": 35,
   "objectives": [
    "Compare Layer 2 access, Layer 3 (routed) access and multi-chassis designs.",
    "Select high-availability mechanisms for each layer and explain their failure behaviour.",
    "Configure a routed access uplink with fast failure detection."
   ],
   "blocks": [
    {
     "type": "text",
     "text": "Where you put the Layer 2/Layer 3 boundary is one of the most consequential campus decisions. It decides whether spanning tree is active in the uplinks, whether a VLAN can span more than one access switch, how fast the network recovers from a failure, and how many routing adjacencies you must operate."
    },
    {
     "type": "compare",
     "columns": [
      {
       "title": "Layer 2 access (classic)",
       "items": [
        "Access switches trunk VLANs to a distribution pair",
        "Distribution holds SVIs and runs VRRP",
        "Spanning tree blocks one uplink per VLAN",
        "VLANs can span access switches if needed"
       ]
      },
      {
       "title": "Layer 2 with multi-chassis aggregation",
       "items": [
        "Distribution pair acts as one logical switch for link aggregation",
        "Each access switch bundles both uplinks into one LAG",
        "No spanning-tree blocking on uplinks; both links forward",
        "Requires the pair's peer link and consistent configuration"
       ]
      },
      {
       "title": "Layer 3 (routed) access",
       "items": [
        "Access switch is the default gateway for its VLANs",
        "Uplinks are routed links with ECMP",
        "No spanning tree on uplinks; IGP convergence instead",
        "VLANs are confined to one access switch"
       ]
      }
     ],
     "title": "Three access models"
    },
    {
     "type": "table",
     "head": [
      "Criterion",
      "Layer 2 access",
      "Multi-chassis LAG",
      "Routed access"
     ],
     "rows": [
      [
       "Uplink utilisation",
       "One uplink blocked per VLAN",
       "Both uplinks active (hash)",
       "Both uplinks active (ECMP)"
      ],
      [
       "Failure recovery",
       "RSTP, usually sub-second to a few seconds",
       "Member link loss: sub-second",
       "IGP with BFD: sub-second"
      ],
      [
       "VLAN spanning switches",
       "Supported",
       "Supported",
       "Not supported without an overlay"
      ],
      [
       "Operational complexity",
       "Spanning tree and VRRP tuning",
       "Pair synchronisation and peer link",
       "More routed devices and adjacencies"
      ],
      [
       "Typical fit",
       "Small or legacy sites",
       "Sites needing VLAN mobility",
       "Large, modern campuses"
      ]
     ],
     "title": "Design trade-offs at the access boundary"
    },
    {
     "type": "callout",
     "kind": "definition",
     "text": "Two physical switches present a single LACP system identity to a downstream device, so that device can bundle links to both switches into one logical link. Implementations differ between vendors and are not interoperable across vendors; the concept is the same — two control planes coordinate through a peer link so one switch failure does not take the bundle down.",
     "title": "Multi-chassis link aggregation"
    },
    {
     "type": "compare",
     "columns": [
      {
       "title": "Switch stack",
       "items": [
        "Several switches share one control plane and one management address",
        "Simple to operate: configured as one device",
        "Software upgrades often affect the whole stack",
        "A control-plane fault can affect every member"
       ]
      },
      {
       "title": "Multi-chassis pair",
       "items": [
        "Two independent control planes coordinate state",
        "Each switch can be upgraded separately in many designs",
        "More configuration to keep consistent",
        "Better isolation of software faults"
       ]
      }
     ],
     "title": "Stacking versus multi-chassis pair"
    },
    {
     "type": "cli",
     "device": "AS1 · IOS-style CLI",
     "lines": [
      "interface GigabitEthernet1/1/1",
      " description to DS1",
      " no switchport",
      " ip address 10.1.0.1 255.255.255.254",
      " ip ospf network point-to-point",
      " ip ospf 1 area 10",
      " bfd interval 300 min_rx 300 multiplier 3",
      "!",
      "router ospf 1",
      " router-id 10.255.10.1",
      " passive-interface default",
      " no passive-interface GigabitEthernet1/1/1",
      " no passive-interface GigabitEthernet1/1/2",
      " bfd all-interfaces"
     ],
     "title": "Routed access uplink with BFD",
     "note": "BFD (RFC 5880) detects a dead neighbour in about 900 ms with these values, far faster than default OSPF dead timers. Passive-by-default stops the switch forming adjacencies on user VLANs."
    },
    {
     "type": "formula",
     "items": [
      {
       "name": "BFD detection",
       "expr": "detect ≈ interval × multiplier",
       "meaning": "300 ms × 3 ≈ 900 ms before the routing protocol is told the neighbour is down."
      },
      {
       "name": "OSPF default dead time",
       "expr": "dead = 4 × hello",
       "meaning": "With a 10 s hello the dead interval is 40 s — too slow for voice and video if the link does not go physically down."
      }
     ],
     "title": "Failure detection time"
    },
    {
     "type": "text",
     "text": "High availability is more than duplicate boxes. Plan **redundancy at every layer**: dual power supplies on separate feeds, dual uplinks landing on different line cards or switches, a redundant distribution pair, and diverse fibre routes between buildings. Then make sure the control plane reacts quickly: point-to-point network types, BFD, tuned timers and graceful restart or non-stop forwarding where the platform supports it."
    },
    {
     "type": "callout",
     "kind": "warning",
     "text": "Two uplinks running through the same conduit, or two power supplies on the same circuit, are one failure. Walk the physical path and the power chain during design reviews.",
     "title": "Redundancy you cannot see"
    },
    {
     "type": "scenario",
     "title": "Choosing the access model",
     "situation": "A hospital campus is replacing its access layer. Clinical devices must keep the same subnet when moved between wards on the same floor, and each floor has four access switches. The network team wants both uplinks active and no spanning-tree blocking. Which design fits best?",
     "options": [
      {
       "text": "Routed access with the gateway on each access switch.",
       "feedback": "Routed access confines each VLAN to one switch, which breaks the requirement to keep subnets across switches.",
       "best": false
      },
      {
       "text": "Layer 2 access with multi-chassis link aggregation to the distribution pair.",
       "feedback": "Correct. VLANs can still span the floor's switches, and both uplinks forward as members of one bundle.",
       "best": true
      },
      {
       "text": "Classic Layer 2 access with RSTP and VRRP, blocking one of the two uplinks per VLAN.",
       "feedback": "This preserves VLAN reach but leaves one uplink blocked, which the team explicitly wants to avoid.",
       "best": false
      },
      {
       "text": "A single access switch per floor with no uplink redundancy.",
       "feedback": "This removes redundancy entirely and is unacceptable for clinical services.",
       "best": false
      }
     ]
    },
    {
     "type": "keypoints",
     "items": [
      "Routed access removes spanning tree from uplinks but confines VLANs to one switch.",
      "Multi-chassis aggregation keeps VLAN reach and makes both uplinks forward.",
      "Stacks simplify management but share one control plane.",
      "Fast detection (BFD, point-to-point links) matters as much as duplicate hardware."
     ],
     "title": "Key points"
    },
    {
     "type": "quiz",
     "items": [
      {
       "q": "What is the main limitation of routed (Layer 3) access?",
       "options": [
        "Both uplinks cannot be used at the same time",
        "Spanning tree must run on every routed uplink",
        "VRRP is mandatory on each access switch",
        "A VLAN cannot span multiple access switches"
       ],
       "answer": 3,
       "explain": "In routed access the access switch is the gateway, so each VLAN lives on one switch. ECMP keeps both uplinks active and spanning tree is not used on them."
      },
      {
       "q": "BFD runs with a 250 ms interval and a multiplier of 4. Roughly how long does failure detection take?",
       "options": [
        "250 milliseconds",
        "4 seconds",
        "1 second",
        "40 seconds"
       ],
       "answer": 2,
       "explain": "Detection time ≈ interval × multiplier = 250 ms × 4 = 1,000 ms."
      },
      {
       "q": "What does a multi-chassis link aggregation pair present to the downstream switch?",
       "options": [
        "Two separate bundles that spanning tree must block",
        "One LACP partner identity across two physical switches",
        "A routed ECMP path through two gateway addresses",
        "A single stack running one shared control plane for both"
       ],
       "answer": 1,
       "explain": "The pair coordinates so the downstream device sees one LACP system and bundles links to both. It is not a stack: each switch keeps its own control plane."
      },
      {
       "q": "Which risk is most associated with a switch stack compared with a multi-chassis pair?",
       "options": [
        "Stack members cannot be given redundant power supplies",
        "Stacks cannot be managed as a single device",
        "Stacks do not support link aggregation at all",
        "A shared control-plane fault can affect all members"
       ],
       "answer": 3,
       "explain": "Stack members share one control plane, so a software fault or upgrade can affect the whole stack. Multi-chassis pairs keep two control planes."
      },
      {
       "q": "Why configure `passive-interface default` on a routed access switch?",
       "options": [
        "So OSPF only forms adjacencies on the intended uplinks",
        "So OSPF stops advertising the user subnets",
        "So BFD can run without any routing protocol",
        "So the switch always elects itself as the designated router"
       ],
       "answer": 0,
       "explain": "Passive interfaces still advertise their subnets but send no hellos, so no adjacency can form on user-facing VLANs. Uplinks are then explicitly made non-passive."
      }
     ]
    }
   ]
  },
  {
   "id": "m1-l4",
   "title": "Fabric Campus, WAN and Cloud Edge Placement",
   "subtitle": "Overlay and underlay, group-based policy, and where the WAN, internet and cloud connect — with a decision table.",
   "minutes": 35,
   "objectives": [
    "Explain the underlay, overlay and policy planes of a fabric-based campus.",
    "Place WAN, internet, DMZ and cloud on-ramp functions in an enterprise topology.",
    "Use a decision table to justify architecture trade-offs."
   ],
   "blocks": [
    {
     "type": "text",
     "text": "A **fabric-based campus** applies data-centre ideas to the enterprise LAN. A simple routed **underlay** provides reachability between switch loopbacks. An **overlay** — typically VXLAN encapsulation (RFC 7348) with a control plane that maps endpoints to their location — carries user traffic, so a user's subnet can appear anywhere without stretching VLANs. A **policy plane** classifies users and devices into groups and enforces rules between groups, regardless of IP address."
    },
    {
     "type": "layers",
     "items": [
      {
       "label": "Policy",
       "parts": [
        "Groups assigned at authentication (802.1X, MAB)",
        "Group-to-group rules",
        "Enforced at fabric edge or border"
       ]
      },
      {
       "label": "Overlay",
       "parts": [
        "VXLAN tunnels between fabric nodes",
        "Virtual networks (VRFs) for segmentation",
        "Endpoint-to-location mapping control plane"
       ]
      },
      {
       "label": "Underlay",
       "parts": [
        "Routed point-to-point links",
        "Loopbacks, IGP (often IS-IS or OSPF)",
        "Jumbo MTU for encapsulation overhead"
       ]
      },
      {
       "label": "Physical",
       "parts": [
        "Access, distribution/intermediate, border nodes",
        "Redundant fibre and power"
       ]
      }
     ],
     "title": "Fabric campus planes"
    },
    {
     "type": "table",
     "head": [
      "Role",
      "Function"
     ],
     "rows": [
      [
       "Edge node",
       "Connects endpoints, authenticates them, encapsulates their traffic into the overlay"
      ],
      [
       "Intermediate node",
       "Pure underlay transit; does not need to understand the overlay"
      ],
      [
       "Border node",
       "Connects the fabric to external networks: WAN, data centre, internet, other fabrics"
      ],
      [
       "Control-plane node",
       "Holds the endpoint-to-location database used to find where a host lives"
      ],
      [
       "Policy server",
       "Authenticates users and devices and assigns them to groups"
      ]
     ],
     "title": "Fabric roles"
    },
    {
     "type": "callout",
     "kind": "insight",
     "text": "IP addresses change with DHCP, roaming and cloud workloads. Writing rules as 'Finance users may reach the finance application group' rather than as long address-based ACLs keeps policy stable while addressing moves. Group tags travel with the traffic inside the overlay header in many implementations.",
     "title": "Why policy follows groups"
    },
    {
     "type": "text",
     "text": "Beyond the campus, an enterprise has several **edges**, and their placement determines security, latency and cost. Keep each edge in its own module so it can be secured and scaled independently, and connect them to the core or to a dedicated edge distribution pair rather than to user access switches."
    },
    {
     "type": "table",
     "head": [
      "Edge",
      "Connects to",
      "Typical placement and controls"
     ],
     "rows": [
      [
       "WAN edge",
       "Branches over MPLS, broadband or SD-WAN",
       "Redundant routers off the core or edge distribution; QoS and routing policy"
      ],
      [
       "Internet edge",
       "One or more ISPs",
       "Edge routers, then firewalls; BGP when multihomed; DDoS protection"
      ],
      [
       "DMZ",
       "Public-facing services",
       "Separate firewall zones; no direct path to internal VLANs"
      ],
      [
       "Cloud edge",
       "Public cloud regions",
       "Private interconnect or IPsec from a colocation or the DC; route filtering both ways"
      ],
      [
       "Partner/extranet",
       "Suppliers and banks",
       "Dedicated firewall zone with strict, logged policy"
      ]
     ],
     "title": "Enterprise edge modules"
    },
    {
     "type": "flow",
     "items": [
      {
       "label": "Branch access",
       "text": "User authenticated, traffic classified"
      },
      {
       "label": "Branch edge",
       "text": "Application-aware path selection"
      },
      {
       "label": "Local internet breakout",
       "text": "Security inspection or cloud security service"
      },
      {
       "label": "Provider network",
       "text": "Best path to the SaaS front end"
      },
      {
       "label": "SaaS application",
       "text": "Served from the nearest region"
      }
     ],
     "title": "Traffic path from a branch user to a SaaS application (direct internet access)"
    },
    {
     "type": "table",
     "head": [
      "Requirement",
      "If this is true…",
      "Prefer…",
      "Accept this trade-off"
     ],
     "rows": [
      [
       "VLAN must span switches",
       "Legacy devices need the same subnet in many closets",
       "L2 access with multi-chassis LAG, or a fabric overlay",
       "Pair synchronisation or overlay complexity"
      ],
      [
       "Fastest, simplest convergence",
       "No VLAN mobility needed",
       "Routed access with BFD",
       "VLANs confined to one switch"
      ],
      [
       "Many buildings",
       "More than 2–3 distribution blocks",
       "Dedicated core",
       "Extra hardware and links"
      ],
      [
       "Strong segmentation at scale",
       "Many user/device groups, frequent moves",
       "Fabric campus with group-based policy",
       "New skills, controller dependence"
      ],
      [
       "Heavy SaaS and cloud use",
       "Most traffic leaves the enterprise",
       "Local internet breakout with cloud security",
       "Distributed security policy to manage"
      ]
     ],
     "title": "Architecture decision table"
    },
    {
     "type": "scenario",
     "title": "Branches drowning in backhaul",
     "situation": "A distributor's 60 branches send all traffic, including internet and SaaS, over MPLS to the head office, where it passes through a central firewall. Now that most applications are SaaS, branch links and the head-office internet edge are congested and video calls stutter. What is the best architectural change?",
     "options": [
      {
       "text": "Double the MPLS bandwidth at every branch and at the head office so backhauled traffic fits.",
       "feedback": "This treats the symptom at high recurring cost and keeps the extra latency of hair-pinning SaaS traffic.",
       "best": false
      },
      {
       "text": "Move the SaaS applications back into the head-office data centre to keep traffic internal.",
       "feedback": "SaaS cannot simply be repatriated, and this ignores the business decision to use cloud services.",
       "best": false
      },
      {
       "text": "Block video and voice traffic on branch networks so business applications have enough room.",
       "feedback": "Blocking collaboration tools breaks a business requirement rather than fixing the architecture.",
       "best": false
      },
      {
       "text": "Add local internet breakout at branches with cloud-delivered or local security inspection.",
       "feedback": "Correct. SaaS traffic leaves at the nearest point with consistent security, freeing MPLS and the head-office edge for internal traffic.",
       "best": true
      }
     ]
    },
    {
     "type": "case",
     "title": "National bank: head-office campus upgrade",
     "context": "A national bank's 14-storey head office runs a flat Layer 2 network: two chassis switches in the basement, 70 access switches, 120 VLANs trunked everywhere, and spanning tree blocking half the riser links. A broadcast storm last quarter stopped the dealing room for 40 minutes. The regulator requires segmentation between treasury, retail operations and guest users. The data centre is in another city, connected by two carrier circuits, and internet access is via a single ISP.",
     "questions": [
      "Which campus model would you propose, and why?",
      "How would you contain failures so a storm on one floor cannot affect the dealing room?",
      "How would you meet the segmentation requirement?",
      "What edge changes would you recommend?"
     ],
     "answer": "Introduce hierarchy: distribution pairs per group of floors (for example floors 1–5, 6–10, 11–14) and a dedicated core pair, since there are several blocks and growth in branches and services. Prefer **routed access** for most floors so each VLAN is local to a closet and storms are confined to one switch; where legacy systems need stretched subnets, use multi-chassis aggregation within a block only. Prune the 120 VLANs so none spans blocks. Put the dealing room in its own block with its own distribution pair. For segmentation, use VRFs (treasury, retail, guest) carried from access to core, with a firewall between VRFs — or, in a fabric campus, virtual networks plus group-based policy. At the edge, add a second ISP with BGP, separate the internet edge and DMZ from the WAN edge, and terminate the carrier circuits on a redundant WAN edge pair off the core."
    },
    {
     "type": "template",
     "title": "Architecture decision record",
     "purpose": "Record each significant design choice so reviewers can see what was considered and why.",
     "columns": [
      "Decision",
      "Context and requirement",
      "Options considered",
      "Chosen option",
      "Trade-offs accepted",
      "Fabric cells affected"
     ],
     "example": [
      [
       "Access model for floors 1–10",
       "No VLAN mobility; storms must be contained",
       "L2 access, multi-chassis LAG, routed access",
       "Routed access with BFD",
       "VLANs confined to one switch",
       "Architect, Switch, IGP, Assure"
      ]
     ],
     "rows": 6
    },
    {
     "type": "checklist",
     "title": "Architecture review checklist",
     "items": [
      "Every layer has a clear role and no hosts attach to the core.",
      "Distribution blocks summarise their address space to the core.",
      "Redundant links follow physically diverse paths and power feeds.",
      "Failure detection uses BFD or point-to-point links, not default dead timers.",
      "VLANs are pruned so none spans blocks without a documented reason.",
      "WAN, internet, DMZ and cloud edges are separate modules with their own policy.",
      "Segmentation is designed (VRFs or groups), not left to flat ACLs.",
      "Oversubscription ratios are calculated and accepted for each layer.",
      "Each decision is recorded with its trade-offs."
     ]
    },
    {
     "type": "reflection",
     "prompt": "Sketch your own organisation's network against the hierarchy. Where does the Layer 2/Layer 3 boundary sit today, and what would you change first if you could redesign one building?"
    },
    {
     "type": "terms",
     "items": [
      {
       "term": "Distribution block",
       "def": "A distribution pair and the access switches beneath it, treated as one failure and summarisation domain."
      },
      {
       "term": "Collapsed core",
       "def": "A design where the distribution and core functions are combined into one redundant pair of switches."
      },
      {
       "term": "Spine-leaf",
       "def": "A two-tier Clos topology in which every leaf connects to every spine, giving equal-cost two-hop paths."
      },
      {
       "term": "Oversubscription",
       "def": "The ratio of downstream (host-facing) bandwidth to upstream (uplink) bandwidth at a switch."
      },
      {
       "term": "ECMP",
       "def": "Equal-cost multipath: forwarding traffic over several routes with the same cost, usually hashed per flow."
      },
      {
       "term": "Routed access",
       "def": "An access design where the access switch is the default gateway and uplinks are Layer 3 links."
      },
      {
       "term": "Multi-chassis link aggregation",
       "def": "Two switches presenting one LACP identity so a device can bundle links to both."
      },
      {
       "term": "Switch stack",
       "def": "Several physical switches operating with one shared control plane and management identity."
      },
      {
       "term": "BFD",
       "def": "Bidirectional Forwarding Detection (RFC 5880), a lightweight protocol that detects path failure in milliseconds."
      },
      {
       "term": "Underlay",
       "def": "The physical routed network that provides reachability between fabric nodes."
      },
      {
       "term": "Overlay",
       "def": "A virtual network carried over the underlay, usually by encapsulation such as VXLAN."
      },
      {
       "term": "Border node",
       "def": "A fabric node that connects the overlay to external networks."
      },
      {
       "term": "Group-based policy",
       "def": "Access rules written between groups of users or devices rather than between IP addresses."
      }
     ]
    },
    {
     "type": "quiz",
     "items": [
      {
       "q": "In a fabric campus, which plane is responsible for reachability between switch loopbacks?",
       "options": [
        "The overlay",
        "The policy plane",
        "The underlay",
        "The management plane"
       ],
       "answer": 2,
       "explain": "The underlay is the routed network that connects fabric nodes. The overlay rides on top of it, and policy is applied to groups within the overlay."
      },
      {
       "q": "Why is policy in a fabric campus usually written between groups instead of IP addresses?",
       "options": [
        "Groups stay stable while addresses change with roaming and DHCP",
        "Groups need fewer switch ports than address-based rules",
        "Firewalls cannot inspect any IP addresses in an overlay",
        "Address-based rules cannot be applied to routed links in a fabric"
       ],
       "answer": 0,
       "explain": "Group membership follows the user or device identity, so rules remain valid as addresses move."
      },
      {
       "q": "Where should the internet edge connect in an enterprise design?",
       "options": [
        "Directly to the user access switches on every floor",
        "To one of the spine switches in the data centre",
        "To the guest wireless VLAN for simplicity",
        "To the core or a dedicated edge distribution pair"
       ],
       "answer": 3,
       "explain": "Edges are separate modules attached to the core or an edge block, so they can be secured and scaled independently of users."
      },
      {
       "q": "Which role in a fabric campus authenticates an endpoint and encapsulates its traffic?",
       "options": [
        "The intermediate node",
        "The edge node",
        "The border node",
        "The control-plane node"
       ],
       "answer": 1,
       "explain": "Edge nodes attach endpoints and put their traffic into the overlay. Intermediate nodes are only underlay transit; border nodes connect to external networks."
      },
      {
       "q": "A site needs the fastest, simplest convergence and has no requirement for VLANs to span switches. Which access model does the decision table point to?",
       "options": [
        "Layer 2 access with RSTP",
        "Multi-chassis link aggregation",
        "Routed access with BFD",
        "A flat network with one VLAN"
       ],
       "answer": 2,
       "explain": "Without VLAN mobility, routed access gives ECMP uplinks and sub-second detection with BFD, avoiding spanning tree on uplinks."
      }
     ]
    }
   ]
  }
 ]
});
TRACK.modules.push({
 "id": "m2",
 "order": 2,
 "code": "Switch",
 "title": "Advanced Layer 2",
 "subtitle": "Rapid and multiple spanning tree, protection features, link aggregation, private VLANs and a solid troubleshooting method.",
 "outcomes": [
  "Explain and verify RSTP roles, states and fast-convergence mechanisms.",
  "Design and configure an MST region with load sharing aligned to gateways.",
  "Apply BPDU guard, root guard, loop guard and storm control to the right ports.",
  "Tune LACP bundles and design private VLANs for shared segments.",
  "Troubleshoot Layer 2 incidents with a structured workflow and show output."
 ],
 "lessons": [
  {
   "id": "m2-l1",
   "title": "RSTP Deep Dive",
   "subtitle": "Port roles, states, proposal/agreement and topology change — how Rapid Spanning Tree converges in under a second.",
   "minutes": 35,
   "objectives": [
    "Identify RSTP port roles and states from show output.",
    "Explain the proposal/agreement handshake and why edge and point-to-point ports converge fast.",
    "Predict root bridge, root port and designated port selection, including tie-breakers."
   ],
   "blocks": [
    {
     "type": "text",
     "text": "Rapid Spanning Tree Protocol (RSTP), originally IEEE 802.1w and now part of IEEE 802.1Q, replaced the timer-driven convergence of classic 802.1D with an **explicit handshake** between neighbours. Where 802.1D waited 30–50 seconds for timers, RSTP moves a point-to-point link to forwarding in well under a second — provided the network is designed so that RSTP can use its fast mechanisms."
    },
    {
     "type": "table",
     "head": [
      "Role",
      "Meaning",
      "State in a stable topology"
     ],
     "rows": [
      [
       "Root",
       "The port with the best path towards the root bridge (one per non-root bridge)",
       "Forwarding"
      ],
      [
       "Designated",
       "The best port on a segment for reaching the root; forwards for that segment",
       "Forwarding"
      ],
      [
       "Alternate",
       "Receives a better BPDU from another bridge; a ready backup to the root",
       "Discarding"
      ],
      [
       "Backup",
       "Receives a better BPDU from the same bridge on a shared segment",
       "Discarding"
      ],
      [
       "Disabled",
       "Administratively or physically down",
       "—"
      ]
     ],
     "title": "RSTP port roles"
    },
    {
     "type": "compare",
     "columns": [
      {
       "title": "802.1D",
       "items": [
        "Disabled",
        "Blocking",
        "Listening",
        "Learning",
        "Forwarding"
       ]
      },
      {
       "title": "RSTP",
       "items": [
        "Discarding (replaces disabled, blocking and listening)",
        "Learning",
        "Forwarding"
       ]
      }
     ],
     "title": "States: 802.1D versus RSTP"
    },
    {
     "type": "steps",
     "items": [
      {
       "title": "Elect the root bridge",
       "text": "Lowest bridge ID wins: priority (multiple of 4,096) plus system ID extension, then lowest MAC address."
      },
      {
       "title": "Choose each bridge's root port",
       "text": "Lowest root path cost; then lowest sender bridge ID; then lowest sender port ID (priority and number)."
      },
      {
       "title": "Choose a designated port per segment",
       "text": "The port advertising the lowest root path cost on that segment; ties broken by bridge ID, then port ID."
      },
      {
       "title": "Everything else",
       "text": "Remaining ports become alternate or backup and discard."
      }
     ],
     "title": "Root and port selection"
    },
    {
     "type": "formula",
     "items": [
      {
       "name": "Long path cost (802.1D-2004 and later)",
       "expr": "cost = 20,000,000,000,000 bit/s ÷ link speed",
       "meaning": "1G = 20,000; 10G = 2,000; 25G = 800; 100G = 200. Root path cost is the sum along the path."
      },
      {
       "name": "Bridge ID",
       "expr": "priority (4 bits × 4,096) + system ID extension (12 bits) + MAC (48 bits)",
       "meaning": "Priority 24,576 for VLAN 10 is shown as 24,586 because the VLAN or instance number is added."
      }
     ],
     "title": "Path cost and bridge ID"
    },
    {
     "type": "flow",
     "items": [
      {
       "label": "Proposal",
       "text": "Upstream designated port sends a BPDU with the proposal flag"
      },
      {
       "label": "Sync",
       "text": "Downstream bridge moves its non-edge designated ports to discarding"
      },
      {
       "label": "Agreement",
       "text": "Downstream root port replies with the agreement flag"
      },
      {
       "label": "Forward",
       "text": "Upstream port goes straight to forwarding"
      },
      {
       "label": "Ripple",
       "text": "The handshake repeats on the next link down the tree"
      }
     ],
     "title": "Proposal/agreement on a point-to-point link"
    },
    {
     "type": "callout",
     "kind": "warning",
     "text": "The handshake works only on **point-to-point** links (normally inferred from full duplex) and edge behaviour only on ports configured as **edge**. A shared (half-duplex) link or a host port left as non-edge falls back to slower timer-based transitions.",
     "title": "Fast only where allowed"
    },
    {
     "type": "cli",
     "device": "SW2 · IOS-style CLI",
     "lines": [
      "SW2# show spanning-tree vlan 10",
      "VLAN0010",
      "  Spanning tree enabled protocol rstp",
      "  Root ID    Priority    24586",
      "             Address     0011.2233.4401",
      "             Cost        2000",
      "             Port        49 (TenGigabitEthernet1/1/1)",
      "  Bridge ID  Priority    32778  (priority 32768 sys-id-ext 10)",
      "             Address     0011.2233.4402",
      "Interface           Role Sts Cost      Prio.Nbr Type",
      "------------------- ---- --- --------- -------- -----------",
      "Te1/1/1             Root FWD 2000      128.49   P2p",
      "Te1/1/2             Altn BLK 2000      128.50   P2p",
      "Gi1/0/1             Desg FWD 20000     128.1    P2p Edge"
     ],
     "title": "Reading RSTP roles and states",
     "note": "Many platforms run an instance of RSTP per VLAN (a vendor extension); roles and states are the same as standard RSTP. 'BLK' here means the discarding state."
    },
    {
     "type": "text",
     "text": "**Topology change** is handled differently too. In RSTP only a non-edge port moving **to forwarding** triggers a change; ports going down to discarding do not. The bridge that detects it sets the TC flag in its BPDUs for a short period and flushes MAC addresses learned on its other non-edge ports; neighbours receiving the TC flag do the same and pass it on. Hosts on edge ports are never flushed, which is one more reason to configure edge ports correctly."
    },
    {
     "type": "callout",
     "kind": "pro",
     "text": "Every RSTP bridge sends its own BPDUs every hello time (2 s by default), even if it is not the root. A neighbour's information is aged out after three missed hellos (about 6 s), so a silently failed link is detected without waiting for max age.",
     "title": "Keepalives, not relays"
    },
    {
     "type": "scenario",
     "title": "Slow recovery after an access switch reboot",
     "situation": "After an access switch reboots, users on it report that the network takes about 30 seconds to come back, even though the uplinks are full-duplex 10G and RSTP is enabled everywhere. Host ports are plain access ports with no spanning-tree options. What is the most likely cause?",
     "options": [
      {
       "text": "RSTP cannot converge quickly on 10G links and needs 1G uplinks.",
       "feedback": "Link speed has nothing to do with RSTP's fast mechanisms; point-to-point full-duplex links of any speed qualify.",
       "best": false
      },
      {
       "text": "The root bridge priority is set too high on the distribution switches, delaying the root election.",
       "feedback": "Root placement affects paths, not the per-port delay seen on host ports after a reboot.",
       "best": false
      },
      {
       "text": "Host ports are not configured as edge ports, so they wait through learning before forwarding.",
       "feedback": "Correct. Non-edge ports do not get immediate forwarding; with no peer to complete a handshake, they fall back to timer-based transitions of about 30 s.",
       "best": true
      },
      {
       "text": "BPDU guard is missing on the uplink ports.",
       "feedback": "BPDU guard belongs on edge ports and would shut down an uplink receiving BPDUs; it does not speed anything up.",
       "best": false
      }
     ]
    },
    {
     "type": "keypoints",
     "items": [
      "RSTP roles: root, designated, alternate, backup; states: discarding, learning, forwarding.",
      "Fast convergence needs point-to-point links and correctly configured edge ports.",
      "Proposal/agreement replaces timers with a handshake that ripples down the tree.",
      "Only non-edge ports moving to forwarding generate topology changes."
     ],
     "title": "Key points"
    },
    {
     "type": "quiz",
     "items": [
      {
       "q": "Which RSTP port role provides an immediate replacement if the root port fails?",
       "options": [
        "Backup",
        "Alternate",
        "Designated",
        "Edge"
       ],
       "answer": 1,
       "explain": "An alternate port receives a better BPDU from another bridge and can become the root port immediately. A backup port protects a shared segment from the same bridge."
      },
      {
       "q": "Two paths to the root have equal root path cost. What is the next tie-breaker for choosing the root port?",
       "options": [
        "The highest interface bandwidth",
        "The lowest local port number",
        "The highest sender MAC address",
        "The lowest sender bridge ID"
       ],
       "answer": 3,
       "explain": "After root path cost, RSTP compares the bridge ID of the neighbour sending the BPDU, then the sender's port ID."
      },
      {
       "q": "Using long path costs, what is the root path cost across two 10G links?",
       "options": [
        "4,000",
        "2,000",
        "200",
        "40,000"
       ],
       "answer": 0,
       "explain": "Each 10G link costs 20,000,000,000,000 ÷ 10,000,000,000 = 2,000; two links add up to 4,000."
      },
      {
       "q": "Which event generates an RSTP topology change notification?",
       "options": [
        "An edge port going down",
        "Any port moving to the discarding state",
        "A non-edge port moving to forwarding",
        "A host port coming up"
       ],
       "answer": 2,
       "explain": "In RSTP only non-edge ports transitioning to forwarding cause a topology change. Edge port events and ports going to discarding do not."
      },
      {
       "q": "During proposal/agreement, what does the downstream bridge do before sending its agreement?",
       "options": [
        "Puts its non-edge designated ports into discarding",
        "Flushes every MAC address learned on all its ports",
        "Raises its own bridge priority to become the root",
        "Waits for the forward delay timer to expire twice"
       ],
       "answer": 0,
       "explain": "The sync step blocks downstream designated ports so the newly forwarding upstream link cannot create a loop. The handshake then repeats further down."
      }
     ]
    }
   ]
  },
  {
   "id": "m2-l2",
   "title": "MST: Regions, Instances and Mapping",
   "subtitle": "Multiple Spanning Tree for scalable, standards-based load sharing across VLANs.",
   "minutes": 35,
   "objectives": [
    "Explain what makes switches part of the same MST region.",
    "Design a VLAN-to-instance mapping that load-shares across a distribution pair.",
    "Configure and verify MST, and interpret boundary behaviour."
   ],
   "blocks": [
    {
     "type": "text",
     "text": "Running one spanning tree per VLAN gives fine-grained load sharing but costs CPU, memory and BPDUs for every VLAN on every trunk. A single tree for all VLANs is efficient but leaves half the links idle. **Multiple Spanning Tree (MST)**, originally IEEE 802.1s and now part of 802.1Q, groups many VLANs into a few **instances**, each with its own topology. Two or three instances usually deliver all the load sharing a campus needs."
    },
    {
     "type": "table",
     "head": [
      "Term",
      "Meaning"
     ],
     "rows": [
      [
       "Region",
       "A set of switches with identical MST configuration: name, revision and VLAN-to-instance mapping"
      ],
      [
       "IST (instance 0)",
       "The internal spanning tree of a region; the only instance that sends BPDUs and interacts outside the region"
      ],
      [
       "MSTI",
       "An additional instance (1, 2, …) carrying a group of VLANs, existing only inside its region"
      ],
      [
       "CIST",
       "The common and internal spanning tree spanning all regions and legacy bridges"
      ],
      [
       "Boundary port",
       "A port connecting to a different region or to an RSTP/802.1D bridge"
      ],
      [
       "M-record",
       "Per-instance information carried inside the single IST BPDU"
      ]
     ],
     "title": "MST building blocks"
    },
    {
     "type": "callout",
     "kind": "definition",
     "text": "Switches are in the same region only if the **name**, **revision number** and the **VLAN-to-instance mapping** all match exactly. The mapping is compared as a digest, so a single VLAN mapped differently splits the region in two.",
     "title": "Region membership"
    },
    {
     "type": "cli",
     "device": "DS1 · IOS-style CLI",
     "lines": [
      "spanning-tree mst configuration",
      " name CAMPUS-A",
      " revision 3",
      " instance 1 vlan 10-30",
      " instance 2 vlan 40-60",
      " exit",
      "spanning-tree mode mst",
      "spanning-tree mst 0-1 priority 4096",
      "spanning-tree mst 2 priority 8192",
      "!",
      "DS1# show spanning-tree mst configuration",
      "Name      [CAMPUS-A]",
      "Revision  3     Instances configured 3",
      "Instance  Vlans mapped",
      "--------  ------------------------------",
      "0         1-9,31-39,61-4094",
      "1         10-30",
      "2         40-60"
     ],
     "title": "MST configuration on a distribution switch",
     "note": "DS2 mirrors this with instance 2 at 4096 and instances 0–1 at 8192, so each switch is root for one group of VLANs and backup root for the other."
    },
    {
     "type": "framework",
     "items": [
      {
       "label": "D1",
       "title": "Few instances",
       "text": "Group VLANs by the distribution switch that should forward them; two or three instances are typical."
      },
      {
       "label": "D2",
       "title": "Map everything up front",
       "text": "Map future VLAN ranges now. Changing the mapping later changes the digest and briefly splits the region."
      },
      {
       "label": "D3",
       "title": "Align roots with gateways",
       "text": "Make the instance root the same switch that is VRRP master for those VLANs."
      },
      {
       "label": "D4",
       "title": "One region per campus",
       "text": "Keep the configuration identical everywhere; template it and check it with automation."
      },
      {
       "label": "D5",
       "title": "Avoid legacy boundaries",
       "text": "Interoperation with per-VLAN or 802.1D bridges is possible but adds subtle failure modes."
      }
     ],
     "title": "MST design principles"
    },
    {
     "type": "text",
     "text": "Inside a region the switches exchange one BPDU per port per hello, carrying the IST information plus an **M-record** per instance. Instead of message age, MST uses a **hop count** (20 by default) that each switch in the region decrements. To the outside world the whole region behaves like **one virtual bridge**: neighbouring regions and RSTP bridges only see the IST/CIST information at boundary ports, and all instances follow the IST's forwarding decision at the boundary."
    },
    {
     "type": "callout",
     "kind": "warning",
     "text": "MST blocks per instance, not per VLAN. If a trunk that an instance uses as its forwarding path does not carry one of that instance's VLANs, that VLAN can be cut off even though spanning tree reports a loop-free tree. Keep allowed VLAN lists consistent with the instance design.",
     "title": "VLAN pruning versus instance topology"
    },
    {
     "type": "cli",
     "device": "DS1 · IOS-style CLI",
     "lines": [
      "DS1# show spanning-tree mst 1",
      "##### MST1    vlans mapped:   10-30",
      "Bridge   address 0011.2233.4401  priority 4097 (4096 sysid 1)",
      "Root     this switch for MST1",
      "Interface        Role Sts Cost      Prio.Nbr Type",
      "---------------- ---- --- --------- -------- -----",
      "Te1/1/1          Desg FWD 2000      128.49   P2p",
      "Te1/1/2          Desg FWD 2000      128.50   P2p",
      "Po1              Desg FWD 1000      128.2000 P2p"
     ],
     "title": "Verifying an instance"
    },
    {
     "type": "scenario",
     "title": "A region that keeps splitting",
     "situation": "After adding VLAN 70 for a new IoT project, the team maps it to instance 2 on DS1 and the floor switches but forgets DS2. Shortly afterwards, show output on DS2 lists several trunks as boundary ports and traffic paths change. What is the correct fix?",
     "options": [
      {
       "text": "Raise DS2's priority for instance 2 so it stops being root.",
       "feedback": "Priority changes do not merge regions; the digest mismatch remains.",
       "best": false
      },
      {
       "text": "Apply the identical mapping (and revision) to DS2 so all switches share one region again.",
       "feedback": "Correct. Any difference in name, revision or mapping creates a separate region; matching the configuration restores a single region.",
       "best": true
      },
      {
       "text": "Disable MST on DS2 and run RSTP there instead.",
       "feedback": "That creates a permanent boundary and legacy interoperation, the opposite of what is needed.",
       "best": false
      },
      {
       "text": "Map VLAN 70 to instance 0 on the floor switches only, leaving the distribution switches unchanged.",
       "feedback": "This creates yet another mismatch. All switches must agree on the same mapping.",
       "best": false
      }
     ]
    },
    {
     "type": "keypoints",
     "items": [
      "A region needs identical name, revision and VLAN-to-instance mapping.",
      "Instance 0 (IST) is the only instance that sends BPDUs and talks outside the region.",
      "A region looks like a single bridge to its neighbours.",
      "Map VLANs early, align instance roots with gateways, and keep trunks consistent."
     ],
     "title": "Key points"
    },
    {
     "type": "quiz",
     "items": [
      {
       "q": "Which three items must match for two switches to be in the same MST region?",
       "options": [
        "Bridge priority, region name and hello timer",
        "Region name, revision number and VLAN-to-instance mapping",
        "Revision number, root bridge ID and port costs",
        "Instance count, native VLAN and region name on every trunk"
       ],
       "answer": 1,
       "explain": "Region membership depends on the configuration identifier: name, revision and the mapping digest. Priorities and timers do not define the region."
      },
      {
       "q": "Which MST instance interacts with switches outside the region?",
       "options": [
        "The highest-numbered MSTI",
        "Every MSTI independently",
        "Instance 0, the IST",
        "None; regions do not interact"
       ],
       "answer": 2,
       "explain": "Only the IST sends BPDUs and represents the region at boundary ports. MSTIs exist only inside the region."
      },
      {
       "q": "How does MST limit the diameter of a region instead of using message age?",
       "options": [
        "With the forward delay timer only",
        "By limiting each region to four instances",
        "By capping the number of VLANs per instance",
        "With a hop count decremented by each switch"
       ],
       "answer": 3,
       "explain": "MST uses a maximum hop count (20 by default) inside the region. Message age still applies to CIST information crossing boundaries."
      },
      {
       "q": "Why is it good practice to map future VLAN ranges to instances before they are needed?",
       "options": [
        "Unmapped VLANs are silently dropped by MST",
        "MST supports mapping only at initial boot",
        "Changing the mapping later briefly splits the region",
        "Unmapped VLANs automatically shut down instance 0 at boot"
       ],
       "answer": 2,
       "explain": "Unmapped VLANs belong to instance 0, which works, but changing the mapping later alters the digest and causes reconvergence as switches are updated one by one."
      },
      {
       "q": "A distribution switch should forward VLANs 10–30 and back up VLANs 40–60. How should its priorities be set?",
       "options": [
        "Low priority for the instance with 10–30, higher for 40–60",
        "The same priority for every instance on both switches",
        "Highest possible priority for every instance",
        "Low priority for instance 0 only, defaults on other instances"
       ],
       "answer": 0,
       "explain": "Lower priority wins root election, so the switch becomes root for the first instance and secondary for the other, with its peer configured the opposite way."
      }
     ]
    }
   ]
  },
  {
   "id": "m2-l3",
   "title": "Spanning-Tree Protection",
   "subtitle": "Edge ports, BPDU guard and filter, root guard and loop guard — where each belongs and what it does.",
   "minutes": 30,
   "objectives": [
    "Choose the correct protection feature for each port role in the campus.",
    "Explain the behaviour of err-disabled, root-inconsistent and loop-inconsistent states.",
    "Configure and verify protection features and automatic recovery."
   ],
   "blocks": [
    {
     "type": "text",
     "text": "Spanning tree trusts whatever BPDUs it receives. A misconfigured switch under a desk, a consumer router bridging two ports, or a fibre that loses one direction can all reshape the tree or create a loop. Protection features turn those trusting defaults into **explicit expectations** for each port."
    },
    {
     "type": "table",
     "head": [
      "Feature",
      "Place it on",
      "Trigger",
      "Action",
      "Recovery"
     ],
     "rows": [
      [
       "Edge (PortFast)",
       "Host-facing access ports",
       "Link up",
       "Skip to forwarding; no TC on flaps",
       "—"
      ],
      [
       "BPDU guard",
       "Edge ports",
       "Any BPDU received",
       "Port err-disabled",
       "Manual or err-disable recovery timer"
      ],
      [
       "BPDU filter",
       "Rarely; specific edge cases",
       "—",
       "Stops sending (and possibly processing) BPDUs",
       "—"
      ],
      [
       "Root guard",
       "Designated ports toward switches that must never be root",
       "Superior BPDU received",
       "Port root-inconsistent (discarding)",
       "Automatic when superior BPDUs stop"
      ],
      [
       "Loop guard",
       "Root and alternate ports on switch-to-switch links",
       "BPDUs stop arriving",
       "Port loop-inconsistent (discarding)",
       "Automatic when BPDUs resume"
      ]
     ],
     "title": "Protection features at a glance"
    },
    {
     "type": "layers",
     "items": [
      {
       "label": "Distribution (root)",
       "parts": [
        "Root guard on downlinks to access switches",
        "Loop guard on inter-switch links where enabled"
       ]
      },
      {
       "label": "Access uplinks",
       "parts": [
        "Loop guard on root and alternate ports",
        "No BPDU guard or filter"
       ]
      },
      {
       "label": "Access host ports",
       "parts": [
        "Edge + BPDU guard",
        "Storm control for broadcast and multicast"
       ]
      }
     ],
     "title": "Where each feature belongs"
    },
    {
     "type": "cli",
     "device": "AS1 and DS1 · IOS-style CLI",
     "lines": [
      "! AS1 host ports",
      "interface range GigabitEthernet1/0/1 - 46",
      " switchport mode access",
      " spanning-tree portfast",
      " spanning-tree bpduguard enable",
      " storm-control broadcast level 1.00",
      "! AS1 uplinks",
      "interface range TenGigabitEthernet1/1/1 - 2",
      " spanning-tree guard loop",
      "! DS1 downlink to AS1",
      "interface TenGigabitEthernet1/0/10",
      " spanning-tree guard root",
      "! Automatic recovery after 5 minutes",
      "errdisable recovery cause bpduguard",
      "errdisable recovery interval 300"
     ],
     "title": "Applying protection"
    },
    {
     "type": "cli",
     "device": "AS1 · IOS-style CLI",
     "lines": [
      "%SPANTREE-2-BLOCK_BPDUGUARD: Received BPDU on port Gi1/0/12 with BPDU Guard enabled. Disabling port.",
      "%PM-4-ERR_DISABLE: bpduguard error detected on Gi1/0/12, putting Gi1/0/12 in err-disable state",
      "AS1# show interfaces status err-disabled",
      "Port      Name          Status       Reason",
      "Gi1/0/12  ROOM-412      err-disabled bpduguard",
      "DS1# show spanning-tree inconsistentports",
      "Name        Interface                 Inconsistency",
      "VLAN0010    TenGigabitEthernet1/0/10  Root Inconsistent"
     ],
     "title": "What a violation looks like",
     "note": "Message formats vary between platforms; the information to look for is the same: which port, which feature, which state."
    },
    {
     "type": "compare",
     "columns": [
      {
       "title": "BPDU guard",
       "items": [
        "Keeps sending BPDUs normally",
        "Shuts the port if any BPDU arrives",
        "Fails safe: a rogue switch is cut off",
        "Recommended on every host port"
       ]
      },
      {
       "title": "BPDU filter",
       "items": [
        "Suppresses BPDUs on the port",
        "Applied per interface it can ignore received BPDUs entirely",
        "Fails open: a loop through the port goes undetected",
        "Use only with a documented reason, such as a provider hand-off"
       ]
      }
     ],
     "title": "BPDU guard versus BPDU filter"
    },
    {
     "type": "callout",
     "kind": "warning",
     "text": "Root guard reacts to BPDUs that are **too good** — someone claiming to be a better root. Loop guard reacts to BPDUs that **disappear** — typically a unidirectional fibre fault, where an alternate port would otherwise become designated and start forwarding into a loop. Many platforms do not allow both on the same port.",
     "title": "Root guard and loop guard do different jobs"
    },
    {
     "type": "text",
     "text": "Unidirectional links deserve special attention. If one fibre strand of a pair fails, the switch on the receiving side stops hearing BPDUs while its own transmissions still arrive at the far end. Without loop guard (or a link-level unidirectional detection mechanism offered by the platform), the alternate port ages out its information, becomes designated and forwards — closing a loop. Loop guard holds that port in a loop-inconsistent state until BPDUs return."
    },
    {
     "type": "scenario",
     "title": "A rogue root",
     "situation": "A contractor connects a small switch to a meeting-room port. Its priority is 0, so it becomes root for VLAN 10 and traffic between floors starts flowing through the meeting room. The access port had edge configured but nothing else. Which control would have prevented this most directly?",
     "options": [
      {
       "text": "BPDU guard on the meeting-room access port.",
       "feedback": "Correct. The first BPDU from the contractor's switch would have err-disabled the port, so it could never take part in the topology.",
       "best": true
      },
      {
       "text": "Loop guard on the meeting-room access port.",
       "feedback": "Loop guard acts when BPDUs stop on non-designated ports; it does not block a superior BPDU arriving on an edge port.",
       "best": false
      },
      {
       "text": "BPDU filter on the distribution switches' uplinks.",
       "feedback": "Filtering BPDUs between switches removes loop protection and would make things worse.",
       "best": false
      },
      {
       "text": "Raising the distribution switch priority to 61440.",
       "feedback": "A higher value makes the legitimate root weaker, not stronger.",
       "best": false
      }
     ]
    },
    {
     "type": "keypoints",
     "items": [
      "Edge + BPDU guard on every host port; storm control as a second layer.",
      "Root guard on designated ports toward switches that must never become root.",
      "Loop guard on root and alternate ports to survive unidirectional failures.",
      "Avoid BPDU filter unless there is a documented, reviewed reason."
     ],
     "title": "Key points"
    },
    {
     "type": "quiz",
     "items": [
      {
       "q": "A port configured with root guard receives a superior BPDU. What happens?",
       "options": [
        "It is err-disabled until an engineer manually resets it",
        "It becomes the new root port for that VLAN",
        "It drops the BPDU but keeps forwarding normally",
        "It enters root-inconsistent state and stops forwarding"
       ],
       "answer": 3,
       "explain": "Root guard blocks the port in root-inconsistent state and recovers automatically once superior BPDUs stop."
      },
      {
       "q": "Which feature protects against a unidirectional fibre causing an alternate port to start forwarding?",
       "options": [
        "BPDU guard",
        "Loop guard",
        "Root guard",
        "PortFast"
       ],
       "answer": 1,
       "explain": "Loop guard keeps a root or alternate port discarding when BPDUs stop arriving, which is the symptom of a unidirectional link."
      },
      {
       "q": "Why is BPDU filter considered riskier than BPDU guard on host ports?",
       "options": [
        "It can hide a loop by ignoring BPDUs",
        "It shuts ports down far too often",
        "It raises the switch bridge priority",
        "It disables storm control on the port"
       ],
       "answer": 0,
       "explain": "Guard fails safe by shutting the port; filter can fail open by suppressing the BPDUs that would reveal a loop."
      },
      {
       "q": "Where is root guard normally configured?",
       "options": [
        "On every access switch host port",
        "On access uplinks toward the root",
        "On distribution downlinks toward access switches",
        "On the root bridge's loopback and management ports"
       ],
       "answer": 2,
       "explain": "Root guard belongs on designated ports facing parts of the network that must never contain the root."
      },
      {
       "q": "What does `errdisable recovery cause bpduguard` with an interval of 300 achieve?",
       "options": [
        "BPDU guard is disabled for 300 seconds after boot",
        "BPDUs are rate-limited to 300 per second",
        "The switch reloads itself after 300 seconds of loops",
        "Ports shut by BPDU guard re-enable after 5 minutes"
       ],
       "answer": 3,
       "explain": "The port is automatically brought back after the interval; if the offending switch is still there, BPDU guard will shut it again."
      }
     ]
    }
   ]
  },
  {
   "id": "m2-l4",
   "title": "LACP Tuning and Private VLANs",
   "subtitle": "Building reliable link bundles and isolating hosts within a shared subnet.",
   "minutes": 35,
   "objectives": [
    "Configure LACP with appropriate mode, rate, priorities and minimum links.",
    "Explain hashing behaviour and why bundle size matters.",
    "Describe private VLAN port types and design a private VLAN for a shared segment."
   ],
   "blocks": [
    {
     "type": "text",
     "text": "The **Link Aggregation Control Protocol (LACP)**, defined in IEEE 802.1AX (originally 802.3ad), negotiates bundles of parallel Ethernet links so they act as one logical link. Spanning tree sees one port, so all members forward. LACP's value is not just bandwidth: it verifies that both ends agree before a link joins, preventing the loops and black holes that static bundling can cause."
    },
    {
     "type": "table",
     "head": [
      "Local",
      "Remote",
      "Result"
     ],
     "rows": [
      [
       "Active",
       "Active",
       "Bundle forms"
      ],
      [
       "Active",
       "Passive",
       "Bundle forms"
      ],
      [
       "Passive",
       "Passive",
       "No bundle: neither side starts negotiation"
      ],
      [
       "Static (on)",
       "Active or passive",
       "No LACP agreement; mismatch risk, avoid"
      ]
     ],
     "title": "LACP negotiation modes"
    },
    {
     "type": "table",
     "head": [
      "Parameter",
      "What it does",
      "Guidance"
     ],
     "rows": [
      [
       "Rate fast / slow",
       "Asks the partner to send LACPDUs every 1 s (fast) or 30 s (slow); timeout is three intervals",
       "Fast (3 s detection) for links where physical loss may not be signalled"
      ],
      [
       "System priority",
       "Lower value decides which members are active when more are configured than allowed",
       "Set deliberately on the device that should be in control"
      ],
      [
       "Port priority",
       "Lower value preferred to be active within a bundle",
       "Use with max-bundle to choose standby links"
      ],
      [
       "Max-bundle",
       "Limits active members; extra members go hot-standby",
       "Useful to keep hashing even (e.g. exactly 4 active)"
      ],
      [
       "Min-links",
       "Takes the whole bundle down if fewer members are up",
       "Lets routing move traffic to a healthier path"
      ],
      [
       "Load-balance hash",
       "Fields used to pick a member per flow",
       "Use IP and Layer 4 fields where available"
      ]
     ],
     "title": "Tuning parameters"
    },
    {
     "type": "cli",
     "device": "DS1 · IOS-style CLI",
     "lines": [
      "lacp system-priority 100",
      "port-channel load-balance src-dst-ip",
      "!",
      "interface range TenGigabitEthernet1/1/1 - 4",
      " channel-group 1 mode active",
      " lacp rate fast",
      "!",
      "interface Port-channel1",
      " switchport mode trunk",
      " switchport trunk allowed vlan 10,20,30",
      " port-channel min-links 2",
      "!",
      "DS1# show port-channel summary",
      "Flags: P - bundled  s - suspended  I - stand-alone  S - Layer2  U - in use",
      "Group  Port-channel  Protocol  Ports",
      "1      Po1(SU)       LACP      Te1/1/1(P) Te1/1/2(P) Te1/1/3(P) Te1/1/4(s)"
     ],
     "title": "A tuned LACP trunk",
     "note": "Te1/1/4 is suspended: its configuration (for example allowed VLANs or speed) differs from the bundle. Fix the member, not the bundle."
    },
    {
     "type": "formula",
     "items": [
      {
       "name": "Member selection",
       "expr": "member = hash(selected header fields) mod buckets",
       "meaning": "Every packet of a flow uses the same member, so one large flow never exceeds one link's speed."
      },
      {
       "name": "Even distribution",
       "expr": "buckets ÷ members should be a whole number",
       "meaning": "On platforms with eight hash buckets, 2, 4 or 8 members share evenly; 3 or 6 members do not."
      }
     ],
     "title": "Hashing and distribution"
    },
    {
     "type": "callout",
     "kind": "warning",
     "text": "Members must match in speed, duplex, switchport mode, allowed and native VLANs, and MTU. Mismatched members are suspended or left stand-alone. Configure the logical port-channel interface and let the members inherit, rather than editing members one by one.",
     "title": "Consistency is mandatory"
    },
    {
     "type": "text",
     "text": "A **private VLAN** (PVLAN) splits one VLAN — and one IP subnet — into isolated pieces at Layer 2. The **primary VLAN** carries traffic from the gateway to everyone. **Secondary VLANs** carry traffic from hosts: an **isolated** secondary lets hosts talk only to promiscuous ports, while a **community** secondary lets hosts talk to each other within the community and to promiscuous ports. Typical uses are hosting providers, shared server segments, guest networks and multi-tenant building systems."
    },
    {
     "type": "table",
     "head": [
      "Port type",
      "Belongs to",
      "Can communicate with"
     ],
     "rows": [
      [
       "Promiscuous",
       "Primary VLAN (mapped to secondaries)",
       "All ports: isolated, community and promiscuous"
      ],
      [
       "Isolated host",
       "Isolated secondary VLAN",
       "Promiscuous ports only"
      ],
      [
       "Community host",
       "A community secondary VLAN",
       "Same community and promiscuous ports"
      ]
     ],
     "title": "Private VLAN port types"
    },
    {
     "type": "cli",
     "device": "SW3 · IOS-style CLI",
     "lines": [
      "vlan 101",
      " private-vlan isolated",
      "vlan 102",
      " private-vlan community",
      "vlan 100",
      " private-vlan primary",
      " private-vlan association 101,102",
      "!",
      "interface GigabitEthernet1/0/5",
      " switchport mode private-vlan host",
      " switchport private-vlan host-association 100 101",
      "interface GigabitEthernet1/0/48",
      " switchport mode private-vlan promiscuous",
      " switchport private-vlan mapping 100 101,102"
     ],
     "title": "Private VLAN for a shared server segment",
     "note": "Gi1/0/48 faces the gateway or firewall. Remember that isolation is Layer 2 only: if the gateway routes traffic back between hosts in the same subnet, the isolation can be bypassed unless the gateway blocks it."
    },
    {
     "type": "scenario",
     "title": "A slow backup despite four links",
     "situation": "A backup server connects to a four-member LACP bundle of 10G links. A single nightly backup stream to one storage array never exceeds about 10 Gbit/s, although interface counters show all members healthy. What is the explanation?",
     "options": [
      {
       "text": "LACP is in slow mode, which halves bundle throughput.",
       "feedback": "The LACPDU rate affects failure detection, not forwarding capacity.",
       "best": false
      },
      {
       "text": "The bundle needs min-links 4 to use every member.",
       "feedback": "Min-links only decides when the bundle goes down; it does not change hashing.",
       "best": false
      },
      {
       "text": "Spanning tree is blocking three of the four members.",
       "feedback": "Spanning tree sees the bundle as one port and blocks or forwards it as a whole.",
       "best": false
      },
      {
       "text": "Per-flow hashing keeps one flow on one member link.",
       "feedback": "Correct. A single flow hashes to one member, so it is limited to that member's speed. More flows, or a faster single link, are needed for more throughput.",
       "best": true
      }
     ]
    },
    {
     "type": "quiz",
     "items": [
      {
       "q": "Both ends of a bundle are configured as LACP passive. What happens?",
       "options": [
        "The bundle forms at slow rate",
        "No bundle forms because neither side initiates",
        "The bundle forms but only one link is used",
        "The switches silently fall back to static bundling"
       ],
       "answer": 1,
       "explain": "Passive ports only respond to LACPDUs. At least one side must be active."
      },
      {
       "q": "What is the purpose of `port-channel min-links 2` on a four-member bundle?",
       "options": [
        "Force at least two members into hot-standby",
        "Limit each flow to a maximum of two members",
        "Prevent more than two members from joining the bundle at once",
        "Bring the bundle down when fewer than two members remain"
       ],
       "answer": 3,
       "explain": "Min-links lets a degraded bundle go down so routing or spanning tree can choose a better path instead of overloading the remaining link."
      },
      {
       "q": "With fast LACP rate, roughly how long before a silent partner failure is detected?",
       "options": [
        "About 1 second",
        "About 3 seconds",
        "About 30 seconds",
        "About 90 seconds"
       ],
       "answer": 1,
       "explain": "Fast rate sends LACPDUs every second and times out after three missed intervals; slow rate takes about 90 seconds."
      },
      {
       "q": "In a private VLAN, which ports can a host on an isolated port reach at Layer 2?",
       "options": [
        "Other isolated ports in the same VLAN",
        "Community ports in any community",
        "Only promiscuous ports",
        "Every port in the primary VLAN"
       ],
       "answer": 2,
       "explain": "Isolated hosts can talk only to promiscuous ports, typically the gateway or firewall."
      },
      {
       "q": "A member of a bundle shows as suspended. What is the most likely cause?",
       "options": [
        "Its configuration differs from the other members",
        "Its LACP port priority is lower than the others",
        "It is the newest member to join the bundle",
        "Its partner port is configured with LACP active mode"
       ],
       "answer": 0,
       "explain": "Suspension indicates incompatibility such as different VLANs, speed or mode. Port priority affects active/standby selection, not suspension."
      }
     ]
    }
   ]
  },
  {
   "id": "m2-l5",
   "title": "Layer 2 Troubleshooting Workflow",
   "subtitle": "A repeatable method, the show commands that matter and how to read them under pressure.",
   "minutes": 35,
   "objectives": [
    "Apply a structured, bottom-up workflow to Layer 2 incidents.",
    "Interpret interface, trunk, MAC table and spanning-tree output to localise faults.",
    "Recognise the signatures of loops, MAC flapping and native VLAN mismatches."
   ],
   "blocks": [
    {
     "type": "text",
     "text": "Layer 2 faults are often noisy and widespread: a loop or a pruning error affects many users at once, and symptoms appear far from the cause. A disciplined workflow — define, localise, verify each layer, fix, confirm — prevents the classic mistake of changing several things at once and never knowing which one worked."
    },
    {
     "type": "steps",
     "items": [
      {
       "title": "Define the problem",
       "text": "Who is affected, which VLANs, since when, what changed? Get one source and one destination to test with."
      },
      {
       "title": "Follow the frame",
       "text": "Trace the path hop by hop using MAC address tables and LLDP neighbours."
      },
      {
       "title": "Check the physical layer",
       "text": "Interface state, speed and duplex, error counters, optics levels."
      },
      {
       "title": "Check VLANs and trunks",
       "text": "VLAN exists and is active, access VLAN correct, VLAN allowed and forwarding on every trunk, native VLAN matches."
      },
      {
       "title": "Check spanning tree and bundles",
       "text": "Root location, port roles, inconsistent ports, topology change counters, LACP member state."
      },
      {
       "title": "Fix one thing and confirm",
       "text": "Change one variable, re-test end to end, document the root cause."
      }
     ],
     "title": "ZCNP Layer 2 workflow"
    },
    {
     "type": "cli",
     "device": "AS3 · IOS-style CLI",
     "lines": [
      "AS3# show mac address-table address 0050.56a1.22b3",
      "Vlan    Mac Address       Type        Ports",
      "  20    0050.56a1.22b3    DYNAMIC     Te1/1/1",
      "AS3# show lldp neighbors",
      "Device ID   Local Intf   Hold-time  Capability  Port ID",
      "DS1         Te1/1/1      120        B,R         Te1/0/13",
      "DS2         Te1/1/2      120        B,R         Te1/0/13"
     ],
     "title": "Following a MAC address",
     "note": "LLDP (IEEE 802.1AB) tells you which device and port to log into next. Repeat until the MAC points at an access port."
    },
    {
     "type": "cli",
     "device": "DS2 · IOS-style CLI",
     "lines": [
      "DS2# show interfaces trunk",
      "Port      Mode  Encapsulation  Status    Native vlan",
      "Te1/0/13  on    802.1q         trunking  1",
      "Port      Vlans allowed on trunk",
      "Te1/0/13  10,30",
      "Port      Vlans in spanning tree forwarding state and not pruned",
      "Te1/0/13  10,30"
     ],
     "title": "Trunk check",
     "note": "VLAN 20 is not allowed on this trunk, and the native VLAN is 1 while AS3 uses 99 on its side — two faults on one link."
    },
    {
     "type": "table",
     "head": [
      "Symptom",
      "Likely cause",
      "Command that proves it"
     ],
     "rows": [
      [
       "One VLAN fails across a trunk, others work",
       "VLAN not allowed, pruned or not created",
       "show interfaces trunk, show vlan brief"
      ],
      [
       "Untagged traffic leaks between VLANs",
       "Native VLAN mismatch",
       "show interfaces trunk on both ends"
      ],
      [
       "CPU high, links saturated, MACs flapping",
       "Layer 2 loop",
       "show interfaces counters, show logging, topology change counters"
      ],
      [
       "Host intermittently unreachable",
       "Duplicate MAC or IP, or MAC flapping between ports",
       "show mac address-table, show logging"
      ],
      [
       "Rising CRC or input errors",
       "Bad cable, optic or duplex mismatch",
       "show interfaces, optic diagnostics"
      ],
      [
       "Port down with err-disabled",
       "BPDU guard, storm control or link-flap protection",
       "show interfaces status err-disabled"
      ]
     ],
     "title": "Symptoms and likely causes"
    },
    {
     "type": "cli",
     "device": "DS1 · IOS-style CLI",
     "lines": [
      "%SW_MATM-4-MACFLAP_NOTIF: Host 0050.56a1.22b3 in vlan 20 is flapping between port Te1/0/13 and port Te1/0/14",
      "DS1# show spanning-tree vlan 20 detail | include changes|from",
      "  Number of topology changes 1843 last change occurred 00:00:02 ago",
      "          from TenGigabitEthernet1/0/14"
     ],
     "title": "Signature of a loop",
     "note": "Thousands of topology changes and a recent source port point you to where to look next: follow the 'from' interface downstream."
    },
    {
     "type": "callout",
     "kind": "pro",
     "text": "During an active loop, shut the suspected redundant link or the port that topology changes come from to restore service, while capturing logs and counters. Root-cause analysis can follow once users are working again.",
     "title": "Stabilise first, then diagnose"
    },
    {
     "type": "scenario",
     "title": "Management traffic in the wrong VLAN",
     "situation": "A new trunk links AS7 to DS2. AS7's untagged management traffic appears in VLAN 1 on DS2, while AS7 expects it in VLAN 99. Tagged user VLANs work normally. What is the right fix?",
     "options": [
      {
       "text": "Enable BPDU guard on the new trunk so that frames from mismatched VLANs are blocked at once.",
       "feedback": "BPDU guard belongs on edge ports and would shut the trunk; it does not address native VLAN handling.",
       "best": false
      },
      {
       "text": "Remove VLAN 99 from AS7 and use VLAN 1 for switch management on every device in the campus.",
       "feedback": "Moving management into VLAN 1 hides the mismatch and weakens security; the native VLANs should match.",
       "best": false
      },
      {
       "text": "Configure the same native VLAN on both ends, then confirm with show interfaces trunk.",
       "feedback": "Correct. Untagged frames are placed in each side's native VLAN, so the two ends must agree.",
       "best": true
      },
      {
       "text": "Convert the link into an access port in VLAN 99 on both switches to carry the management VLAN.",
       "feedback": "An access port carries only one VLAN, so all user VLANs on the trunk would be lost.",
       "best": false
      }
     ]
    },
    {
     "type": "case",
     "title": "Telecom regional office: the Monday morning outage",
     "context": "A telecom operator's regional office (eight floors, two distribution switches, RSTP per VLAN) suffers a 25-minute outage every few weeks, always on Monday morning. During outages the distribution CPUs reach 100% and logs show MAC flapping between two access uplinks. Floor teams often re-patch desks over weekends. The access ports are configured as edge ports but have no further protection, and storm control is not configured.",
     "questions": [
      "What is the most likely cause of the recurring outages?",
      "What evidence would you collect during the next event to confirm it?",
      "Which configuration changes would prevent it, and on which ports?",
      "How would you make sure the fix stays applied across all access switches?"
     ],
     "answer": "The pattern points to a **Layer 2 loop created at the edge**: weekend re-patching connects two wall ports together, or a small unmanaged switch/hub bridges two ports. Because the ports are edge ports without BPDU guard, they forward immediately and the loop forms. During the next event capture topology-change counters and the 'from' interface, MAC-flap logs, and interface counters to locate the floor and port. Prevent it with **BPDU guard on every edge port** (with err-disable recovery), **storm control** on access ports, **loop guard** on access uplinks, and **root guard** on distribution downlinks. Enforce it with a standard access-port template and an automated compliance check that reports any edge port lacking BPDU guard."
    },
    {
     "type": "template",
     "title": "Spanning-tree design sheet",
     "purpose": "Document the intended spanning-tree topology so that show output can be compared against it during troubleshooting.",
     "columns": [
      "VLANs / instance",
      "Primary root (priority)",
      "Secondary root (priority)",
      "VRRP master",
      "Uplink protection",
      "Edge port protection"
     ],
     "example": [
      [
       "MST1: VLANs 10–30",
       "DS1 (4096)",
       "DS2 (8192)",
       "DS1",
       "Loop guard on access uplinks; root guard on DS downlinks",
       "Edge + BPDU guard + storm control"
      ],
      [
       "MST2: VLANs 40–60",
       "DS2 (4096)",
       "DS1 (8192)",
       "DS2",
       "Loop guard on access uplinks; root guard on DS downlinks",
       "Edge + BPDU guard + storm control"
      ]
     ],
     "rows": 6
    },
    {
     "type": "checklist",
     "title": "Layer 2 health checklist",
     "items": [
      "Root bridge for every VLAN or instance is the intended distribution switch.",
      "Secondary root is explicitly configured, not left to chance.",
      "Every host port is an edge port with BPDU guard.",
      "Root guard on distribution downlinks; loop guard on access uplinks.",
      "Trunks carry only required VLANs and native VLANs match on both ends.",
      "All LACP bundles show every member bundled; no suspended members.",
      "Storm control is configured on access ports.",
      "Topology change counters are stable and monitored.",
      "MST configuration is identical on all switches in the region."
     ]
    },
    {
     "type": "reflection",
     "prompt": "Think of the last Layer 2 incident you handled. Which step of the workflow would have shortened it the most, and what check could you automate so it never happens silently again?"
    },
    {
     "type": "terms",
     "items": [
      {
       "term": "RSTP",
       "def": "Rapid Spanning Tree Protocol, the handshake-based spanning tree now defined within IEEE 802.1Q."
      },
      {
       "term": "Alternate port",
       "def": "An RSTP port that receives a better BPDU from another bridge and stands by to replace the root port."
      },
      {
       "term": "Edge port",
       "def": "A port expected to connect only to end hosts; it forwards immediately and does not cause topology changes."
      },
      {
       "term": "Proposal/agreement",
       "def": "The RSTP handshake that moves a point-to-point designated port to forwarding without timers."
      },
      {
       "term": "MST region",
       "def": "Switches sharing the same MST name, revision and VLAN-to-instance mapping."
      },
      {
       "term": "IST",
       "def": "Internal spanning tree, MST instance 0; the only instance that sends BPDUs and talks outside the region."
      },
      {
       "term": "BPDU guard",
       "def": "Err-disables an edge port that receives any BPDU."
      },
      {
       "term": "Root guard",
       "def": "Blocks a port that receives a superior BPDU, keeping the root where it was designed."
      },
      {
       "term": "Loop guard",
       "def": "Blocks a root or alternate port whose BPDUs stop arriving, protecting against unidirectional links."
      },
      {
       "term": "LACP",
       "def": "Link Aggregation Control Protocol (IEEE 802.1AX) for negotiating link bundles."
      },
      {
       "term": "Min-links",
       "def": "The minimum number of active members a bundle needs to stay up."
      },
      {
       "term": "Private VLAN",
       "def": "A VLAN subdivided into isolated and community secondary VLANs sharing one subnet."
      },
      {
       "term": "Promiscuous port",
       "def": "A private VLAN port that can communicate with all isolated and community ports."
      },
      {
       "term": "MAC flapping",
       "def": "A MAC address repeatedly learned on different ports, a common sign of a loop."
      }
     ]
    },
    {
     "type": "quiz",
     "items": [
      {
       "q": "`show interfaces trunk` shows VLAN 20 is missing from the 'allowed' list on a trunk. What is the impact?",
       "options": [
        "VLAN 20 is carried untagged as native",
        "VLAN 20 traffic cannot cross that trunk",
        "VLAN 20 is load-shared to another trunk",
        "Only broadcasts in VLAN 20 are dropped"
       ],
       "answer": 1,
       "explain": "A VLAN that is not allowed is not carried at all on that trunk. Unless another path exists, VLAN 20 is cut off beyond it."
      },
      {
       "q": "Logs show a host MAC flapping between two uplink ports and topology changes are rising rapidly. What should you suspect first?",
       "options": [
        "A duplex mismatch",
        "A DHCP scope that is full",
        "A native VLAN mismatch",
        "A Layer 2 loop"
       ],
       "answer": 3,
       "explain": "MAC flapping between ports combined with constant topology changes is the signature of a loop."
      },
      {
       "q": "Which protocol helps you identify the next-hop switch and port while tracing a MAC address?",
       "options": [
        "LLDP",
        "LACP",
        "VRRP",
        "BFD"
       ],
       "answer": 0,
       "explain": "LLDP (IEEE 802.1AB) advertises device and port identity to neighbours, so you can follow the path hop by hop."
      },
      {
       "q": "Interface counters show steadily increasing CRC errors on one access port. What is the most likely cause?",
       "options": [
        "A VLAN missing from the uplink trunk's allowed list",
        "The port being an edge port",
        "A physical problem such as cabling or duplex",
        "A spanning-tree root election"
       ],
       "answer": 2,
       "explain": "CRC errors are a physical-layer symptom: damaged cabling, bad optics or a duplex mismatch."
      },
      {
       "q": "During an active loop affecting the whole office, what is the best first action?",
       "options": [
        "Reload both distribution switches at once",
        "Isolate the suspected link to restore service, then diagnose",
        "Disable spanning tree to stop the BPDUs",
        "Wait for spanning tree to detect and resolve the loop by itself"
       ],
       "answer": 1,
       "explain": "Stabilise first: shutting the suspected port stops the loop while evidence is captured. Reloading or disabling spanning tree risks making it worse."
      }
     ]
    }
   ]
  }
 ]
});
TRACK.modules.push({
 "id": "m3",
 "order": 3,
 "code": "IGP",
 "title": "OSPF and Route Control",
 "subtitle": "Multi-area OSPF, special areas, OSPFv3, IS-IS fundamentals and safe route control between domains.",
 "outcomes": [
  "Design multi-area OSPF and identify LSA types 1–5 and 7.",
  "Choose stub, totally stubby and NSSA areas and summarise correctly.",
  "Configure OSPFv3 and explain IS-IS levels and NET addressing.",
  "Control routes with prefix lists, route maps, tags and policy-based routing.",
  "Troubleshoot OSPF adjacencies and missing routes methodically."
 ],
 "lessons": [
  {
   "id": "m3-l1",
   "title": "OSPF Multi-Area Design and LSA Types",
   "subtitle": "Areas, router roles and the link-state advertisements that describe them.",
   "minutes": 35,
   "objectives": [
    "Design a multi-area OSPF topology with correct ABR and ASBR placement.",
    "Identify LSA types 1, 2, 3, 4, 5 and 7 by originator and flooding scope.",
    "Calculate OSPF interface cost and set a sensible reference bandwidth."
   ],
   "blocks": [
    {
     "type": "text",
     "text": "OSPFv2 (RFC 2328) is a link-state protocol: every router in an area holds an identical **link-state database (LSDB)** and runs the shortest-path-first calculation on it. Areas exist to limit how far detail travels. Inside an area, routers know the full topology; between areas, they only learn prefixes and costs. That boundary keeps SPF calculations small, contains flapping, and gives you natural points for summarisation."
    },
    {
     "type": "keypoints",
     "items": [
      "Area 0 is the backbone; every other area must attach to it (a virtual link is a temporary exception, not a design).",
      "An Area Border Router (ABR) has interfaces in area 0 and at least one other area.",
      "An Autonomous System Boundary Router (ASBR) injects external routes, for example from static routes, BGP or another IGP.",
      "Inter-area traffic always passes through the backbone, which prevents inter-area routing loops.",
      "Router IDs must be unique; set them explicitly from a loopback plan."
     ],
     "title": "Multi-area rules"
    },
    {
     "type": "table",
     "head": [
      "Type",
      "Name",
      "Originated by",
      "Flooding scope",
      "Describes"
     ],
     "rows": [
      [
       "1",
       "Router LSA",
       "Every router",
       "Its own area",
       "The router's links and their costs"
      ],
      [
       "2",
       "Network LSA",
       "Designated router",
       "Its own area",
       "A multi-access segment and the routers attached to it"
      ],
      [
       "3",
       "Summary (network) LSA",
       "ABR",
       "Into an area",
       "Prefixes from other areas with their cost"
      ],
      [
       "4",
       "ASBR summary LSA",
       "ABR",
       "Into an area",
       "How to reach an ASBR located in another area"
      ],
      [
       "5",
       "AS external LSA",
       "ASBR",
       "Whole domain except stub and NSSA areas",
       "External prefixes"
      ],
      [
       "7",
       "NSSA external LSA",
       "ASBR inside an NSSA",
       "The NSSA only; translated to type 5 by an ABR",
       "External prefixes injected inside an NSSA"
      ]
     ],
     "title": "LSA types you must recognise"
    },
    {
     "type": "layers",
     "items": [
      {
       "label": "Domain-wide",
       "parts": [
        "Type 5 external routes",
        "Not in stub, totally stubby or NSSA areas"
       ]
      },
      {
       "label": "Between areas",
       "parts": [
        "Type 3 summaries generated by ABRs",
        "Type 4 pointers to ASBRs"
       ]
      },
      {
       "label": "Inside one area",
       "parts": [
        "Type 1 router LSAs",
        "Type 2 network LSAs",
        "Type 7 in an NSSA"
       ]
      }
     ],
     "title": "Where each LSA lives"
    },
    {
     "type": "formula",
     "items": [
      {
       "name": "Interface cost",
       "expr": "cost = reference bandwidth ÷ interface bandwidth (minimum 1)",
       "meaning": "With the common default reference of 100 Mbit/s, every link of 100 Mbit/s or faster costs 1, so OSPF cannot tell 1G from 100G."
      },
      {
       "name": "Raised reference",
       "expr": "reference 400,000 Mbit/s: 400G = 1, 100G = 4, 10G = 40, 1G = 400",
       "meaning": "Set the same reference on every router so costs are consistent across the domain."
      },
      {
       "name": "Path cost",
       "expr": "path cost = sum of outgoing interface costs along the path",
       "meaning": "SPF picks the lowest total; equal totals give ECMP."
      }
     ],
     "title": "OSPF cost"
    },
    {
     "type": "cli",
     "device": "R2 · IOS-style CLI",
     "lines": [
      "router ospf 1",
      " router-id 10.255.0.2",
      " auto-cost reference-bandwidth 400000",
      " passive-interface default",
      " no passive-interface TenGigabitEthernet0/0/0",
      " no passive-interface TenGigabitEthernet0/0/1",
      "!",
      "interface TenGigabitEthernet0/0/0",
      " ip ospf network point-to-point",
      " ip ospf 1 area 0",
      "interface TenGigabitEthernet0/0/1",
      " ip ospf network point-to-point",
      " ip ospf 1 area 10"
     ],
     "title": "ABR configuration"
    },
    {
     "type": "cli",
     "device": "R2 · IOS-style CLI",
     "lines": [
      "R2# show ip ospf database",
      "            OSPF Router with ID (10.255.0.2) (Process ID 1)",
      "                Router Link States (Area 0)",
      "Link ID         ADV Router      Age   Seq#       Checksum Link count",
      "10.255.0.1      10.255.0.1      412   0x80000005 0x00A1B2 3",
      "10.255.0.2      10.255.0.2      398   0x80000007 0x00C3D4 2",
      "                Summary Net Link States (Area 0)",
      "Link ID         ADV Router      Age   Seq#       Checksum",
      "10.10.0.0       10.255.0.2      301   0x80000002 0x004455",
      "                Summary ASB Link States (Area 0)",
      "10.255.0.30     10.255.0.3      301   0x80000001 0x0066AA",
      "                Type-5 AS External Link States",
      "Link ID         ADV Router      Age   Seq#       Checksum Tag",
      "0.0.0.0         10.255.0.30     120   0x80000001 0x0077BB 1"
     ],
     "title": "Reading the LSDB",
     "note": "The type 4 entry is generated by ABR 10.255.0.3 so routers in area 0 can reach ASBR 10.255.0.30, which lives in another area."
    },
    {
     "type": "table",
     "head": [
      "Code",
      "Route type",
      "Preference"
     ],
     "rows": [
      [
       "O",
       "Intra-area",
       "Most preferred"
      ],
      [
       "O IA",
       "Inter-area",
       "Second"
      ],
      [
       "O E1 / O N1",
       "External type 1: external metric plus internal cost",
       "Third"
      ],
      [
       "O E2 / O N2",
       "External type 2: external metric only (common default for redistribution)",
       "Least preferred"
      ]
     ],
     "title": "OSPF route preference"
    },
    {
     "type": "callout",
     "kind": "insight",
     "text": "OSPF chooses by route type first and cost second. An intra-area route with cost 500 beats an inter-area route with cost 20 to the same prefix. Remember this when a 'cheaper' path is ignored.",
     "title": "Preference beats metric"
    },
    {
     "type": "scenario",
     "title": "Placing a new site",
     "situation": "A company adds a new regional office with 40 subnets. It will connect to two existing routers that are both in area 0. The team suggests putting the office directly in area 0 'to keep things simple'. What is the better design?",
     "options": [
      {
       "text": "Create a new area for the office and make the two connecting routers ABRs that summarise its range.",
       "feedback": "Correct. A separate area contains flapping and SPF work, and two ABRs give redundancy while advertising one summary to the backbone.",
       "best": true
      },
      {
       "text": "Put the office in area 0 so it can reach every other area directly.",
       "feedback": "Possible, but it grows the backbone's LSDB and exposes it to every local flap; it misses the purpose of areas.",
       "best": false
      },
      {
       "text": "Create a new area attached only through a virtual link.",
       "feedback": "Virtual links are a repair tool for a broken backbone design, not a way to attach new areas.",
       "best": false
      },
      {
       "text": "Run a separate OSPF process at the office and redistribute it into the backbone process on both routers.",
       "feedback": "This adds redistribution complexity and loop risk without any benefit over a normal area.",
       "best": false
      }
     ]
    },
    {
     "type": "keypoints",
     "items": [
      "All areas attach to area 0; ABRs connect them, ASBRs inject external routes.",
      "Types 1 and 2 stay inside an area; 3 and 4 cross area borders; 5 is domain-wide; 7 lives in an NSSA.",
      "Raise the reference bandwidth consistently so modern links have meaningful costs.",
      "OSPF prefers intra-area, then inter-area, then E1, then E2 — regardless of cost."
     ],
     "title": "Key points"
    },
    {
     "type": "quiz",
     "items": [
      {
       "q": "Which router originates a type 2 LSA?",
       "options": [
        "The designated router on a multi-access segment",
        "Every ABR attached to the backbone area",
        "Any ASBR that redistributes static routes",
        "The router with the highest router ID in area 0"
       ],
       "answer": 0,
       "explain": "Network LSAs are generated by the DR to describe a broadcast or NBMA segment and its attached routers."
      },
      {
       "q": "What does a type 4 LSA tell routers in an area?",
       "options": [
        "Which external prefixes exist in the domain",
        "Which router is the DR on each segment",
        "Which prefixes belong to the backbone area only",
        "How to reach an ASBR located in another area"
       ],
       "answer": 3,
       "explain": "An ABR generates a type 4 so routers can compute the cost to an ASBR outside their area; the external prefixes themselves are in type 5 LSAs."
      },
      {
       "q": "With a reference bandwidth of 100,000 Mbit/s, what is the cost of a 10G interface?",
       "options": [
        "1",
        "100",
        "10",
        "1,000"
       ],
       "answer": 2,
       "explain": "100,000 ÷ 10,000 = 10."
      },
      {
       "q": "A router has an inter-area route with cost 30 and an E1 route with cost 10 to the same prefix. Which is installed?",
       "options": [
        "The E1 route",
        "The inter-area route",
        "Both, as equal-cost paths",
        "Neither; the routes conflict"
       ],
       "answer": 1,
       "explain": "Route type is compared before cost: inter-area is preferred over any external route."
      },
      {
       "q": "What is the role of an ABR in an NSSA?",
       "options": [
        "Originating type 2 LSAs for every segment inside the NSSA area",
        "Blocking all type 3 LSAs from the backbone",
        "Translating type 7 LSAs into type 5 for the rest of the domain",
        "Converting type 1 LSAs into type 7 externals"
       ],
       "answer": 2,
       "explain": "External routes injected inside an NSSA travel as type 7; an ABR translates them into type 5 so other areas learn them."
      }
     ]
    }
   ]
  },
  {
   "id": "m3-l2",
   "title": "Stub Areas, NSSA and Summarisation",
   "subtitle": "Shrink the LSDB and the routing table while keeping reachability and control.",
   "minutes": 35,
   "objectives": [
    "Choose between stub, totally stubby, NSSA and totally NSSA areas.",
    "Configure inter-area and external summarisation and explain the discard route.",
    "Calculate a summary prefix from a contiguous address block."
   ],
   "blocks": [
    {
     "type": "text",
     "text": "Many areas do not need to know every external or inter-area prefix. A branch region with two exits to the backbone only needs a default route to send everything else upstream. OSPF's special area types filter LSA types at the ABR and replace them with a default route, while **summarisation** replaces many prefixes with one. Both shrink LSDBs, speed up SPF and contain instability."
    },
    {
     "type": "table",
     "head": [
      "Area type",
      "Type 3",
      "Type 4/5",
      "Type 7",
      "Default route"
     ],
     "rows": [
      [
       "Normal",
       "Yes",
       "Yes",
       "No",
       "Only if originated"
      ],
      [
       "Stub",
       "Yes",
       "No",
       "No",
       "Type 3 default from ABR"
      ],
      [
       "Totally stubby",
       "Default only",
       "No",
       "No",
       "Type 3 default from ABR"
      ],
      [
       "NSSA",
       "Yes",
       "No",
       "Yes",
       "Not automatic; ABR can originate a type 7 default"
      ],
      [
       "Totally NSSA",
       "Default only",
       "No",
       "Yes",
       "Type 3 default from ABR"
      ]
     ],
     "title": "Area types compared"
    },
    {
     "type": "callout",
     "kind": "warning",
     "text": "The stub or NSSA setting is carried in hello packets. If one router in the area is configured as stub and its neighbour is not, they will not form an adjacency. The 'no-summary' option that makes an area totally stubby is needed only on the ABR.",
     "title": "Every router must agree"
    },
    {
     "type": "cli",
     "device": "R2 (ABR) · IOS-style CLI",
     "lines": [
      "router ospf 1",
      " area 20 stub no-summary",
      " area 30 nssa no-summary",
      " area 10 range 10.10.0.0 255.255.240.0",
      "!",
      "! Every internal router in area 20:",
      "router ospf 1",
      " area 20 stub",
      "!",
      "! ASBR summarising redistributed routes:",
      "router ospf 1",
      " summary-address 172.16.0.0 255.255.0.0"
     ],
     "title": "Configuring area types and summaries"
    },
    {
     "type": "compare",
     "columns": [
      {
       "title": "Inter-area (at the ABR)",
       "items": [
        "`area X range` command",
        "Summarises type 1/2 information into one type 3 LSA",
        "Only on the ABR that connects the area",
        "Hides flapping subnets from other areas"
       ]
      },
      {
       "title": "External (at the ASBR)",
       "items": [
        "`summary-address` command",
        "Summarises type 5 or type 7 LSAs",
        "On the ASBR, or on the NSSA translator ABR",
        "Reduces imported routes from other domains"
       ]
      }
     ],
     "title": "Two kinds of summarisation"
    },
    {
     "type": "formula",
     "items": [
      {
       "name": "Block size",
       "expr": "number of networks = 2^(original length − summary length)",
       "meaning": "Sixteen /24 networks fit exactly into one /20, because 2^(24 − 20) = 16."
      },
      {
       "name": "Summary length",
       "expr": "summary length = original length − log2(number of networks)",
       "meaning": "Sixteen contiguous /24s starting at 10.10.0.0 summarise to 10.10.0.0/20 (mask 255.255.240.0)."
      },
      {
       "name": "Alignment test",
       "expr": "the first network must be divisible by the block size",
       "meaning": "10.10.16.0–10.10.31.0 summarises to 10.10.16.0/20; 10.10.8.0–10.10.23.0 does not fit a single /20."
      }
     ],
     "title": "Summary calculation"
    },
    {
     "type": "cli",
     "device": "R2 and R21 · IOS-style CLI",
     "lines": [
      "R2# show ip route 10.10.0.0 255.255.240.0 longer-prefixes | include Null0",
      "O        10.10.0.0/20 is a summary, 00:12:44, Null0",
      "!",
      "R21# show ip route ospf",
      "O*IA  0.0.0.0/0 [110/41] via 10.20.0.1, 00:05:11, TenGigabitEthernet0/0/0",
      "O     10.20.4.0/24 [110/80] via 10.20.0.5, 00:05:11, TenGigabitEthernet0/0/1"
     ],
     "title": "Verifying the result",
     "note": "R2 installs a discard route for the summary so packets to unused parts of the range are dropped rather than looping. R21 in the totally stubby area sees only intra-area routes and one default."
    },
    {
     "type": "callout",
     "kind": "pro",
     "text": "If a summarising ABR loses its links into the area but still advertises the summary, traffic is attracted and dropped. Use two ABRs with consistent summaries, and design so each ABR keeps a path to every component subnet.",
     "title": "Summaries and black holes"
    },
    {
     "type": "scenario",
     "title": "An area that only needs a default",
     "situation": "A retail region has 120 stores in area 40, connected to the backbone through two ABRs. Stores also use a local internet connection that is redistributed as a static route on each store router for guest traffic only. The store routers are small and struggle with the 9,000 external routes from the data centre. Which area type fits best?",
     "options": [
      {
       "text": "Totally stubby: it removes the most routes from the store routers.",
       "feedback": "A stub area does not allow redistribution inside it, which the stores need.",
       "best": false
      },
      {
       "text": "Normal area with `area 40 range` on the ABRs.",
       "feedback": "A range summarises the stores toward the backbone but does nothing to block the 9,000 externals flowing in.",
       "best": false
      },
      {
       "text": "Stub: it removes external routes and keeps inter-area detail.",
       "feedback": "A stub area still forbids redistribution inside the area, so the store static routes could not be injected.",
       "best": false
      },
      {
       "text": "Totally NSSA: stores receive only a default from the ABRs and can still inject their own external routes as type 7.",
       "feedback": "Correct. It removes type 3, 4 and 5 information from the stores while still allowing local redistribution.",
       "best": true
      }
     ]
    },
    {
     "type": "keypoints",
     "items": [
      "Stub and totally stubby areas block externals; NSSA variants allow local externals as type 7.",
      "The stub flag must match on every router in the area; no-summary is configured only on the ABR.",
      "Summarise at ABRs with `area range` and at ASBRs with `summary-address`.",
      "Summaries create a discard route; design redundant ABRs to avoid black holes."
     ],
     "title": "Key points"
    },
    {
     "type": "quiz",
     "items": [
      {
       "q": "Which area type blocks type 3, 4 and 5 LSAs but still allows redistribution inside the area?",
       "options": [
        "Totally NSSA",
        "Totally stubby",
        "Stub",
        "Normal"
       ],
       "answer": 0,
       "explain": "Totally NSSA receives only a default as type 3 and carries local externals as type 7. Stub and totally stubby areas forbid redistribution."
      },
      {
       "q": "Two neighbours in area 20 will not form an adjacency after one was configured as `area 20 stub`. Why?",
       "options": [
        "The ABR has not yet sent a default route",
        "Stub areas only support point-to-point network links",
        "The router IDs must be reset after the change",
        "The stub flag in the hello packets does not match"
       ],
       "answer": 3,
       "explain": "Area type is negotiated in hellos; all routers in the area must use the same setting."
      },
      {
       "q": "What is the smallest single summary covering 10.20.32.0/24 through 10.20.47.0/24?",
       "options": [
        "10.20.32.0/20",
        "10.20.32.0/21",
        "10.20.0.0/18",
        "10.20.32.0/19"
       ],
       "answer": 0,
       "explain": "Sixteen /24s need a /20, and 32 is divisible by 16, so 10.20.32.0/20 covers exactly 10.20.32.0–10.20.47.255."
      },
      {
       "q": "Why does a summarising router install a route to Null0 for the summary?",
       "options": [
        "To advertise the summary to its neighbours over BGP",
        "To mark the summary as a backup route only",
        "To make the summary preferred over any default route in the area",
        "To drop traffic for unused parts of the range and prevent loops"
       ],
       "answer": 3,
       "explain": "The discard route catches packets for addresses in the summary that have no more-specific route, so they are not sent back towards a default and looped."
      },
      {
       "q": "Where is `summary-address` used in OSPF?",
       "options": [
        "On an ABR to summarise inter-area routes",
        "On an ASBR to summarise external routes",
        "On any router to summarise its connected links",
        "On the DR to summarise a broadcast segment"
       ],
       "answer": 1,
       "explain": "`summary-address` summarises type 5 or type 7 routes at the ASBR (or the NSSA translator). Inter-area summaries use `area range`."
      }
     ]
    }
   ]
  },
  {
   "id": "m3-l3",
   "title": "OSPFv3 and an IS-IS Overview",
   "subtitle": "Running link-state routing for IPv6, and understanding the other major IGP used in large networks.",
   "minutes": 35,
   "objectives": [
    "Configure OSPFv3 for IPv6 and explain how it differs from OSPFv2.",
    "Describe IS-IS levels, area boundaries and NET addressing.",
    "Compare OSPF and IS-IS for an enterprise or service-provider core."
   ],
   "blocks": [
    {
     "type": "text",
     "text": "**OSPFv3** (RFC 5340) brings the OSPF model to IPv6. The SPF algorithm, areas, LSA flooding and neighbour states are familiar; what changes is how addresses are carried. In OSPFv3, router and network LSAs describe only topology, while prefixes move into new LSA types. With the address-family extension (RFC 5838), one OSPFv3 process can also carry IPv4 routes, although many networks keep OSPFv2 for IPv4."
    },
    {
     "type": "table",
     "head": [
      "Aspect",
      "OSPFv2",
      "OSPFv3"
     ],
     "rows": [
      [
       "Carries",
       "IPv4",
       "IPv6 (and IPv4 with address families)"
      ],
      [
       "Runs on",
       "IPv4, protocol 89",
       "IPv6, next header 89, using link-local addresses"
      ],
      [
       "Router ID",
       "32-bit",
       "Still 32-bit; must be set manually on an IPv6-only router"
      ],
      [
       "Prefixes",
       "Inside router and network LSAs",
       "In intra-area-prefix and link LSAs; topology LSAs carry no addresses"
      ],
      [
       "Next hop",
       "Neighbour's interface IPv4 address",
       "Neighbour's link-local address"
      ],
      [
       "Authentication",
       "Built into the protocol",
       "IPsec, or the authentication trailer (RFC 7166)"
      ],
      [
       "Instances per link",
       "One",
       "Several, using an instance ID"
      ]
     ],
     "title": "OSPFv2 versus OSPFv3"
    },
    {
     "type": "cli",
     "device": "R1 · IOS-style CLI",
     "lines": [
      "ipv6 unicast-routing",
      "!",
      "router ospfv3 1",
      " router-id 10.255.0.1",
      " address-family ipv6 unicast",
      "  passive-interface default",
      "  no passive-interface GigabitEthernet0/0",
      " exit-address-family",
      "!",
      "interface GigabitEthernet0/0",
      " ipv6 address 2001:db8:0:12::1/64",
      " ospfv3 1 ipv6 area 0",
      "!",
      "R1# show ipv6 route ospf",
      "O   2001:DB8:0:20::/64 [110/2]",
      "     via FE80::2, GigabitEthernet0/0"
     ],
     "title": "OSPFv3 for IPv6",
     "note": "The next hop is the neighbour's link-local address. Without an IPv4 address to borrow, the router ID must be configured explicitly."
    },
    {
     "type": "text",
     "text": "**IS-IS** (ISO/IEC 10589, extended for IP by RFC 1195) is the other major link-state IGP. It is common in service-provider cores and large data-centre and campus fabrics. It was designed for a different network layer, so it runs **directly over Layer 2**, not over IP. That makes it independent of IP addressing and simple to extend: new features are added as **TLVs** (type-length-value fields), which is how IS-IS carries IPv6 (RFC 5308) and wide metrics (RFC 5305) in the same protocol instance."
    },
    {
     "type": "layers",
     "items": [
      {
       "label": "Level 2 (backbone)",
       "parts": [
        "Connects areas",
        "Must be a contiguous chain of L2-capable routers"
       ]
      },
      {
       "label": "Level 1/Level 2",
       "parts": [
        "Belongs to one area and to the backbone",
        "Sets the attached bit so L1 routers get a default route"
       ]
      },
      {
       "label": "Level 1",
       "parts": [
        "Knows only its own area",
        "Sends inter-area traffic to the nearest L1/L2 router"
       ]
      }
     ],
     "title": "IS-IS hierarchy"
    },
    {
     "type": "formula",
     "items": [
      {
       "name": "Structure",
       "expr": "NET = area ID . system ID (6 bytes) . NSEL (00)",
       "meaning": "49.0001.0100.0000.0001.00 is area 49.0001, system ID 0100.0000.0001, NSEL 00."
      },
      {
       "name": "System ID from a loopback",
       "expr": "10.0.0.1 → 010.000.000.001 → 0100.0000.0001",
       "meaning": "Pad each octet to three digits and regroup into three blocks of four for a unique, traceable ID."
      },
      {
       "name": "AFI 49",
       "expr": "49 = private address space",
       "meaning": "Like RFC 1918 for IP, 49 is used for networks that do not need globally registered NSAP addresses."
      }
     ],
     "title": "Reading a NET"
    },
    {
     "type": "cli",
     "device": "R1 · IOS-style CLI",
     "lines": [
      "router isis CORE",
      " net 49.0001.0100.0000.0001.00",
      " is-type level-2-only",
      " metric-style wide",
      " passive-interface Loopback0",
      "!",
      "interface TenGigabitEthernet0/0/0",
      " ip router isis CORE",
      " isis network point-to-point",
      "!",
      "R1# show isis neighbors",
      "System Id   Type Interface  IP Address   State Holdtime Circuit Id",
      "R2          L2   Te0/0/0    10.0.12.2    UP    27       00"
     ],
     "title": "Basic IS-IS"
    },
    {
     "type": "table",
     "head": [
      "Aspect",
      "OSPF",
      "IS-IS"
     ],
     "rows": [
      [
       "Transport",
       "IP",
       "Directly over Layer 2"
      ],
      [
       "Area boundary",
       "On the router (interfaces in different areas)",
       "On the link (each router belongs to one area)"
      ],
      [
       "Backbone",
       "Area 0",
       "Contiguous Level 2 routers"
      ],
      [
       "Database units",
       "Several LSA types",
       "One LSP per router per level, with TLVs"
      ],
      [
       "Multi-access election",
       "DR and BDR, non-preemptive",
       "DIS, preemptive, no backup"
      ],
      [
       "IPv4 and IPv6",
       "OSPFv2 and OSPFv3 (or v3 address families)",
       "One instance carries both"
      ]
     ],
     "title": "OSPF versus IS-IS"
    },
    {
     "type": "scenario",
     "title": "Choosing an IGP for a new core",
     "situation": "A national ISP-style backbone for a utility company will carry IPv4 and IPv6, connect 60 core routers, and must be easy to extend with segment routing in future. The team knows OSPF well but has some IS-IS experience. Which choice is most defensible?",
     "options": [
      {
       "text": "OSPFv2 for IPv4 and static routes for IPv6.",
       "feedback": "Static IPv6 routing does not scale or converge; it fails the dual-stack requirement.",
       "best": false
      },
      {
       "text": "IS-IS with a single Level 2 domain and wide metrics, carrying IPv4 and IPv6 in one instance.",
       "feedback": "Correct. A flat L2 design suits 60 core routers, one instance handles both address families, and TLV extensibility suits future features.",
       "best": true
      },
      {
       "text": "OSPFv3 for IPv6 and OSPFv2 for IPv4, each designed with ten areas and summarisation at every ABR.",
       "feedback": "Workable, but two protocols and many areas add complexity that a 60-router core does not need.",
       "best": false
      },
      {
       "text": "IS-IS with every router Level 1 in separate areas.",
       "feedback": "Level 1 routers in different areas cannot exchange routes without a Level 2 backbone.",
       "best": false
      }
     ]
    },
    {
     "type": "keypoints",
     "items": [
      "OSPFv3 runs over IPv6 link-local addresses and moves prefixes into separate LSAs.",
      "Set the OSPFv3 router ID explicitly on IPv6-only routers.",
      "IS-IS runs over Layer 2, uses levels instead of area 0, and extends through TLVs.",
      "A NET encodes area, system ID and NSEL; derive system IDs from loopbacks."
     ],
     "title": "Key points"
    },
    {
     "type": "quiz",
     "items": [
      {
       "q": "What next-hop address does OSPFv3 install for an IPv6 route learned from a neighbour?",
       "options": [
        "The neighbour's global unicast address",
        "The neighbour's 32-bit router ID",
        "The neighbour's link-local address",
        "The all-OSPF-routers multicast address"
       ],
       "answer": 2,
       "explain": "OSPFv3 runs over link-local addresses and uses them as next hops."
      },
      {
       "q": "Why must the OSPFv3 router ID be configured manually on an IPv6-only router?",
       "options": [
        "The 32-bit ID cannot be derived from IPv6 addresses",
        "OSPFv3 requires the ID to match the loopback IPv6 address",
        "OSPFv3 refuses to run without a configured area range",
        "Automatic IDs would conflict with link-local addresses"
       ],
       "answer": 0,
       "explain": "The router ID is still 32-bit. Without any IPv4 address to select from, the router has nothing to derive it from."
      },
      {
       "q": "In the NET 49.0002.0100.0000.0005.00, what is the area?",
       "options": [
        "0100.0000.0005",
        "49",
        "00",
        "49.0002"
       ],
       "answer": 3,
       "explain": "Everything before the 6-byte system ID and the NSEL is the area ID: 49.0002."
      },
      {
       "q": "Where is the area boundary in IS-IS?",
       "options": [
        "On a router with interfaces in two different areas",
        "On the link between routers in different areas",
        "At the designated intermediate system",
        "At the router with the highest system ID"
       ],
       "answer": 1,
       "explain": "Each IS-IS router belongs to one area; the boundary falls on the links between areas, unlike OSPF where it sits on the ABR."
      },
      {
       "q": "How does a Level 1 IS-IS router normally reach destinations outside its area?",
       "options": [
        "Through type 3 summaries advertised by an ABR",
        "Through a static route that must be added by hand",
        "Via a default route towards the nearest attached L1/L2 router",
        "Through Level 2 LSPs that L1/L2 routers flood into the Level 1 area"
       ],
       "answer": 2,
       "explain": "L1/L2 routers set the attached bit in their L1 LSP, and L1 routers install a default route towards the closest one."
      }
     ]
    }
   ]
  },
  {
   "id": "m3-l4",
   "title": "Route Control: Prefix Lists, Route Maps, Redistribution and PBR",
   "subtitle": "Select, tag, filter and steer routes and packets without creating loops.",
   "minutes": 40,
   "objectives": [
    "Write prefix lists with ge/le and predict what they match.",
    "Build route maps with correct match/set logic.",
    "Redistribute safely between routing domains using tags.",
    "Apply policy-based routing to steer selected traffic."
   ],
   "blocks": [
    {
     "type": "text",
     "text": "Real networks rarely run one routing protocol cleanly from edge to edge. Mergers, acquisitions, static routes to partners and BGP at the edge all need **route control**: deciding exactly which prefixes cross from one domain to another, with which metrics and markings. The tools are simple — prefix lists, route maps and tags — but the logic must be exact, because a single wrong line can black-hole a network or create a routing loop."
    },
    {
     "type": "table",
     "head": [
      "Entry",
      "Matches"
     ],
     "rows": [
      [
       "permit 10.0.0.0/8",
       "Only the prefix 10.0.0.0/8 itself"
      ],
      [
       "permit 10.0.0.0/8 le 24",
       "Any prefix inside 10.0.0.0/8 with length 8 to 24"
      ],
      [
       "permit 10.0.0.0/8 ge 24 le 24",
       "Only /24 prefixes inside 10.0.0.0/8"
      ],
      [
       "permit 10.0.0.0/8 ge 25",
       "Prefixes inside 10.0.0.0/8 with length 25 to 32"
      ],
      [
       "permit 0.0.0.0/0",
       "Only the default route"
      ],
      [
       "permit 0.0.0.0/0 le 32",
       "Every IPv4 prefix"
      ]
     ],
     "title": "Prefix list matching"
    },
    {
     "type": "callout",
     "kind": "definition",
     "text": "A prefix list and a route map both end with an invisible deny. Anything not explicitly permitted is dropped. Add a final permit-all entry only when that is truly what you want.",
     "title": "Implicit deny"
    },
    {
     "type": "framework",
     "items": [
      {
       "label": "R1",
       "title": "Sequences in order",
       "text": "Statements are evaluated by sequence number; the first statement that matches decides the outcome."
      },
      {
       "label": "R2",
       "title": "AND across match types",
       "text": "Several match commands of different types in one statement must all be true."
      },
      {
       "label": "R3",
       "title": "OR within one match",
       "text": "Several values in one match command (for example two prefix lists) match if any one matches."
      },
      {
       "label": "R4",
       "title": "No match clause",
       "text": "A statement without any match matches everything — useful as a final catch-all."
      },
      {
       "label": "R5",
       "title": "Implicit deny",
       "text": "Routes that match no statement are denied."
      }
     ],
     "title": "Route-map logic"
    },
    {
     "type": "text",
     "text": "**Redistribution** copies routes from one routing source into another. Each protocol needs a sensible **seed metric** for imported routes, and each router compares candidates first by **administrative distance**, a router-local trust value. Where two domains are redistributed into each other at **more than one point**, routes can leak back into their origin domain with a better administrative distance or metric, causing suboptimal paths or loops. Tags are the standard defence."
    },
    {
     "type": "table",
     "head": [
      "Source",
      "Typical default"
     ],
     "rows": [
      [
       "Connected",
       "0"
      ],
      [
       "Static",
       "1"
      ],
      [
       "eBGP",
       "20"
      ],
      [
       "OSPF",
       "110"
      ],
      [
       "IS-IS",
       "115"
      ],
      [
       "iBGP",
       "200"
      ]
     ],
     "title": "Common default administrative distances"
    },
    {
     "type": "cli",
     "device": "R5 (one of two boundary routers) · IOS-style CLI",
     "lines": [
      "route-map ISIS-TO-OSPF deny 10",
      " match tag 110",
      "route-map ISIS-TO-OSPF permit 20",
      " set tag 115",
      "!",
      "route-map OSPF-TO-ISIS deny 10",
      " match tag 115",
      "route-map OSPF-TO-ISIS permit 20",
      " set tag 110",
      "!",
      "router ospf 1",
      " redistribute isis CORE level-2 subnets route-map ISIS-TO-OSPF",
      "router isis CORE",
      " metric-style wide",
      " redistribute ospf 1 metric 20 level-2 route-map OSPF-TO-ISIS"
     ],
     "title": "Mutual redistribution with tags",
     "note": "Routes leaving OSPF are tagged 110 and routes leaving IS-IS are tagged 115. Each direction denies routes carrying the other side's tag, so nothing returns to where it came from. IS-IS needs wide metrics to carry tags."
    },
    {
     "type": "cli",
     "device": "R7 · IOS-style CLI",
     "lines": [
      "ip access-list extended GUEST-WEB",
      " permit tcp 10.50.0.0 0.0.255.255 any eq 443",
      "!",
      "route-map PBR-GUEST permit 10",
      " match ip address GUEST-WEB",
      " set ip next-hop 203.0.113.1",
      "!",
      "interface GigabitEthernet0/2",
      " description Guest VLAN gateway",
      " ip policy route-map PBR-GUEST"
     ],
     "title": "Policy-based routing",
     "note": "PBR is applied to traffic arriving on the interface. Packets that match are sent to 203.0.113.1; everything else is routed normally. Track the next hop's reachability so traffic is not black-holed if it fails."
    },
    {
     "type": "compare",
     "columns": [
      {
       "title": "Route policy (prefix lists, route maps)",
       "items": [
        "Acts on routing updates",
        "Changes what the routing table contains",
        "Affects all traffic to a destination"
       ]
      },
      {
       "title": "Policy-based routing",
       "items": [
        "Acts on data packets",
        "Overrides the routing table for matching traffic",
        "Can match source, protocol or port"
       ]
      }
     ],
     "title": "Route filtering versus PBR"
    },
    {
     "type": "template",
     "title": "Redistribution matrix",
     "purpose": "Agree, for every boundary router and direction, exactly what is imported and how it is marked.",
     "columns": [
      "Boundary router",
      "From → To",
      "Prefixes allowed",
      "Seed metric",
      "Tag set",
      "Tags denied"
     ],
     "example": [
      [
       "R5",
       "IS-IS → OSPF",
       "10.64.0.0/12 le 24",
       "E2 20",
       "115",
       "110"
      ],
      [
       "R5",
       "OSPF → IS-IS",
       "10.0.0.0/12 le 24",
       "20 (wide)",
       "110",
       "115"
      ]
     ],
     "rows": 6
    },
    {
     "type": "scenario",
     "title": "A loop after a merger",
     "situation": "After adding a second boundary router between OSPF and IS-IS with mutual redistribution, some IS-IS prefixes are reached through the OSPF domain and back, and traceroutes show loops during failures. Route maps redistribute everything with no filtering. What is the best fix?",
     "options": [
      {
       "text": "Remove the second boundary router to keep one redistribution point.",
       "feedback": "That removes the loop but also the redundancy the design needed.",
       "best": false
      },
      {
       "text": "Lower OSPF's administrative distance below IS-IS on every router.",
       "feedback": "Changing distances network-wide shifts the problem rather than preventing feedback.",
       "best": false
      },
      {
       "text": "Tag routes on redistribution and deny the other domain's tag in the opposite direction on both boundary routers.",
       "feedback": "Correct. Tags stop routes re-entering their original domain at the second boundary point.",
       "best": true
      },
      {
       "text": "Use policy-based routing on the boundary routers to steer IS-IS prefixes.",
       "feedback": "PBR acts on packets and does not stop routes from being redistributed back.",
       "best": false
      }
     ]
    },
    {
     "type": "quiz",
     "items": [
      {
       "q": "Which prefix list entry matches only /24 prefixes inside 172.16.0.0/12?",
       "options": [
        "permit 172.16.0.0/12 le 24",
        "permit 172.16.0.0/12 ge 24 le 24",
        "permit 172.16.0.0/24",
        "permit 172.16.0.0/12 ge 12"
       ],
       "answer": 1,
       "explain": "ge 24 le 24 restricts the length to exactly 24 within the /12. `le 24` also matches /12 to /23."
      },
      {
       "q": "A route-map statement contains `match ip address prefix-list A` and `match tag 50`. When does it match?",
       "options": [
        "When the route is in list A or carries tag 50",
        "When the route is in list A but carries no tag at all",
        "Only when neither condition is true",
        "When the route is in list A and carries tag 50"
       ],
       "answer": 3,
       "explain": "Different match types in the same statement are combined with AND."
      },
      {
       "q": "What happens to a route that matches no statement in a route map used for redistribution?",
       "options": [
        "It is redistributed with default values",
        "It is redistributed with tag 0",
        "It is not redistributed",
        "It is redistributed as external type 1"
       ],
       "answer": 2,
       "explain": "Route maps end with an implicit deny."
      },
      {
       "q": "Why are tags used with mutual redistribution at two boundary routers?",
       "options": [
        "To stop routes being redistributed back into their origin domain",
        "To give redistributed routes a lower metric than internal ones",
        "To make OSPF prefer external over internal routes",
        "To ensure that both boundary routers advertise the same seed metric"
       ],
       "answer": 0,
       "explain": "Tags mark where a route came from so the opposite route map can deny it, preventing feedback loops."
      },
      {
       "q": "Policy-based routing is configured on a router's LAN interface. Which traffic does it affect?",
       "options": [
        "Matching packets leaving through that interface",
        "Routing updates received on that interface",
        "Matching packets arriving on that interface",
        "All traffic routed by the router"
       ],
       "answer": 2,
       "explain": "PBR is applied to incoming packets on the interface where the policy is attached; unmatched packets follow the routing table."
      }
     ]
    }
   ]
  },
  {
   "id": "m3-l5",
   "title": "Troubleshooting OSPF Adjacencies and Routes",
   "subtitle": "Neighbour states, the parameters that must match and a fast path from symptom to root cause.",
   "minutes": 35,
   "objectives": [
    "Map each stuck neighbour state to its likely causes.",
    "Use show and debug output to prove a mismatch.",
    "Distinguish adjacency faults from route-installation faults."
   ],
   "blocks": [
    {
     "type": "text",
     "text": "Most OSPF incidents fall into two families: **neighbours that will not reach Full**, and **neighbours that are Full but routes are missing or wrong**. The first is about hello and database-exchange parameters; the second about area design, LSA filtering, network types, summarisation and route preference. Identify the family first, then the specific cause."
    },
    {
     "type": "flow",
     "items": [
      {
       "label": "Down",
       "text": "No hellos received"
      },
      {
       "label": "Init",
       "text": "Hello received, our ID not yet listed"
      },
      {
       "label": "2-Way",
       "text": "Bidirectional; DR/BDR election on multi-access"
      },
      {
       "label": "ExStart / Exchange",
       "text": "Master/slave chosen; database descriptions swapped"
      },
      {
       "label": "Loading",
       "text": "Missing LSAs requested"
      },
      {
       "label": "Full",
       "text": "Databases synchronised"
      }
     ],
     "title": "OSPF neighbour states"
    },
    {
     "type": "table",
     "head": [
      "Symptom",
      "Likely causes"
     ],
     "rows": [
      [
       "No neighbour at all",
       "Interface passive, ACL or filter dropping multicast, wrong subnet, area ID, hello/dead timers, authentication or stub-flag mismatch"
      ],
      [
       "Stuck in Init",
       "Hellos only flowing one way (filtering, unidirectional link)"
      ],
      [
       "2-Way with some neighbours",
       "Normal between non-DR routers on a broadcast segment"
      ],
      [
       "Stuck in ExStart/Exchange",
       "MTU mismatch, duplicate router ID, unicast reachability issues"
      ],
      [
       "Full but routes missing",
       "Network-type mismatch, area type filtering, summarisation, distribute lists, route preference"
      ]
     ],
     "title": "Stuck states and likely causes"
    },
    {
     "type": "cli",
     "device": "R1 · IOS-style CLI",
     "lines": [
      "R1# show ip ospf interface GigabitEthernet0/1",
      "GigabitEthernet0/1 is up, line protocol is up",
      "  Internet Address 10.1.12.1/30, Area 0",
      "  Process ID 1, Router ID 10.255.0.1, Network Type POINT_TO_POINT, Cost: 40",
      "  Timer intervals configured, Hello 30, Dead 120, Wait 120, Retransmit 5",
      "  Neighbor Count is 0, Adjacent neighbor count is 0",
      "R1# debug ip ospf hello",
      "OSPF-1 HELLO Gi0/1: Rcv hello from 10.255.0.2 area 0 10.1.12.2",
      "OSPF-1 HELLO Gi0/1: Mismatched hello parameters from 10.1.12.2",
      "OSPF-1 HELLO Gi0/1: Dead R 40 C 120, Hello R 10 C 30"
     ],
     "title": "Proving a timer mismatch",
     "note": "R = received from the neighbour, C = configured locally. Debug output is illustrative and differs between platforms; limit debugs to one interface or neighbour on production devices."
    },
    {
     "type": "cli",
     "device": "R1 · IOS-style CLI",
     "lines": [
      "R1# show ip ospf neighbor",
      "Neighbor ID     Pri   State        Dead Time   Address      Interface",
      "10.255.0.3        1   EXSTART/DR   00:00:36    10.1.13.3    GigabitEthernet0/2",
      "R1# show interfaces GigabitEthernet0/2 | include MTU",
      "  MTU 1500 bytes, BW 1000000 Kbit/sec",
      "R3# show interfaces GigabitEthernet0/2 | include MTU",
      "  MTU 9000 bytes, BW 1000000 Kbit/sec"
     ],
     "title": "Stuck in ExStart",
     "note": "Database description packets carry the interface MTU; a router rejects DBDs advertising a larger MTU than its own. Fix the MTU on both sides; ignoring the MTU check only hides the problem."
    },
    {
     "type": "callout",
     "kind": "warning",
     "text": "If one side is point-to-point and the other broadcast, the default timers are the same, so the adjacency can reach Full. But one router describes a point-to-point link and the other a transit network with a DR, so SPF cannot validate the link and routes through it are missing. Always compare network types on both ends.",
     "title": "The silent network-type mismatch"
    },
    {
     "type": "steps",
     "items": [
      {
       "title": "Is the neighbour listed?",
       "text": "`show ip ospf neighbor`. If absent, check passive interfaces, ACLs and `show ip ospf interface` on both sides."
      },
      {
       "title": "Compare hello parameters",
       "text": "Area, subnet and mask (on multi-access), timers, authentication, stub flags, network type."
      },
      {
       "title": "Stuck beyond 2-Way?",
       "text": "Check MTU on both ends and look for duplicate router ID messages."
      },
      {
       "title": "Full but no route?",
       "text": "Check the LSDB for the LSA, the area type, summaries and filters, then the routing table for a better route from another source."
      }
     ],
     "title": "Fast path from symptom to cause"
    },
    {
     "type": "scenario",
     "title": "One-way neighbour",
     "situation": "On a shared segment, R1 lists R2 in state INIT, while R2 does not list R1 at all. Yesterday a new inbound access list was applied on R2's interface to that segment. What is the most likely fix?",
     "options": [
      {
       "text": "Lower the OSPF priority on R1 so that R2 becomes the designated router for the shared segment.",
       "feedback": "DR election happens after two-way communication exists; priority cannot fix hellos being dropped.",
       "best": false
      },
      {
       "text": "Permit OSPF (IP protocol 89, including 224.0.0.5 and 224.0.0.6) in R2's new inbound ACL.",
       "feedback": "Correct. R2 drops R1's hellos, so R1 hears R2 but never sees itself listed: the classic one-way INIT symptom.",
       "best": true
      },
      {
       "text": "Raise the MTU on R1 to match the jumbo setting on R2 so that database descriptions are accepted.",
       "feedback": "MTU mismatches cause ExStart problems, which only appear after the neighbours have reached 2-Way.",
       "best": false
      },
      {
       "text": "Change the segment's area to a stub area on both routers to reduce flooding between them both.",
       "feedback": "Area type mismatches stop adjacencies; changing it here adds a new problem without addressing the ACL.",
       "best": false
      }
     ]
    },
    {
     "type": "case",
     "title": "Hospital group: merging a diagnostics network",
     "context": "A private hospital group acquires a diagnostics chain. The group runs OSPF with area 0 in two data centres and one area per hospital. The diagnostics chain runs IS-IS Level 2 with 30 sites. Integration must be redundant, and both teams want to keep their IGP for a year. In a test, the team connects two boundary routers, redistributes everything both ways, and sees laboratory systems reached through odd paths and occasional loops. One boundary router also fails to form an OSPF adjacency with its data-centre neighbour, which sits in ExStart.",
     "questions": [
      "What is causing the odd paths and loops?",
      "How would you fix the redistribution design?",
      "What is the most likely cause of the ExStart problem, and how would you confirm it?",
      "How would you document the integration so operators can troubleshoot it later?"
     ],
     "answer": "The loops come from **mutual redistribution at two points without filtering**: routes from IS-IS enter OSPF at one boundary router and return into IS-IS at the other. Fix it with **tags** (set on export, deny the other side's tag on import) on both boundary routers, explicit **prefix lists** defining which ranges each domain may send, and **summarisation** of each domain's ranges at the boundary so only a few stable prefixes cross. Enable wide metrics in IS-IS so tags are carried. ExStart almost always means an **MTU mismatch** (or a duplicate router ID); compare `show interfaces` MTU on both ends and fix the MTU rather than ignoring the check. Document a redistribution matrix and an OSPF area plan, including boundary routers, tags, prefix ranges and seed metrics."
    },
    {
     "type": "template",
     "title": "OSPF area plan",
     "purpose": "Plan areas, their type, ABRs and summaries before configuring.",
     "columns": [
      "Area",
      "Type",
      "Sites / role",
      "ABRs",
      "Summary range",
      "Notes"
     ],
     "example": [
      [
       "0",
       "Backbone",
       "Data centres and core",
       "—",
       "—",
       "Reference bandwidth 400,000 everywhere"
      ],
      [
       "40",
       "Totally NSSA",
       "120 retail stores",
       "R40A, R40B",
       "10.40.0.0/16",
       "Local internet as type 7; both ABRs summarise"
      ]
     ],
     "rows": 6
    },
    {
     "type": "checklist",
     "title": "OSPF troubleshooting checklist",
     "items": [
      "Neighbour listed and in the expected state.",
      "Area ID, subnet and mask match on both ends.",
      "Hello and dead timers match.",
      "Authentication type and key match.",
      "Area type (stub/NSSA) matches on all routers in the area.",
      "Network type is the same on both ends.",
      "MTU matches on both ends.",
      "Router IDs are unique.",
      "Expected LSA is present in the LSDB.",
      "No better route from another source or route type is overriding OSPF."
     ]
    },
    {
     "type": "reflection",
     "prompt": "Which OSPF parameter mismatch have you seen most often in your own networks? What standard configuration template or automated check would make it impossible to repeat?"
    },
    {
     "type": "terms",
     "items": [
      {
       "term": "LSDB",
       "def": "Link-state database; identical on every router in an OSPF area."
      },
      {
       "term": "ABR",
       "def": "Area Border Router, connecting area 0 to one or more other areas."
      },
      {
       "term": "ASBR",
       "def": "Autonomous System Boundary Router, injecting external routes into OSPF."
      },
      {
       "term": "Type 3 LSA",
       "def": "Summary LSA generated by an ABR to advertise inter-area prefixes."
      },
      {
       "term": "Type 5 LSA",
       "def": "AS external LSA flooded throughout the domain except stub and NSSA areas."
      },
      {
       "term": "Type 7 LSA",
       "def": "NSSA external LSA, translated into type 5 by an ABR."
      },
      {
       "term": "Totally stubby area",
       "def": "An area receiving only intra-area routes and a default route from the ABR."
      },
      {
       "term": "NSSA",
       "def": "Not-so-stubby area: blocks type 5 LSAs but allows local redistribution as type 7."
      },
      {
       "term": "Reference bandwidth",
       "def": "The value divided by interface bandwidth to calculate OSPF cost."
      },
      {
       "term": "NET",
       "def": "Network entity title: the IS-IS address of a router, encoding area and system ID."
      },
      {
       "term": "Attached bit",
       "def": "Set by an IS-IS L1/L2 router so Level 1 routers install a default route towards it."
      },
      {
       "term": "Prefix list",
       "def": "An ordered list matching prefixes by address and length, with ge and le options."
      },
      {
       "term": "Route tag",
       "def": "A numeric label attached to a route, used to make policy decisions during redistribution."
      },
      {
       "term": "Policy-based routing",
       "def": "Forwarding selected packets according to policy rather than the routing table."
      }
     ]
    },
    {
     "type": "quiz",
     "items": [
      {
       "q": "Two routers are stuck in ExStart. What should you check first?",
       "options": [
        "Interface MTU on both ends",
        "The DR priority values",
        "The OSPF process IDs",
        "The OSPF reference bandwidth"
       ],
       "answer": 0,
       "explain": "Database description exchange fails when MTUs differ. Process IDs are local and need not match; reference bandwidth affects cost only."
      },
      {
       "q": "A neighbour is Full but no routes are installed through it. One side is point-to-point and the other broadcast. Why?",
       "options": [
        "Point-to-point links cannot carry OSPF routes at all",
        "The link is described inconsistently, so SPF cannot use it",
        "The adjacency should already have failed because timers differ",
        "Broadcast networks only support inter-area routes"
       ],
       "answer": 1,
       "explain": "Default timers match for both types, so the adjacency forms, but the LSAs describe the link differently and the two-way check in SPF fails."
      },
      {
       "q": "In debug output, `Dead R 40 C 120` appears. What does it mean?",
       "options": [
        "This router uses 40 s, the neighbour uses 120 s",
        "Both routers agree on a dead time of 40 s",
        "The dead timer will reset after 120 seconds",
        "The neighbour uses 40 s, this router uses 120 s"
       ],
       "answer": 3,
       "explain": "R is the value received from the neighbour and C the value configured locally."
      },
      {
       "q": "Two routers on a broadcast segment remain in 2-Way with each other and Full with the DR. What does this indicate?",
       "options": [
        "Normal behaviour for two non-DR routers",
        "An MTU mismatch between the two routers",
        "An authentication failure on the segment",
        "A duplicate router ID on the segment"
       ],
       "answer": 0,
       "explain": "Non-DR/BDR routers only become fully adjacent with the DR and BDR; 2-Way between them is expected."
      },
      {
       "q": "A neighbour never appears in `show ip ospf neighbor`, and `show ip ospf interface` shows the interface is passive. What is the fix?",
       "options": [
        "Raise the DR priority on the interface",
        "Lower the hello timer on both sides",
        "Change the area type to a stub area on both routers involved",
        "Make the interface non-passive under the OSPF process"
       ],
       "answer": 3,
       "explain": "Passive interfaces send no hellos, so no adjacency can form on them."
      }
     ]
    }
   ]
  }
 ]
});
TRACK.modules.push({
 "id": "m4",
 "order": 4,
 "code": "BGP",
 "title": "BGP for the Enterprise",
 "subtitle": "Sessions, attributes, policy, route reflection and dual-ISP traffic engineering, with a method for finding why a route is wrong.",
 "outcomes": [
  "Build and troubleshoot eBGP and iBGP sessions.",
  "Predict BGP best-path selection from attributes and show output.",
  "Write safe inbound and outbound policy using prefix lists, route maps, AS-path filters and communities.",
  "Scale iBGP with route reflectors.",
  "Design dual-ISP multihoming with deliberate inbound and outbound traffic engineering."
 ],
 "lessons": [
  {
   "id": "m4-l1",
   "title": "BGP Sessions: eBGP, iBGP and Neighbour States",
   "subtitle": "How BGP peers find each other, what changes between external and internal sessions, and how to read session state.",
   "minutes": 35,
   "objectives": [
    "Explain the differences between eBGP and iBGP sessions.",
    "Configure eBGP and loopback-based iBGP sessions with an address-family structure.",
    "Diagnose sessions stuck in Idle or Active from show output."
   ],
   "blocks": [
    {
     "type": "text",
     "text": "BGP-4 (RFC 4271) is a **path-vector** protocol built for policy, not for speed. It runs over TCP port 179, exchanges reachability with explicit attributes, and lets each autonomous system (AS) decide what it accepts and what it advertises. Enterprises use it to connect to internet providers and cloud platforms, to exchange routes with partners, and increasingly inside data-centre fabrics and large WANs."
    },
    {
     "type": "compare",
     "columns": [
      {
       "title": "eBGP (different AS)",
       "items": [
        "Peers usually directly connected; packets sent with TTL 1 by default",
        "Next hop set to the advertising router's own address",
        "Own AS prepended to AS_PATH on advertisement",
        "LOCAL_PREF not sent",
        "Common default administrative distance: 20"
       ]
      },
      {
       "title": "iBGP (same AS)",
       "items": [
        "Peers usually on loopbacks, reachable through the IGP",
        "Next hop from eBGP is passed on unchanged by default",
        "AS_PATH not modified inside the AS",
        "Routes learned from one iBGP peer are not sent to another iBGP peer",
        "Common default administrative distance: 200"
       ]
      }
     ],
     "title": "eBGP versus iBGP"
    },
    {
     "type": "callout",
     "kind": "definition",
     "text": "A BGP speaker does not advertise a route learned from an iBGP peer to another iBGP peer. Because AS_PATH is not changed inside an AS, it cannot detect internal loops, so this rule prevents them. The consequence is that iBGP needs a **full mesh**, or route reflectors or confederations to relax it.",
     "title": "The iBGP split-horizon rule"
    },
    {
     "type": "table",
     "head": [
      "Message",
      "Purpose"
     ],
     "rows": [
      [
       "OPEN",
       "Starts a session: version, AS number, hold time, BGP identifier, capabilities"
      ],
      [
       "UPDATE",
       "Advertises new paths with attributes or withdraws unreachable prefixes"
      ],
      [
       "KEEPALIVE",
       "Confirms the peer is alive between updates"
      ],
      [
       "NOTIFICATION",
       "Reports an error and closes the session"
      ],
      [
       "ROUTE-REFRESH",
       "Asks a peer to resend its routes so new inbound policy can be applied (RFC 2918)"
      ]
     ],
     "title": "Message types"
    },
    {
     "type": "flow",
     "items": [
      {
       "label": "Idle",
       "text": "Waiting to start; also the state after errors"
      },
      {
       "label": "Connect",
       "text": "Trying to complete the TCP connection"
      },
      {
       "label": "Active",
       "text": "TCP attempt failed; retrying"
      },
      {
       "label": "OpenSent",
       "text": "OPEN sent, waiting for the peer's OPEN"
      },
      {
       "label": "OpenConfirm",
       "text": "OPENs accepted, waiting for KEEPALIVE"
      },
      {
       "label": "Established",
       "text": "Exchanging UPDATEs"
      }
     ],
     "title": "Neighbour state machine"
    },
    {
     "type": "cli",
     "device": "E1 · IOS-style CLI",
     "lines": [
      "router bgp 64505",
      " bgp router-id 10.255.0.1",
      " bgp log-neighbor-changes",
      " no bgp default ipv4-unicast",
      " neighbor 203.0.113.1 remote-as 64500",
      " neighbor 203.0.113.1 description ISP-A",
      " neighbor 10.255.0.2 remote-as 64505",
      " neighbor 10.255.0.2 update-source Loopback0",
      " address-family ipv4 unicast",
      "  network 198.51.100.0 mask 255.255.255.0",
      "  neighbor 203.0.113.1 activate",
      "  neighbor 10.255.0.2 activate",
      "  neighbor 10.255.0.2 next-hop-self",
      " exit-address-family",
      "!",
      "ip route 198.51.100.0 255.255.255.0 Null0"
     ],
     "title": "Enterprise edge router: one eBGP and one iBGP peer",
     "note": "The `network` command advertises a prefix only if an exact match exists in the routing table, hence the static route to Null0. AS numbers and addresses here come from documentation ranges."
    },
    {
     "type": "cli",
     "device": "E1 · IOS-style CLI",
     "lines": [
      "E1# show ip bgp summary",
      "BGP router identifier 10.255.0.1, local AS number 64505",
      "Neighbor     V    AS MsgRcvd MsgSent TblVer InQ OutQ Up/Down  State/PfxRcd",
      "10.255.0.2   4 64505     812     809     45   0    0 12:01:44       12",
      "203.0.113.1  4 64500   20411    1830     45   0    0 1d02h           3"
     ],
     "title": "Reading the session summary",
     "note": "A number in the last column means the session is Established and shows prefixes received. A word such as Idle or Active means it is not."
    },
    {
     "type": "table",
     "head": [
      "State seen",
      "Common causes",
      "Check"
     ],
     "rows": [
      [
       "Idle",
       "Neighbour administratively shut down, no route to the peer, maximum-prefix limit exceeded",
       "Config, routing table, logs"
      ],
      [
       "Active",
       "TCP not completing: wrong neighbour address, port 179 filtered, wrong update-source, eBGP peer not directly connected without multihop",
       "Ping from the right source, ACLs, firewall logs"
      ],
      [
       "Flapping OpenSent/Idle",
       "OPEN rejected: wrong AS number, duplicate router ID, unsupported capability",
       "NOTIFICATION messages in logs"
      ],
      [
       "Established, 0 prefixes",
       "Policy filtering in either direction, or peer advertising nothing",
       "Inbound and outbound route maps, received-routes"
      ]
     ],
     "title": "Session troubleshooting by state"
    },
    {
     "type": "cli",
     "device": "E2 · IOS-style CLI",
     "lines": [
      "%BGP-3-NOTIFICATION: sent to neighbor 192.0.2.9 passive 2/2 (peer in wrong AS) 2 bytes FBFF",
      "E2# show ip bgp summary | include 192.0.2.9",
      "192.0.2.9    4 64510       0       0      1   0    0 never    Idle"
     ],
     "title": "A wrong-AS notification",
     "note": "Error 2/2 is an OPEN message error, 'bad peer AS'. FBFF in hexadecimal is 64511: the provider is using AS 64511 while E2 expects 64510. Confirm the correct AS with the provider."
    },
    {
     "type": "callout",
     "kind": "pro",
     "text": "Authenticate eBGP sessions where the provider supports it (TCP-AO, RFC 5925, or the older TCP MD5 option), apply the generalised TTL security mechanism (RFC 5082) on directly connected peers, and set a maximum-prefix limit so a provider leak cannot exhaust your router's memory.",
     "title": "Protect the session"
    },
    {
     "type": "scenario",
     "title": "Stuck in Active",
     "situation": "A new iBGP session between two edge routers' loopbacks stays in Active. Both routers can ping each other's loopback from the CLI. The configuration has `neighbor 10.255.0.2 remote-as 64505` on E1 and the equivalent on E2, with no other neighbour options. What is the most likely fix?",
     "options": [
      {
       "text": "Add `ebgp-multihop 2` on both routers because the loopback peers are not directly connected to each other.",
       "feedback": "Multihop applies to eBGP; iBGP sessions are not limited to TTL 1.",
       "best": false
      },
      {
       "text": "Add `next-hop-self` on both routers.",
       "feedback": "Next-hop-self affects advertised routes, not whether the TCP session can be established.",
       "best": false
      },
      {
       "text": "Change both routers to different AS numbers.",
       "feedback": "That would turn the session into eBGP and break the design; the AS numbers are correct.",
       "best": false
      },
      {
       "text": "Add `update-source Loopback0` so each router sources the session from the address the other expects.",
       "feedback": "Correct. Without it, TCP is sourced from the outgoing interface address, which does not match the peer's configured neighbour address, so the connection is refused.",
       "best": true
      }
     ]
    },
    {
     "type": "keypoints",
     "items": [
      "eBGP changes next hop and AS_PATH; iBGP does neither by default.",
      "Routes from one iBGP peer are not passed to another iBGP peer.",
      "Active means TCP is failing; Idle often means configuration, routing or max-prefix.",
      "Use loopbacks with update-source for iBGP and next-hop-self towards internal peers."
     ],
     "title": "Key points"
    },
    {
     "type": "quiz",
     "items": [
      {
       "q": "A session shows Active in `show ip bgp summary`. What does this indicate?",
       "options": [
        "The session is established and actively exchanging routing updates",
        "The peer has sent a NOTIFICATION and closed it",
        "The router is retrying a TCP connection that has not succeeded",
        "The router is waiting for the peer's KEEPALIVE"
       ],
       "answer": 2,
       "explain": "Despite its name, Active means BGP is trying and failing to complete TCP. An Established session shows a prefix count instead of a state."
      },
      {
       "q": "Why do iBGP routers need a full mesh, route reflectors or confederations?",
       "options": [
        "iBGP sessions only work between directly connected routers",
        "iBGP-learned routes are not re-advertised to other iBGP peers",
        "iBGP sessions cannot carry the LOCAL_PREF attribute",
        "iBGP peers always change the next hop to their own loopback address"
       ],
       "answer": 1,
       "explain": "The iBGP split-horizon rule prevents loops inside an AS but means each router must hear routes directly from the source unless reflection or confederations are used."
      },
      {
       "q": "What does an eBGP router do to the AS_PATH when advertising a route to its external peer?",
       "options": [
        "Removes all private AS numbers",
        "Leaves the AS_PATH unchanged",
        "Prepends its own AS number",
        "Replaces it with its own AS only"
       ],
       "answer": 2,
       "explain": "Each AS adds its own number when advertising to eBGP peers; this is how loops between ASes are detected."
      },
      {
       "q": "A NOTIFICATION shows error 2/2 (bad peer AS). What is the likely cause?",
       "options": [
        "The TCP session on port 179 is being blocked by a firewall rule",
        "The remote-as configured does not match the peer's actual AS",
        "The peer has exceeded the maximum-prefix limit",
        "Both routers are using the same hold time"
       ],
       "answer": 1,
       "explain": "OPEN message error subcode 2 means the AS in the peer's OPEN does not match what was configured."
      },
      {
       "q": "The `network 198.51.100.0 mask 255.255.255.0` command is configured but the prefix is not advertised. Why might that be?",
       "options": [
        "No exact match for the prefix exists in the routing table",
        "The prefix is in a documentation range",
        "The network command only works for iBGP peers",
        "The network command needs a route map attached before it works"
       ],
       "answer": 0,
       "explain": "The network command requires an exact match in the routing table; a static route to Null0 is a common way to provide it."
      }
     ]
    }
   ]
  },
  {
   "id": "m4-l2",
   "title": "Path Attributes and the Best-Path Decision",
   "subtitle": "What each attribute carries and the order in which BGP compares them.",
   "minutes": 35,
   "objectives": [
    "Classify BGP path attributes as well-known or optional, transitive or not.",
    "Walk through the best-path decision process in the correct order.",
    "Predict which path a router selects from show output."
   ],
   "blocks": [
    {
     "type": "text",
     "text": "BGP routes are not compared by a single metric. Each path carries **attributes**, and a router compares candidate paths attribute by attribute, in a fixed order, until one path wins. Policy works by changing attributes, so knowing the order is what lets you predict — and control — traffic."
    },
    {
     "type": "table",
     "head": [
      "Attribute",
      "Category",
      "Set by / scope",
      "Preference"
     ],
     "rows": [
      [
       "ORIGIN",
       "Well-known mandatory",
       "The originating router",
       "IGP < EGP < incomplete (lower is better)"
      ],
      [
       "AS_PATH",
       "Well-known mandatory",
       "Each AS prepends its number towards eBGP peers",
       "Shorter is better"
      ],
      [
       "NEXT_HOP",
       "Well-known mandatory",
       "Usually the eBGP peer's address",
       "Must be reachable"
      ],
      [
       "LOCAL_PREF",
       "Well-known discretionary",
       "Inside one AS only; commonly defaults to 100",
       "Higher is better"
      ],
      [
       "MULTI_EXIT_DISC (MED)",
       "Optional non-transitive",
       "Sent to a neighbouring AS to suggest an entry point",
       "Lower is better"
      ],
      [
       "COMMUNITY",
       "Optional transitive",
       "Tags used for policy (RFC 1997)",
       "No preference by itself"
      ],
      [
       "ORIGINATOR_ID, CLUSTER_LIST",
       "Optional non-transitive",
       "Added by route reflectors",
       "Loop prevention and tie-breaking"
      ]
     ],
     "title": "Common path attributes"
    },
    {
     "type": "table",
     "head": [
      "Step",
      "Prefer the path with…",
      "Notes"
     ],
     "rows": [
      [
       "0",
       "A reachable next hop",
       "Paths with unreachable next hops are not candidates"
      ],
      [
       "1",
       "Highest local weight",
       "Implementation-specific, local to one router, not a BGP attribute; skip if not supported"
      ],
      [
       "2",
       "Highest LOCAL_PREF",
       "The main outbound traffic-engineering knob for the whole AS"
      ],
      [
       "3",
       "Locally originated route",
       "Originated by this router with network, aggregate or redistribution"
      ],
      [
       "4",
       "Shortest AS_PATH",
       "Main inbound knob, influenced by prepending"
      ],
      [
       "5",
       "Lowest ORIGIN",
       "IGP before EGP before incomplete"
      ],
      [
       "6",
       "Lowest MED",
       "By default compared only between paths from the same neighbouring AS"
      ],
      [
       "7",
       "eBGP over iBGP",
       "Prefer routes learned directly from outside"
      ],
      [
       "8",
       "Lowest IGP metric to the next hop",
       "Hot-potato routing: leave the AS at the nearest exit"
      ],
      [
       "9",
       "Final tie-breakers",
       "Oldest eBGP path (some implementations), lowest router ID, shortest cluster list, lowest neighbour address"
      ]
     ],
     "title": "Best-path decision process (common order)"
    },
    {
     "type": "callout",
     "kind": "insight",
     "text": "LOCAL_PREF influences how **your** AS sends traffic out; it never leaves your AS. AS_PATH and MED influence how **other** ASes send traffic to you. That asymmetry is the basis of all BGP traffic engineering.",
     "title": "Who sees which attribute"
    },
    {
     "type": "cli",
     "device": "E1 · IOS-style CLI",
     "lines": [
      "E1# show ip bgp 0.0.0.0",
      "BGP routing table entry for 0.0.0.0/0, version 18",
      "Paths: (2 available, best #2, table default)",
      "  64510",
      "    10.255.0.2 (metric 2) from 10.255.0.2 (10.255.0.2)",
      "      Origin IGP, metric 0, localpref 80, valid, internal",
      "  64500",
      "    203.0.113.1 from 203.0.113.1 (203.0.113.250)",
      "      Origin IGP, metric 0, localpref 200, valid, external, best"
     ],
     "title": "Which path wins?",
     "note": "Both paths have reachable next hops and equal AS_PATH length, but the decision stops at LOCAL_PREF: 200 beats 80, so ISP-A's default route is used for outbound traffic."
    },
    {
     "type": "formula",
     "items": [
      {
       "name": "AS_PATH length",
       "expr": "length = number of AS numbers in the path (an AS_SET counts as one)",
       "meaning": "`64500 64500 64500 64496` has length 4; prepending twice adds two."
      },
      {
       "name": "MED comparability",
       "expr": "compare MED only if first AS in AS_PATH is equal",
       "meaning": "Paths from AS 64500 and AS 64510 skip the MED step unless configured otherwise."
      }
     ],
     "title": "Reading the comparison"
    },
    {
     "type": "steps",
     "items": [
      {
       "title": "List all valid paths",
       "text": "Drop any with unreachable next hops or that failed policy."
      },
      {
       "title": "Walk the order",
       "text": "Compare each attribute in sequence; stop at the first difference."
      },
      {
       "title": "Name the deciding step",
       "text": "Write down which attribute decided; that is the one to change if the result is wrong."
      },
      {
       "title": "Check the RIB",
       "text": "Confirm the best path was installed and not displaced by a route with lower administrative distance."
      }
     ],
     "title": "Predicting the winner"
    },
    {
     "type": "scenario",
     "title": "Unexpected exit",
     "situation": "An enterprise receives the same partner prefix from ISP-A (AS path `64500 64496`) and ISP-B (AS path `64510 64496`). Both have local preference 100 and origin IGP. ISP-B's path has MED 10 and ISP-A's has MED 50. The router chooses ISP-A. Why?",
     "options": [
      {
       "text": "MED is not compared between different neighbouring ASes, so a later step such as eBGP over iBGP or IGP cost decided.",
       "feedback": "Correct. By default MED is compared only when paths come from the same neighbouring AS; here the first ASes differ.",
       "best": true
      },
      {
       "text": "Lower MED always wins once LOCAL_PREF and AS_PATH tie.",
       "feedback": "This ignores the default rule that MED is only compared between paths from the same neighbouring AS.",
       "best": false
      },
      {
       "text": "The router prefers higher MED values.",
       "feedback": "Lower MED is preferred when MED is compared.",
       "best": false
      },
      {
       "text": "AS 64500 is numerically lower than AS 64510, so it wins.",
       "feedback": "AS numbers are never compared numerically in the decision process.",
       "best": false
      }
     ]
    },
    {
     "type": "keypoints",
     "items": [
      "Next hop must be reachable before any attribute is compared.",
      "LOCAL_PREF before AS_PATH before ORIGIN before MED before eBGP/iBGP before IGP cost.",
      "MED is compared only between paths from the same neighbouring AS by default.",
      "Weight is a local, implementation-specific value, not a path attribute."
     ],
     "title": "Key points"
    },
    {
     "type": "quiz",
     "items": [
      {
       "q": "Which attribute is the primary tool for controlling how traffic leaves your AS?",
       "options": [
        "MULTI_EXIT_DISC",
        "AS_PATH",
        "ORIGIN",
        "LOCAL_PREF"
       ],
       "answer": 3,
       "explain": "LOCAL_PREF is shared by all routers inside the AS and evaluated early, so it steers outbound traffic. MED and AS_PATH influence other ASes."
      },
      {
       "q": "Two paths tie on LOCAL_PREF and AS_PATH length. One has origin IGP, the other incomplete. Which wins?",
       "options": [
        "The path with origin incomplete",
        "The path with origin IGP",
        "Neither; MED is compared first",
        "Both, installed as equal-cost paths"
       ],
       "answer": 1,
       "explain": "ORIGIN is compared after AS_PATH: IGP is preferred over EGP, which is preferred over incomplete."
      },
      {
       "q": "What is the AS_PATH length of `64510 64510 64510 64496`?",
       "options": [
        "4",
        "2",
        "1",
        "3"
       ],
       "answer": 0,
       "explain": "Every AS number counts, including prepended duplicates; only an AS_SET counts as one."
      },
      {
       "q": "Why might a router ignore a lower MED from a different provider?",
       "options": [
        "MED is only used for routes learned from iBGP peers",
        "MED is only evaluated after the lowest router ID tie-breaker step",
        "MED values are only used for IPv6 routes",
        "MED is compared only between paths from the same neighbouring AS"
       ],
       "answer": 3,
       "explain": "By default MED compares entry points into one neighbouring AS; comparing across ASes requires explicit configuration."
      },
      {
       "q": "After LOCAL_PREF, AS_PATH, ORIGIN and MED all tie, which path is preferred?",
       "options": [
        "The path with the higher router ID",
        "The path learned most recently",
        "The eBGP-learned path over the iBGP-learned path",
        "The path carrying the longer CLUSTER_LIST attribute"
       ],
       "answer": 2,
       "explain": "eBGP over iBGP comes next, followed by the lowest IGP metric to the next hop and the final tie-breakers."
      }
     ]
    }
   ]
  },
  {
   "id": "m4-l3",
   "title": "BGP Policy: Prefix Lists, Route Maps and Communities",
   "subtitle": "Filter what you accept and advertise, and mark routes so policy scales.",
   "minutes": 35,
   "objectives": [
    "Build inbound and outbound policy for an internet edge.",
    "Use AS-path filters to prevent becoming a transit network.",
    "Apply standard, well-known and large communities to signal policy."
   ],
   "blocks": [
    {
     "type": "text",
     "text": "Every BGP session needs explicit policy in **both directions**. Inbound policy protects you from bad routes: bogons, your own prefixes coming back, overly specific announcements and route leaks. Outbound policy protects everyone else from you: an enterprise should advertise **only its own prefixes**, never routes learned from one provider to another. Without it, a multihomed enterprise can accidentally become a transit path between two ISPs."
    },
    {
     "type": "table",
     "head": [
      "Direction",
      "Policy",
      "Why"
     ],
     "rows": [
      [
       "Outbound",
       "Permit only your own prefixes (prefix list) and only locally originated paths (AS-path `^$`)",
       "Prevents leaking one provider's routes to another"
      ],
      [
       "Inbound",
       "Deny your own prefixes",
       "Prevents paths to yourself through the internet"
      ],
      [
       "Inbound",
       "Deny private, reserved and documentation ranges (bogons)",
       "These should never appear on the internet"
      ],
      [
       "Inbound",
       "Deny IPv4 prefixes longer than /24 (IPv6 longer than /48)",
       "Common global filtering practice"
      ],
      [
       "Inbound",
       "Maximum-prefix limit",
       "Protects memory if the peer leaks a large table"
      ],
      [
       "Inbound",
       "Route origin validation with RPKI (RFC 6811)",
       "Rejects prefixes whose origin AS is not authorised"
      ]
     ],
     "title": "Edge policy baseline"
    },
    {
     "type": "cli",
     "device": "E1 · IOS-style CLI",
     "lines": [
      "ip prefix-list OUR-NETS seq 10 permit 198.51.100.0/24",
      "ip as-path access-list 1 permit ^$",
      "!",
      "ip prefix-list FROM-ISP seq 5 deny 198.51.100.0/24 le 32",
      "ip prefix-list FROM-ISP seq 10 deny 10.0.0.0/8 le 32",
      "ip prefix-list FROM-ISP seq 15 deny 172.16.0.0/12 le 32",
      "ip prefix-list FROM-ISP seq 20 deny 192.168.0.0/16 le 32",
      "ip prefix-list FROM-ISP seq 100 permit 0.0.0.0/0 le 24",
      "!",
      "route-map TO-ISP-A permit 10",
      " match ip address prefix-list OUR-NETS",
      " match as-path 1",
      "!",
      "router bgp 64505",
      " address-family ipv4 unicast",
      "  neighbor 203.0.113.1 prefix-list FROM-ISP in",
      "  neighbor 203.0.113.1 route-map TO-ISP-A out",
      "  neighbor 203.0.113.1 maximum-prefix 20000 90"
     ],
     "title": "Outbound and inbound edge policy",
     "note": "The inbound list is shortened for clarity; a production bogon list also covers 0.0.0.0/8, 127.0.0.0/8, 169.254.0.0/16, 100.64.0.0/10, documentation ranges, 224.0.0.0/4 and 240.0.0.0/4."
    },
    {
     "type": "callout",
     "kind": "warning",
     "text": "`^$` matches an empty AS_PATH, which means routes originated inside your own AS. `_64500$` matches paths originated by AS 64500. Test every expression with show commands before applying it, because a wrong expression can withdraw all your prefixes or leak everything.",
     "title": "Regular expressions are exact"
    },
    {
     "type": "table",
     "head": [
      "Type",
      "Format",
      "Use"
     ],
     "rows": [
      [
       "Standard (RFC 1997)",
       "32-bit, written AS:value, e.g. 64500:120",
       "Tag routes for policy inside your AS or with a provider"
      ],
      [
       "NO_EXPORT",
       "Well-known",
       "Do not advertise outside this AS (or confederation)"
      ],
      [
       "NO_ADVERTISE",
       "Well-known",
       "Do not advertise to any peer"
      ],
      [
       "Extended (RFC 4360)",
       "64-bit, typed",
       "Route targets and other VPN uses"
      ],
      [
       "Large (RFC 8092)",
       "96-bit, written ASN:value1:value2",
       "Communities for 32-bit AS numbers"
      ]
     ],
     "title": "Communities"
    },
    {
     "type": "text",
     "text": "Providers usually publish a **community menu**: values that customers can attach to their advertisements to request actions inside the provider's network, such as lowering local preference, prepending towards certain peers, or not announcing in a region. The values are provider-specific, so always read the provider's documentation and confirm with their support before relying on them."
    },
    {
     "type": "cli",
     "device": "E2 · IOS-style CLI",
     "lines": [
      "route-map TO-ISP-B permit 10",
      " match ip address prefix-list OUR-NETS",
      " match as-path 1",
      " set community 64510:70",
      "!",
      "router bgp 64505",
      " address-family ipv4 unicast",
      "  neighbor 192.0.2.9 route-map TO-ISP-B out",
      "  neighbor 192.0.2.9 send-community",
      "!",
      "E2# clear ip bgp 192.0.2.9 soft out"
     ],
     "title": "Requesting backup treatment from a provider",
     "note": "In this example ISP-B documents 64510:70 as 'set local preference 70 in our network'. Many implementations do not send communities unless told to. A soft outbound clear re-sends updates without dropping the session."
    },
    {
     "type": "compare",
     "columns": [
      {
       "title": "Hard reset",
       "items": [
        "Tears down the TCP session",
        "All routes withdrawn and relearned",
        "Traffic disruption",
        "Rarely needed"
       ]
      },
      {
       "title": "Soft reset / route refresh",
       "items": [
        "Session stays up",
        "Policy re-applied to stored or re-requested routes",
        "No disruption",
        "Standard after a policy change"
       ]
      }
     ],
     "title": "Hard reset versus soft reset"
    },
    {
     "type": "scenario",
     "title": "The accidental transit",
     "situation": "A firm multihomed to two ISPs notices its internet links are saturated with traffic that is neither to nor from its own prefixes. Its outbound route maps to both ISPs contain only `permit 10` with no match statements. What happened and what is the fix?",
     "options": [
      {
       "text": "The ISPs are sending too many prefixes; add a maximum-prefix limit inbound.",
       "feedback": "Max-prefix protects router memory but does not stop the firm advertising transit routes.",
       "best": false
      },
      {
       "text": "LOCAL_PREF is too high on one ISP; lower it to balance traffic.",
       "feedback": "LOCAL_PREF affects the firm's own outbound choice, not the transit traffic caused by leaked advertisements.",
       "best": false
      },
      {
       "text": "It is advertising routes learned from each ISP to the other; restrict outbound policy to its own prefixes and an empty AS-path.",
       "feedback": "Correct. A permit-all outbound policy turns the enterprise into a transit path between the two providers.",
       "best": true
      },
      {
       "text": "The firm should stop sending communities to the ISPs.",
       "feedback": "Communities do not cause transit; the leaked routes do.",
       "best": false
      }
     ]
    },
    {
     "type": "keypoints",
     "items": [
      "Every session needs inbound and outbound policy.",
      "Advertise only your own prefixes; use `^$` to allow only locally originated paths.",
      "Filter bogons, your own prefixes and over-specific routes inbound; set maximum-prefix.",
      "Communities signal policy; provider community values are provider-specific."
     ],
     "title": "Key points"
    },
    {
     "type": "quiz",
     "items": [
      {
       "q": "What does the AS-path regular expression `^$` match?",
       "options": [
        "Every route from every neighbour",
        "Routes originated inside the local AS",
        "Routes with exactly one AS in the path",
        "Routes received from iBGP peers only"
       ],
       "answer": 1,
       "explain": "An empty AS_PATH means the route has not crossed any AS boundary: it was originated locally."
      },
      {
       "q": "Which well-known community stops a route being advertised outside the receiving AS?",
       "options": [
        "NO_ADVERTISE",
        "NO_PEER",
        "LOCAL_PREF",
        "NO_EXPORT"
       ],
       "answer": 3,
       "explain": "NO_EXPORT keeps the route inside the AS (or confederation). NO_ADVERTISE prevents advertising to any peer at all."
      },
      {
       "q": "Communities are configured in an outbound route map but the provider does not see them. What is the most likely missing step?",
       "options": [
        "Adding a matching inbound community list on the edge",
        "Converting them to large communities",
        "Enabling community sending towards that neighbour",
        "Clearing the session with a hard reset"
       ],
       "answer": 2,
       "explain": "Many implementations do not send communities by default; they must be enabled per neighbour."
      },
      {
       "q": "What is the advantage of a soft outbound reset after changing outbound policy?",
       "options": [
        "Updates are re-sent without tearing down the session",
        "All received routes are flushed and relearned",
        "The peer is forced to renegotiate capabilities",
        "The maximum-prefix counter for the peer is set back to zero"
       ],
       "answer": 0,
       "explain": "Soft reset re-applies policy and re-advertises without disrupting the TCP session or traffic."
      },
      {
       "q": "Why should an enterprise filter IPv4 prefixes longer than /24 from its providers?",
       "options": [
        "BGP cannot carry prefixes longer than /24",
        "Longer prefixes are generally filtered across the internet",
        "Longer prefixes always carry an invalid ORIGIN",
        "Longer prefixes break the route reflection rules inside the AS"
       ],
       "answer": 1,
       "explain": "Common global practice is to accept nothing more specific than /24 for IPv4 (or /48 for IPv6); longer prefixes are likely leaks or errors."
      }
     ]
    }
   ]
  },
  {
   "id": "m4-l4",
   "title": "Scaling iBGP: Full Mesh and Route Reflectors",
   "subtitle": "Why full mesh stops scaling, how route reflection works and how to design it safely.",
   "minutes": 30,
   "objectives": [
    "Calculate iBGP session counts for full mesh and route-reflector designs.",
    "Explain route-reflector advertisement rules and loop prevention.",
    "Configure a redundant route-reflector pair."
   ],
   "blocks": [
    {
     "type": "text",
     "text": "Because of the iBGP split-horizon rule, every iBGP speaker must normally peer with every other. That is fine for two edge routers, tolerable for five, and unmanageable for fifty. **Route reflectors** (RFC 4456) relax the rule in a controlled way, so that clients peer only with a few reflectors, which pass routes on."
    },
    {
     "type": "formula",
     "items": [
      {
       "name": "Full mesh",
       "expr": "sessions = n × (n − 1) ÷ 2",
       "meaning": "20 routers need 190 sessions; 50 routers need 1,225."
      },
      {
       "name": "Two route reflectors",
       "expr": "sessions = 2 × (n − 2) + 1",
       "meaning": "20 routers with 2 reflectors: 18 clients × 2 + 1 = 37 sessions."
      }
     ],
     "title": "Session counts"
    },
    {
     "type": "table",
     "head": [
      "Route learned from",
      "Reflected to"
     ],
     "rows": [
      [
       "An eBGP peer",
       "All clients and non-clients (normal behaviour)"
      ],
      [
       "A non-client iBGP peer",
       "Clients only (and eBGP peers)"
      ],
      [
       "A client",
       "All other clients and all non-clients (and eBGP peers)"
      ]
     ],
     "title": "Route-reflector advertisement rules"
    },
    {
     "type": "keypoints",
     "items": [
      "The reflector adds ORIGINATOR_ID (the router ID of the route's originator in the AS) and ignores routes carrying its own ID.",
      "It prepends its cluster ID to CLUSTER_LIST and discards routes that already contain it.",
      "A reflector does not change NEXT_HOP by default, so next hops must still be reachable from clients.",
      "Only the reflector needs special configuration; clients are ordinary iBGP speakers.",
      "Clients only see the reflector's best path, which can hide alternative exits."
     ],
     "title": "Loop prevention and behaviour"
    },
    {
     "type": "cli",
     "device": "RR1 · IOS-style CLI",
     "lines": [
      "router bgp 64505",
      " bgp router-id 10.255.0.101",
      " neighbor 10.255.0.1 remote-as 64505",
      " neighbor 10.255.0.1 update-source Loopback0",
      " neighbor 10.255.0.2 remote-as 64505",
      " neighbor 10.255.0.2 update-source Loopback0",
      " neighbor 10.255.0.102 remote-as 64505",
      " neighbor 10.255.0.102 update-source Loopback0",
      " address-family ipv4 unicast",
      "  neighbor 10.255.0.1 activate",
      "  neighbor 10.255.0.1 route-reflector-client",
      "  neighbor 10.255.0.2 activate",
      "  neighbor 10.255.0.2 route-reflector-client",
      "  neighbor 10.255.0.102 activate",
      " exit-address-family"
     ],
     "title": "Route reflector with two clients",
     "note": "10.255.0.102 is the second reflector (RR2), peered as a non-client. Clients E1 and E2 peer with both reflectors and need no special configuration."
    },
    {
     "type": "layers",
     "items": [
      {
       "label": "Reflectors",
       "parts": [
        "RR1 and RR2, often out of the forwarding path",
        "Peer with each other as non-clients"
       ]
      },
      {
       "label": "Clients",
       "parts": [
        "Edge routers, WAN hubs, data-centre borders",
        "Each peers with both reflectors"
       ]
      },
      {
       "label": "IGP",
       "parts": [
        "Carries all loopbacks and next hops",
        "Must converge before BGP can use paths"
       ]
      }
     ],
     "title": "Redundant reflector design"
    },
    {
     "type": "callout",
     "kind": "pro",
     "text": "A reflector chooses its best path from its own position in the IGP. If it sits far from the clients, it may pick an exit that is not the closest for them. Place reflectors centrally, or use mechanisms that advertise more than one path (add-path, RFC 7911) where supported.",
     "title": "Placement matters"
    },
    {
     "type": "compare",
     "columns": [
      {
       "title": "Route reflectors",
       "items": [
        "Change only the reflector configuration",
        "Most common in enterprises and providers",
        "Single AS number throughout"
       ]
      },
      {
       "title": "Confederations (RFC 5065)",
       "items": [
        "Split the AS into sub-ASes with eBGP-like sessions between them",
        "Useful during mergers",
        "Every router must be reconfigured"
       ]
      }
     ],
     "title": "Route reflectors versus confederations"
    },
    {
     "type": "scenario",
     "title": "Missing alternative path",
     "situation": "An enterprise uses one route reflector in its head office. Both edge routers receive a default route from their ISP, with equal attributes. Branch routers, all clients, always use the head-office ISP even when the regional edge router is closer to them. What best explains this?",
     "options": [
      {
       "text": "Route reflectors always prefer eBGP paths learned over the oldest session, whichever edge router is nearest.",
       "feedback": "Tie-breakers may be involved, but the key issue is that clients receive only the reflector's single best path.",
       "best": false
      },
      {
       "text": "Branch clients must be fully meshed with the edge routers to receive any routes.",
       "feedback": "Clients receive routes from the reflector; full mesh is not required.",
       "best": false
      },
      {
       "text": "The regional edge router's next hop is unreachable.",
       "feedback": "If it were unreachable, the regional path would be invalid everywhere, not just less preferred.",
       "best": false
      },
      {
       "text": "The reflector reflects only its own best path, chosen from its position, which favours the head-office exit.",
       "feedback": "Correct. Clients only see one path — the reflector's choice — so they lose the closer exit. Placement or add-path addresses this.",
       "best": true
      }
     ]
    },
    {
     "type": "quiz",
     "items": [
      {
       "q": "How many iBGP sessions does a full mesh of 12 routers need?",
       "options": [
        "66",
        "24",
        "132",
        "144"
       ],
       "answer": 0,
       "explain": "12 × 11 ÷ 2 = 66."
      },
      {
       "q": "A route reflector learns a route from a non-client iBGP peer. Where does it reflect it?",
       "options": [
        "To all non-client peers",
        "To no other iBGP peer",
        "To its clients only",
        "Back to the originating peer"
       ],
       "answer": 2,
       "explain": "Routes from non-clients go to clients; routes from clients go to clients and non-clients."
      },
      {
       "q": "Which attribute lets a reflector detect a route that has looped back through its cluster?",
       "options": [
        "LOCAL_PREF",
        "MULTI_EXIT_DISC",
        "ORIGIN",
        "CLUSTER_LIST"
       ],
       "answer": 3,
       "explain": "The reflector prepends its cluster ID; seeing it again means a loop. ORIGINATOR_ID is used for the same purpose at the originator level."
      },
      {
       "q": "What configuration do route-reflector clients need?",
       "options": [
        "The route-reflector-client command towards each other",
        "A cluster ID matching the reflector's own ID",
        "None beyond normal iBGP peering with the reflectors",
        "A confederation identifier for each client"
       ],
       "answer": 2,
       "explain": "Reflection is configured only on the reflector; clients are standard iBGP speakers."
      },
      {
       "q": "Why must the IGP still carry eBGP next hops in a reflector design?",
       "options": [
        "Reflectors only accept routes with IGP origin",
        "Clients rely on the IGP to elect the active reflector",
        "Reflectors drop routes without a MED value",
        "Reflectors do not change the next hop by default"
       ],
       "answer": 3,
       "explain": "Reflected routes keep their original next hop (often the edge router's loopback with next-hop-self), so clients need an IGP route to it."
      }
     ]
    }
   ]
  },
  {
   "id": "m4-l5",
   "title": "Multihoming to Two ISPs and BGP Troubleshooting",
   "subtitle": "Control outbound and inbound traffic across two providers, and find out why a route is missing or not preferred.",
   "minutes": 40,
   "objectives": [
    "Design dual-ISP multihoming with clear primary/backup or load-sharing intent.",
    "Use local preference, AS-path prepending, MED, more-specific prefixes and communities appropriately.",
    "Troubleshoot missing, unpreferred or uninstalled BGP routes."
   ],
   "blocks": [
    {
     "type": "text",
     "text": "Multihoming to two providers protects an enterprise from a single provider outage and gives control over cost and performance. The design has two independent halves: **outbound** traffic engineering (which exit your users take) is fully under your control, while **inbound** traffic engineering (which link the world uses to reach you) can only be *influenced*, because other networks make the final decision."
    },
    {
     "type": "compare",
     "columns": [
      {
       "title": "Outbound (you decide)",
       "items": [
        "Raise LOCAL_PREF on routes from the preferred ISP",
        "Accept full, partial or default-only tables",
        "Per-prefix tuning for important destinations",
        "Effective immediately and predictably"
       ]
      },
      {
       "title": "Inbound (you influence)",
       "items": [
        "AS-path prepending towards the less-preferred ISP",
        "Provider communities that lower local preference inside that ISP",
        "Advertising more-specific prefixes on the preferred link",
        "MED only between links to the same ISP",
        "Results depend on other networks' policies"
       ]
      }
     ],
     "title": "Outbound versus inbound traffic engineering"
    },
    {
     "type": "table",
     "head": [
      "Technique",
      "Strength",
      "Limitation"
     ],
     "rows": [
      [
       "AS-path prepending",
       "Simple, works with any provider",
       "Ignored by networks that prefer by local preference first; diminishing returns beyond 3 prepends"
      ],
      [
       "Provider communities",
       "Acts inside the provider, where most decisions happen",
       "Provider-specific; must be supported and documented"
      ],
      [
       "More-specific prefixes",
       "Longest match always wins",
       "Adds to global table size; IPv4 nothing longer than /24 propagates widely"
      ],
      [
       "MED",
       "Precise between two links to one provider",
       "Not meaningful between different providers"
      ]
     ],
     "title": "Inbound techniques compared"
    },
    {
     "type": "layers",
     "items": [
      {
       "label": "Providers",
       "parts": [
        "ISP-A (AS 64500): primary",
        "ISP-B (AS 64510): backup"
       ]
      },
      {
       "label": "Edge",
       "parts": [
        "E1 peers with ISP-A, E2 with ISP-B",
        "iBGP between E1 and E2 over loopbacks, next-hop-self"
       ]
      },
      {
       "label": "Inside",
       "parts": [
        "Firewalls and core learn a default from both edges",
        "Prefix 198.51.100.0/24 advertised from both edges"
       ]
      }
     ],
     "title": "Dual-ISP reference design"
    },
    {
     "type": "cli",
     "device": "E2 · IOS-style CLI",
     "lines": [
      "route-map ISP-B-IN permit 10",
      " set local-preference 80",
      "!",
      "route-map ISP-B-OUT permit 10",
      " match ip address prefix-list OUR-NETS",
      " match as-path 1",
      " set as-path prepend 64505 64505 64505",
      "!",
      "router bgp 64505",
      " neighbor 192.0.2.9 remote-as 64510",
      " address-family ipv4 unicast",
      "  neighbor 192.0.2.9 activate",
      "  neighbor 192.0.2.9 prefix-list FROM-ISP in",
      "  neighbor 192.0.2.9 route-map ISP-B-IN in",
      "  neighbor 192.0.2.9 route-map ISP-B-OUT out",
      "  neighbor 192.0.2.9 maximum-prefix 20000 90"
     ],
     "title": "Backup edge router towards ISP-B",
     "note": "Inbound local preference 80 (below E1's 200) keeps outbound traffic on ISP-A. Prepending makes the path through ISP-B longer for the rest of the internet, so inbound traffic prefers ISP-A while both links are up."
    },
    {
     "type": "text",
     "text": "When a route is wrong, follow the route rather than guessing. First confirm the session is Established. Then ask four questions in order: **Was it received? Was it accepted? Is it best? Is it installed?** Each has a specific command and a specific set of causes, and the answer to one tells you where to look next."
    },
    {
     "type": "table",
     "head": [
      "Question",
      "How to check",
      "If the answer is no"
     ],
     "rows": [
      [
       "Was it received?",
       "Received-routes view (needs inbound soft reconfiguration) or the peer's advertised-routes",
       "Peer's outbound policy, peer not originating it, session issue"
      ],
      [
       "Was it accepted?",
       "`show ip bgp <prefix>` — present after inbound policy?",
       "Inbound prefix list, route map, maximum-prefix, RPKI invalid"
      ],
      [
       "Is it best?",
       "`show ip bgp <prefix>` — marked best (>)",
       "Compare attributes in decision order; unreachable next hop"
      ],
      [
       "Is it installed?",
       "`show ip route <prefix>`",
       "A route with better administrative distance exists (RIB failure)"
      ],
      [
       "Is it advertised onwards?",
       "`show ip bgp neighbors <peer> advertised-routes`",
       "Outbound policy, iBGP split horizon, not best"
      ]
     ],
     "title": "Route troubleshooting ladder"
    },
    {
     "type": "cli",
     "device": "CORE1 · IOS-style CLI",
     "lines": [
      "CORE1# show ip bgp 0.0.0.0",
      "BGP routing table entry for 0.0.0.0/0, version 3",
      "Paths: (1 available, no best path)",
      "  64500",
      "    203.0.113.1 (inaccessible) from 10.255.0.1 (10.255.0.1)",
      "      Origin IGP, metric 0, localpref 200, valid, internal"
     ],
     "title": "A classic iBGP next-hop problem",
     "note": "The next hop is the ISP's address, which CORE1 cannot reach because the edge link is not in the IGP. Configure next-hop-self on E1 towards its iBGP peers (or advertise the link into the IGP)."
    },
    {
     "type": "scenario",
     "title": "A policy that did not take effect",
     "situation": "An engineer adds an inbound route map on E1 setting LOCAL_PREF 200 on routes from ISP-A, to make ISP-A primary. An hour later CORE1 still shows E1's paths with localpref 100 and traffic still leaves via E2. The session to ISP-A was not touched. What should be done?",
     "options": [
      {
       "text": "Re-apply inbound policy with a soft reset or route refresh towards ISP-A.",
       "feedback": "Correct. Inbound policy is applied as routes arrive; existing routes keep old attributes until they are re-received.",
       "best": true
      },
      {
       "text": "Raise LOCAL_PREF further to 500 so the internal routers notice that the value has changed.",
       "feedback": "The value is not the problem; the new policy has not been applied to routes already received.",
       "best": false
      },
      {
       "text": "Set LOCAL_PREF on CORE1 as well, because LOCAL_PREF is never carried over iBGP sessions.",
       "feedback": "LOCAL_PREF is carried to all iBGP peers; that is what makes it an AS-wide outbound control.",
       "best": false
      },
      {
       "text": "Prepend the AS path towards ISP-B so that internal routers start preferring the E1 exit path.",
       "feedback": "Prepending influences how other ASes reach you; it does not change outbound choice inside your AS.",
       "best": false
      }
     ]
    },
    {
     "type": "case",
     "title": "Garment exporter: dual-homing the head office",
     "context": "A garment exporter's head office hosts its order portal, supplier EDI and buyer video calls. It has a /24 of provider-independent space and its own public AS, and connects to ISP-A (fibre, 1 Gbit/s) and ISP-B (microwave backup, 300 Mbit/s). Today ISP-B carries almost no traffic and the portal is unreachable whenever ISP-A has an outage — even though the BGP session to ISP-B stays up. Investigation shows the exporter advertises its /24 only to ISP-A; towards ISP-B it advertises nothing, because the outbound prefix list on E2 still permits only the test prefix used when the link was commissioned. Management also wants ISP-B used for outbound bulk uploads to one cloud storage provider.",
     "questions": [
      "Why is the portal unreachable during ISP-A outages?",
      "How would you design inbound traffic so ISP-A is primary and ISP-B is backup?",
      "How would you send cloud storage uploads via ISP-B while keeping everything else on ISP-A?",
      "What safeguards would you add to prevent a repeat?"
     ],
     "answer": "Because E2's outbound prefix list permits only the old test prefix, the /24 is never advertised to ISP-B, so when ISP-A fails the rest of the internet has no path to the exporter at all. Correct the prefix list, then **advertise the /24 to both ISPs**, with **AS-path prepending** (or ISP-B's backup community) towards ISP-B so inbound traffic prefers ISP-A while both are up. For outbound, set **higher LOCAL_PREF on ISP-A routes** (for example 200 against 80), then add a per-prefix exception: match the cloud provider's prefixes received from ISP-B and give them LOCAL_PREF 250, so only those uploads leave via ISP-B. Safeguards: a **BGP policy sheet** reviewed before change, `show ip bgp neighbors <peer> advertised-routes` checks after every change, monitoring that alerts if either ISP stops receiving the /24 (external looking-glass or route-monitoring service), maximum-prefix limits, inbound bogon and RPKI filtering, and soft resets for policy changes."
    },
    {
     "type": "template",
     "title": "BGP policy sheet",
     "purpose": "Define, per peer and direction, what is accepted or advertised and which attributes are set.",
     "columns": [
      "Peer (AS)",
      "Direction",
      "Match",
      "Action / attributes set",
      "Intent",
      "Verification command"
     ],
     "example": [
      [
       "ISP-A (64500)",
       "In",
       "FROM-ISP prefix list",
       "LOCAL_PREF 200",
       "Primary exit for all traffic",
       "show ip bgp 0.0.0.0"
      ],
      [
       "ISP-B (64510)",
       "Out",
       "OUR-NETS and AS-path ^$",
       "Prepend 64505 ×3",
       "Backup inbound path",
       "show ip bgp neighbors 192.0.2.9 advertised-routes"
      ]
     ],
     "rows": 8
    },
    {
     "type": "checklist",
     "title": "BGP edge readiness checklist",
     "items": [
      "Sessions authenticated and protected with TTL security where possible.",
      "Outbound policy permits only own prefixes and empty AS-path.",
      "Inbound policy filters bogons, own prefixes and over-specific routes.",
      "Maximum-prefix limits set on every external session.",
      "RPKI route origin validation enabled and ROAs published for own prefixes.",
      "iBGP between edges uses loopbacks, update-source and next-hop-self.",
      "Primary/backup intent documented and verified in both directions.",
      "Own prefixes monitored from outside the network.",
      "Policy changes applied with soft resets."
     ]
    },
    {
     "type": "reflection",
     "prompt": "Draw your organisation's internet edge. Which link does inbound traffic actually use today, how do you know, and what would you change to make the behaviour match the business intent?"
    },
    {
     "type": "terms",
     "items": [
      {
       "term": "Autonomous system",
       "def": "A network under one routing policy, identified by an AS number."
      },
      {
       "term": "eBGP",
       "def": "BGP between routers in different autonomous systems."
      },
      {
       "term": "iBGP",
       "def": "BGP between routers in the same autonomous system."
      },
      {
       "term": "Next-hop-self",
       "def": "Configuring a router to set itself as next hop for routes it sends to iBGP peers."
      },
      {
       "term": "LOCAL_PREF",
       "def": "A well-known attribute shared inside an AS; higher values are preferred for outbound traffic."
      },
      {
       "term": "AS_PATH",
       "def": "The list of AS numbers a route has crossed, used for loop prevention and path selection."
      },
      {
       "term": "MED",
       "def": "Multi-exit discriminator; suggests the preferred entry point into an AS, lower is better."
      },
      {
       "term": "AS-path prepending",
       "def": "Adding extra copies of your AS number to make a path look longer to others."
      },
      {
       "term": "Community",
       "def": "A tag attached to routes to signal policy, standard (RFC 1997) or large (RFC 8092)."
      },
      {
       "term": "Route reflector",
       "def": "An iBGP speaker allowed to pass routes between iBGP peers, defined in RFC 4456."
      },
      {
       "term": "CLUSTER_LIST",
       "def": "The list of reflector cluster IDs a route has passed, used to prevent loops."
      },
      {
       "term": "Maximum-prefix",
       "def": "A limit on the number of prefixes accepted from a peer."
      },
      {
       "term": "RPKI",
       "def": "Resource public key infrastructure used to validate that an AS may originate a prefix."
      },
      {
       "term": "Soft reset",
       "def": "Re-applying BGP policy without tearing down the session."
      }
     ]
    },
    {
     "type": "quiz",
     "items": [
      {
       "q": "Which technique gives an enterprise the most direct control over which ISP its users' outbound traffic uses?",
       "options": [
        "Prepending the AS path towards the backup ISP",
        "Setting LOCAL_PREF on routes received from each ISP",
        "Sending a lower MED value to the primary ISP",
        "Advertising more-specific prefixes to only one of the ISPs"
       ],
       "answer": 1,
       "explain": "Outbound path selection happens inside your AS, so LOCAL_PREF decides it. The other techniques influence how the world reaches you."
      },
      {
       "q": "An enterprise has links to two different ISPs. Why is MED a poor tool for inbound traffic engineering here?",
       "options": [
        "MED is normally only compared between links to the same AS",
        "MED is removed by every eBGP router on receipt",
        "MED applies only to IPv6 prefixes by default",
        "MED can only be set on iBGP sessions inside your own network"
       ],
       "answer": 0,
       "explain": "Other networks compare MED only between paths from the same neighbouring AS, so it cannot steer between two providers."
      },
      {
       "q": "A route shows `(inaccessible)` next to its next hop on an internal router. What is the usual fix?",
       "options": [
        "Increase LOCAL_PREF for that route on the edge",
        "Configure next-hop-self on the edge router towards iBGP peers",
        "Add the route to an outbound prefix list",
        "Clear the eBGP session to the ISP with a full hard reset first"
       ],
       "answer": 1,
       "explain": "The internal router cannot reach the external next hop. Next-hop-self (or advertising the link in the IGP) makes the next hop reachable."
      },
      {
       "q": "A BGP route is best in the BGP table but the routing table uses an OSPF route to the same prefix. Why?",
       "options": [
        "The OSPF route has a lower administrative distance than iBGP",
        "BGP routes are never installed alongside any OSPF routes at all",
        "The BGP route must have a higher LOCAL_PREF",
        "OSPF always overrides BGP for default routes"
       ],
       "answer": 0,
       "explain": "The RIB installs the source with the lowest administrative distance; iBGP commonly has 200 and OSPF 110."
      },
      {
       "q": "Prepending your AS three times towards ISP-B has little effect on inbound traffic from some networks. Why?",
       "options": [
        "Prepending only works when a MED value is also set on each path",
        "Prepending removes your prefix from the table",
        "Those networks prefer by local preference before AS-path length",
        "Prepending is limited to iBGP sessions only"
       ],
       "answer": 2,
       "explain": "Networks apply their own LOCAL_PREF first; if they prefer ISP-B for business reasons, AS-path length is never reached."
      }
     ]
    }
   ]
  }
 ]
});
TRACK.exam.push([
 {
  "module": "m1",
  "q": "A university campus has grown from two to seven buildings, each with its own distribution pair. The buildings are currently connected to each other in a partial mesh, and every new building requires new fibre runs to several others. What should the architect recommend?",
  "options": [
   "Complete the full mesh so that every building connects to every other one",
   "Introduce a dedicated core pair that every distribution pair uplinks to",
   "Collapse all buildings into one distribution pair in the data centre",
   "Extend the access VLANs between buildings to simplify routing"
  ],
  "answer": 1,
  "explain": "With seven blocks a full mesh needs 21 links and keeps growing quadratically; a core makes growth linear and isolates each block. Collapsing everything creates one huge failure domain, and stretching VLANs spreads Layer 2 failures across buildings."
 },
 {
  "module": "m1",
  "q": "A leaf switch has 48 × 25G server ports and 4 × 100G uplinks to four spines. Storage traffic is congesting the uplinks. The spines have free ports and the leaves have two unused 100G uplink ports. What is the best way to lower the oversubscription ratio?",
  "options": [
   "Add two spines and connect each leaf's spare uplinks to them",
   "Add more leaves so storage servers spread across more racks",
   "Connect pairs of leaves directly using the spare 100G uplink ports",
   "Upgrade the server ports from 25G to 50G on each leaf"
  ],
  "answer": 0,
  "explain": "Today the ratio is 1,200G ÷ 400G = 3:1; six uplinks give 1,200G ÷ 600G = 2:1. Leaf-to-leaf links break the fabric model, more leaves do not add uplink capacity, and faster server ports make oversubscription worse."
 },
 {
  "module": "m1",
  "q": "Users on a routed-access campus complain that calls drop for about 40 seconds when a fibre between an access switch and its distribution switch fails through a media converter that keeps the port up. What change addresses this most directly?",
  "options": [
   "Increase the OSPF dead interval on both ends to avoid flapping",
   "Change the access switch to Layer 2 and run RSTP on the uplinks",
   "Add a floating static default route on the access switch through each uplink",
   "Enable BFD on the routed uplinks so the IGP learns of the failure quickly"
  ],
  "answer": 3,
  "explain": "The port stays up, so OSPF waits for its 40-second dead interval. BFD detects path loss in under a second. Longer timers make it worse; returning to Layer 2 adds spanning tree without solving detection; static routes would not detect the failure either."
 },
 {
  "module": "m1",
  "q": "A manufacturer needs both uplinks from each access switch to forward traffic, and several production VLANs must remain available on access switches in different halls. Which design meets both requirements?",
  "options": [
   "Routed access with ECMP uplinks and a separate gateway on every access switch",
   "Classic Layer 2 access with RSTP and VRRP on the distribution pair",
   "Layer 2 access with multi-chassis link aggregation to the distribution pair",
   "A single distribution switch with one uplink per access switch"
  ],
  "answer": 2,
  "explain": "Multi-chassis aggregation keeps VLANs able to span switches while both uplinks forward as one bundle. Routed access confines VLANs to one switch, classic RSTP blocks an uplink, and a single switch has no redundancy."
 },
 {
  "module": "m1",
  "q": "During a design review, an engineer proposes connecting the new internet firewalls directly to two floor access switches because they have free 10G ports. What is the strongest objection?",
  "options": [
   "Access switches cannot reliably forward firewall traffic at 10 Gbit/s rates",
   "Firewalls must always be connected to the spine layer",
   "Internet traffic must not use any IPv4 addresses inside",
   "Edge functions belong in their own module off the core or an edge block"
  ],
  "answer": 3,
  "explain": "Edges such as internet, WAN and DMZ are separate modules so they can be secured, scaled and changed independently of user access. Port speed and spine placement are not the issue."
 },
 {
  "module": "m1",
  "q": "A bank wants rules such as 'contractors may reach only the ticketing system' to remain valid as users roam between floors and receive different IP addresses. Which approach fits best?",
  "options": [
   "Per-floor VLAN access lists written around contractor IP addresses",
   "Group-based policy assigned at authentication in a fabric campus",
   "Static IP addresses for every contractor laptop and phone",
   "A separate physical network built only for contractors"
  ],
  "answer": 1,
  "explain": "Group-based policy follows identity rather than address, so rules stay valid as users move. Address-based ACLs break when addresses change, static addressing does not scale, and a separate physical network is costly and rigid."
 },
 {
  "module": "m1",
  "q": "A distribution pair runs VRRP for VLAN 30. DS1 is the VRRP master, but the spanning-tree root for VLAN 30 is DS2. What is the likely effect?",
  "options": [
   "Traffic crosses the inter-switch link before reaching the gateway",
   "VRRP fails, because the master must also be the spanning-tree root",
   "Hosts in VLAN 30 receive two different default gateways",
   "Spanning tree blocks the VRRP hello packets between them"
  ],
  "answer": 0,
  "explain": "Frames follow the spanning tree towards DS2 and then cross to DS1 to be routed. It still works, but it is inefficient; aligning root and master fixes it."
 },
 {
  "module": "m2",
  "q": "After a floor switch was replaced, users report that their PCs take about 30 seconds to get network access after boot, but uplinks converge instantly. `show spanning-tree` shows the host ports as `Desg LRN` for several seconds after link up, with type `P2p`. What is missing?",
  "options": [
   "Loop guard configuration on the host ports",
   "A lower bridge priority on the floor switch",
   "Edge (PortFast) configuration on the host ports",
   "Root guard configuration on the uplink ports"
  ],
  "answer": 2,
  "explain": "Non-edge ports with no RSTP peer cannot complete proposal/agreement and wait through timers. Edge ports forward immediately. Loop guard and root guard do not speed convergence, and priority affects root placement only."
 },
 {
  "module": "m2",
  "q": "Two distribution switches run MST. After a change, `show spanning-tree mst configuration` shows identical names and mappings, but DS1 shows revision 4 and DS2 revision 3. What is the result?",
  "options": [
   "They remain in one region because the names and mappings both match",
   "They are in different regions and their link becomes a boundary",
   "Only instance 0 stops working until the switches reload",
   "DS2 automatically adopts revision 4 from its neighbour"
  ],
  "answer": 1,
  "explain": "The region identifier is name, revision and mapping digest; any difference creates separate regions. Revision numbers are not synchronised automatically."
 },
 {
  "module": "m2",
  "q": "A contractor's switch, configured with priority 0, was connected to a distribution switch's downlink port and became root. The port is a trunk to an access switch. Which feature on that port would have kept the original root?",
  "options": [
   "BPDU guard",
   "Loop guard",
   "Root guard",
   "BPDU filter"
  ],
  "answer": 2,
  "explain": "Root guard on designated downlinks blocks superior BPDUs (root-inconsistent) while allowing normal BPDUs. BPDU guard would shut the trunk to a legitimate access switch, loop guard addresses missing BPDUs, and filter removes protection."
 },
 {
  "module": "m2",
  "q": "`show port-channel summary` on DS1 shows `Po2(SU) LACP Te1/0/1(P) Te1/0/2(P) Te1/0/3(s)`. Te1/0/3 was added yesterday. What should the engineer check first?",
  "options": [
   "Whether Te1/0/3's configuration matches the bundle (VLANs, speed, mode)",
   "Whether the LACP rate on Te1/0/3 is fast instead of slow",
   "Whether the partner switch uses passive mode on its links",
   "Whether Te1/0/3 has a lower LACP port priority than the two other members"
  ],
  "answer": 0,
  "explain": "Suspended members are incompatible with the bundle, usually through mismatched configuration. Rate and port priority do not cause suspension, and a passive partner still bundles with an active side."
 },
 {
  "module": "m2",
  "q": "A data-centre interconnect fibre develops a fault in one direction. Shortly afterwards a Layer 2 loop forms through the alternate port on the downstream switch. Which feature would most directly have prevented the loop?",
  "options": [
   "BPDU guard on all trunk ports",
   "Root guard on the downstream switch",
   "Storm control on all edge and uplink ports",
   "Loop guard on root and alternate ports"
  ],
  "answer": 3,
  "explain": "When BPDUs stop on a unidirectional link, the alternate port ages them out and moves to forwarding. Loop guard holds it in loop-inconsistent state. Storm control limits damage but does not prevent the loop."
 },
 {
  "module": "m2",
  "q": "Users in VLAN 40 on AS5 cannot reach their gateway; VLANs 10 and 20 on the same switch work. On the distribution switch, `show interfaces trunk` lists `Vlans allowed on trunk: 10,20,30` for the link to AS5. What is the fix?",
  "options": [
   "Add VLAN 40 to the allowed list on the trunk",
   "Change the native VLAN on the trunk to 40",
   "Create an SVI for VLAN 40 on the access switch",
   "Enable root guard on the trunk towards AS5"
  ],
  "answer": 0,
  "explain": "VLAN 40 is not carried by the trunk. Making it native would carry it untagged but breaks consistency; an SVI on the access switch would not bring the VLAN to the gateway."
 },
 {
  "module": "m2",
  "q": "A hosting provider wants 40 customer servers on one /24 subnet. Customers must not reach each other at Layer 2, but all must reach the shared gateway and a shared backup server. How should the ports be configured?",
  "options": [
   "Customers on community ports; gateway on an isolated port",
   "Customers on promiscuous ports; gateway on a community port",
   "Customers on isolated ports; gateway and backup server on promiscuous ports",
   "All servers in one shared community, with the backup server on an isolated port"
  ],
  "answer": 2,
  "explain": "Isolated ports reach only promiscuous ports, which suits customer separation. Promiscuous ports for shared services let every customer reach them."
 },
 {
  "module": "m2",
  "q": "During an outage, logs show `Host 0050.56a1.22b3 in vlan 20 is flapping between port Te1/0/13 and port Te1/0/14` and topology changes are rising by hundreds per minute. What is the best first action?",
  "options": [
   "Clear the MAC address table repeatedly until it settles",
   "Disable spanning tree on VLAN 20 to stop the changes",
   "Reload the root bridge to force a completely fresh election everywhere",
   "Shut the suspected looping link to stop the loop, then investigate"
  ],
  "answer": 3,
  "explain": "MAC flapping with constant topology changes indicates a loop; isolating the link restores service while evidence is collected. Clearing tables does not stop the loop, disabling spanning tree can worsen it, and reloading the root causes a wider outage."
 },
 {
  "module": "m3",
  "q": "R1 and R2 are directly connected in area 0. `show ip ospf neighbor` on R1 shows R2 stuck in `EXSTART/DR`. Hello and dead timers match. What is the most likely cause?",
  "options": [
   "The OSPF process IDs differ between R1 and R2",
   "The interface MTU differs between R1 and R2",
   "R2 is configured with an OSPF priority of 255",
   "Both routers use the same reference bandwidth"
  ],
  "answer": 1,
  "explain": "ExStart/Exchange problems are classically caused by MTU mismatch (or duplicate router IDs). Process IDs are locally significant, priority affects DR election, and matching reference bandwidth is desirable."
 },
 {
  "module": "m3",
  "q": "A store area contains small routers that must not receive the 9,000 external routes from the data centre, but each store redistributes a local static route for guest internet. Which area type should be used?",
  "options": [
   "Totally NSSA",
   "Totally stubby",
   "Stub",
   "Normal area"
  ],
  "answer": 0,
  "explain": "Totally NSSA blocks type 3, 4 and 5 LSAs (replacing them with a default) but allows type 7 externals inside the area. Stub types forbid redistribution; a normal area keeps all externals."
 },
 {
  "module": "m3",
  "q": "A router with the default OSPF reference bandwidth of 100 Mbit/s has a 1G path of three links and a 100G path of four links to the same destination. All traffic uses the 1G path. Why?",
  "options": [
   "OSPF always prefers the path made of the lowest-bandwidth interfaces",
   "The 100G links are not supported by OSPF without IS-IS",
   "Every link of 100 Mbit/s or faster costs 1, so three hops beat four",
   "OSPF prefers paths learned first when costs are close"
  ],
  "answer": 2,
  "explain": "With reference 100 Mbit/s, both 1G and 100G cost 1, so the path cost is 3 versus 4. Raising the reference bandwidth consistently fixes this."
 },
 {
  "module": "m3",
  "q": "After mutual redistribution between OSPF and IS-IS was enabled on two boundary routers, some IS-IS routes appear in IS-IS as external routes originated by the other boundary router. What is the best fix?",
  "options": [
   "Remove one boundary router so that only one redistribution point remains",
   "Increase the IS-IS seed metric for all routes redistributed from OSPF",
   "Use policy-based routing to forward IS-IS prefixes correctly",
   "Tag routes when redistributing and deny the opposite tag on both routers"
  ],
  "answer": 3,
  "explain": "Tags identify a route's origin and prevent it from re-entering its home domain. Removing a boundary router loses redundancy; metrics alone do not prevent feedback; PBR acts on packets, not routes."
 },
 {
  "module": "m3",
  "q": "An ABR summarises area 10 with `area 10 range 10.10.0.0 255.255.240.0`. Which set of subnets is fully covered by this summary?",
  "options": [
   "10.10.0.0/24 through 10.10.31.0/24",
   "10.10.0.0/24 through 10.10.15.0/24",
   "10.10.8.0/24 through 10.10.23.0/24",
   "10.10.0.0/24 through 10.10.7.0/24 only"
  ],
  "answer": 1,
  "explain": "255.255.240.0 is /20, which covers 16 /24s from 10.10.0.0 to 10.10.15.0. The /24s up to .31 would need a /19; a range starting at .8 is not aligned. The 0–7 range is covered but is not the full set."
 },
 {
  "module": "m3",
  "q": "Debug output on R1 shows `Mismatched hello parameters from 10.1.12.2` followed by `Dead R 40 C 120, Hello R 10 C 30`. What should be changed?",
  "options": [
   "Make R1's hello and dead timers match its neighbour's 10 and 40 seconds",
   "Make R1's network type broadcast so that it matches the neighbour's setting",
   "Increase the neighbour's dead timer to 160 seconds",
   "Change the area ID on R1 to match the neighbour"
  ],
  "answer": 0,
  "explain": "R is received and C is configured: the neighbour uses 10/40, R1 uses 30/120. The timers must match on both sides; the area ID and network type are not indicated by this message."
 },
 {
  "module": "m3",
  "q": "A new IPv6-only branch router running OSPFv3 never forms adjacencies. `show ospfv3` reports that the process cannot start. The router has no IPv4 addresses. What is the most likely cause?",
  "options": [
   "OSPFv3 needs a global unicast address on every link",
   "No 32-bit router ID has been configured for the process",
   "OSPFv3 requires an IPv4 address on each interface",
   "OSPFv3 cannot run without an IS-IS process for IPv6"
  ],
  "answer": 1,
  "explain": "OSPFv3 still uses a 32-bit router ID; with no IPv4 address to derive one from, it must be configured. OSPFv3 runs over link-local addresses and does not need IPv4 interfaces."
 },
 {
  "module": "m3",
  "q": "Guest traffic from 10.50.0.0/16 to TCP port 443 must leave via a cheap broadband router at 203.0.113.1, while all other traffic follows the routing table. What is the right tool?",
  "options": [
   "A static default route pointing to 203.0.113.1 on the core",
   "A route map redistributing 10.50.0.0/16 into OSPF as external type 1",
   "A prefix list denying 10.50.0.0/16 from OSPF updates",
   "Policy-based routing applied inbound on the guest gateway interface"
  ],
  "answer": 3,
  "explain": "PBR matches packets by source and port and overrides the routing table only for them. A static default would move all traffic; redistribution and prefix lists change route advertisements, not per-packet forwarding."
 },
 {
  "module": "m4",
  "q": "An eBGP session to ISP-B stays in Active. The ISP's router at 192.0.2.9 replies to ping from the enterprise router's outside interface. The firewall in front of the edge router was recently replaced. What should be checked first?",
  "options": [
   "Whether LOCAL_PREF is set higher for the routes received from ISP-B",
   "Whether the AS path is prepended towards ISP-B",
   "Whether the new firewall permits TCP port 179 between the peers",
   "Whether communities are being sent to ISP-B"
  ],
  "answer": 2,
  "explain": "Active means TCP is not completing. Ping proves basic reachability, so a filter on TCP 179 is the likely culprit. The other options are policy settings that only matter once the session is up."
 },
 {
  "module": "m4",
  "q": "An internal router shows the default route from E1 as `203.0.113.1 (inaccessible)` with `no best path`. E1's eBGP peer is 203.0.113.1. What is the most appropriate fix?",
  "options": [
   "Set a higher LOCAL_PREF on E1 for routes from ISP-A",
   "Configure ebgp-multihop on the internal router",
   "Advertise the default route with a lower MED value internally",
   "Configure next-hop-self on E1 for its iBGP neighbours"
  ],
  "answer": 3,
  "explain": "The internal router cannot reach the external next hop. Next-hop-self replaces it with E1's loopback, which the IGP carries. Attribute changes cannot make an unreachable next hop valid."
 },
 {
  "module": "m4",
  "q": "An enterprise multihomed to two ISPs sees its links filled with traffic between the ISPs' customers. Its outbound route maps contain only `route-map TO-ISP permit 10`. What is the correct fix?",
  "options": [
   "Apply a maximum-prefix limit on each eBGP session",
   "Match only its own prefixes and an empty AS path in outbound policy",
   "Raise LOCAL_PREF on all routes learned from the busier of the two providers",
   "Stop advertising the default route to internal routers"
  ],
  "answer": 1,
  "explain": "A permit-all outbound policy re-advertises each provider's routes to the other, making the enterprise a transit AS. Max-prefix, local preference and internal defaults do not stop the leak."
 },
 {
  "module": "m4",
  "q": "Paths to the same prefix: path 1 has LOCAL_PREF 100 and AS_PATH length 2; path 2 has LOCAL_PREF 150 and AS_PATH length 5. Both next hops are reachable. Which is selected and why?",
  "options": [
   "Path 2, because LOCAL_PREF is compared before AS_PATH length",
   "Path 1, because a shorter AS_PATH is always preferred before anything",
   "Path 1, because it has the lower LOCAL_PREF value",
   "Both, because BGP load-shares across different paths"
  ],
  "answer": 0,
  "explain": "After next-hop reachability (and any implementation-specific weight), LOCAL_PREF is the first attribute compared; higher wins, so AS_PATH length is never reached."
 },
 {
  "module": "m4",
  "q": "A company has 30 iBGP routers in a full mesh and plans to reach 60. Operations wants to reduce configuration effort without changing AS numbers. What should be proposed?",
  "options": [
   "A confederation splitting the AS into six sub-ASes",
   "Redistributing BGP into the IGP to remove iBGP sessions",
   "A redundant pair of route reflectors with all other routers as clients",
   "Replacing iBGP with eBGP sessions between every pair of routers in the AS"
  ],
  "answer": 2,
  "explain": "A full mesh of 60 would need 1,770 sessions; two reflectors need about 117. Confederations require reconfiguring every router into sub-ASes; redistributing a full BGP table into the IGP is unsafe; eBGP everywhere changes the design entirely."
 },
 {
  "module": "m4",
  "q": "An enterprise wants inbound traffic to arrive mainly over ISP-A, using ISP-B only as backup. It already prepends three times towards ISP-B, but some large networks still send traffic through ISP-B. What is the most effective additional step?",
  "options": [
   "Prepend ten more times towards ISP-B to strengthen the effect of the AS path",
   "Use ISP-B's documented community to lower local preference inside ISP-B",
   "Send a lower MED to ISP-A than to ISP-B on every route",
   "Raise LOCAL_PREF on routes received from ISP-A internally"
  ],
  "answer": 1,
  "explain": "Networks that prefer ISP-B by local preference never compare AS-path length; a provider community changes the decision inside ISP-B itself. Extra prepends have diminishing returns, MED is not compared across providers, and internal LOCAL_PREF controls outbound traffic only."
 },
 {
  "module": "m4",
  "q": "RR1 peers with edge routers E1 and E2 over iBGP, but the configuration has no route-reflector-client statements. E2 never learns the prefixes E1 receives from its ISP, although RR1 has them. Why?",
  "options": [
   "E2 needs ebgp-multihop configured to receive routes from any reflector",
   "RR1 must change the next hop before advertising to E2",
   "Without client configuration RR1 obeys the iBGP split-horizon rule",
   "E1's routes carry a CLUSTER_LIST that RR1 rejects"
  ],
  "answer": 2,
  "explain": "A router only reflects iBGP-learned routes to peers marked as clients (or from clients to non-clients). Without it, normal iBGP rules stop RR1 passing E1's routes to E2. Multihop is for eBGP, next hop changes are not required, and no cluster list exists before reflection."
 }
]);
