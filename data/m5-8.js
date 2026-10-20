window.TRACK = window.TRACK || { modules: [], exam: [] };
TRACK.modules.push({
 "id": "m5",
 "order": 5,
 "code": "Overlay",
 "title": "Overlay — Virtualisation & Overlays",
 "subtitle": "Many logical networks on one underlay: VRFs, tunnels, IPsec, VXLAN EVPN and SD-WAN.",
 "outcomes": [
  "Segment an enterprise with VRFs and plan route distinguishers, route targets and route leaking.",
  "Build GRE and IPsec tunnels with correct MTU handling and avoid recursive routing.",
  "Explain how NHRP enables on-demand spoke-to-spoke tunnels in a dynamic multipoint VPN.",
  "Describe VXLAN encapsulation and the BGP EVPN control plane in a spine-leaf fabric.",
  "Design SD-WAN topology, application-aware routing and internet breakout policies."
 ],
 "lessons": [
  {
   "id": "m5-l1",
   "title": "VRFs and VRF-lite",
   "subtitle": "Many routing tables on one box: isolation, route leaking and a route-target plan",
   "minutes": 35,
   "objectives": [
    "Explain how a VRF separates routing and forwarding tables on a single device.",
    "Configure and verify VRF-lite on a routed hop, including per-VRF routing.",
    "Distinguish route distinguishers from route targets and plan both for an enterprise.",
    "Choose a safe route-leaking method to reach shared services."
   ],
   "blocks": [
    {
     "type": "text",
     "text": "The Overlay stage of **The ZCNP Fabric** is about running several logical networks on one physical network. Modules 1 to 4 gave you a resilient underlay: a campus and spine-leaf design, a loop-free Layer 2 edge, a stable IGP and a disciplined BGP edge. Overlays reuse that investment. The first and simplest overlay tool is the **VRF**: a separate routing and forwarding instance that lets guests, IoT devices, corporate users and management traffic share links without ever seeing each other's routes."
    },
    {
     "type": "callout",
     "kind": "definition",
     "text": "An independent routing table, forwarding table (FIB) and set of interfaces on one device. A packet arriving on an interface bound to a VRF is looked up **only** in that VRF's table, so identical prefixes can exist in different VRFs and traffic cannot cross between them unless you deliberately leak routes.",
     "title": "Virtual Routing and Forwarding (VRF)"
    },
    {
     "type": "topology",
     "title": "Where VRFs sit in an enterprise design",
     "nodes": [
      {
       "id": "ss",
       "kind": "server",
       "label": "Shared services",
       "x": 1,
       "y": 0,
       "sub": "DNS, DHCP, NAC"
      },
      {
       "id": "fw",
       "kind": "firewall",
       "label": "Fusion firewall",
       "x": 3,
       "y": 0,
       "sub": "inter-VRF policy"
      },
      {
       "id": "net",
       "kind": "internet",
       "label": "Internet",
       "x": 5,
       "y": 0
      },
      {
       "id": "core",
       "kind": "l3switch",
       "label": "Core",
       "x": 3,
       "y": 1.5,
       "sub": "VRFs CORP, GUEST, IOT"
      },
      {
       "id": "ds",
       "kind": "l3switch",
       "label": "Distribution",
       "x": 3,
       "y": 3,
       "sub": "SVIs per VRF"
      },
      {
       "id": "pc",
       "kind": "laptop",
       "label": "Staff laptop",
       "x": 1.5,
       "y": 4.5,
       "sub": "VLAN 10, CORP"
      },
      {
       "id": "ph",
       "kind": "phone",
       "label": "Guest phone",
       "x": 3,
       "y": 4.5,
       "sub": "VLAN 20, GUEST"
      },
      {
       "id": "cam",
       "kind": "sensor",
       "label": "IoT sensor",
       "x": 4.5,
       "y": 4.5,
       "sub": "VLAN 30, IOT"
      }
     ],
     "links": [
      {
       "a": "fw",
       "b": "ss"
      },
      {
       "a": "fw",
       "b": "net"
      },
      {
       "a": "core",
       "b": "fw",
       "label": "one subinterface per VRF"
      },
      {
       "a": "ds",
       "b": "core",
       "label": "VRF-lite: .10 .20 .30"
      },
      {
       "a": "ds",
       "b": "pc"
      },
      {
       "a": "ds",
       "b": "ph"
      },
      {
       "a": "ds",
       "b": "cam"
      }
     ],
     "caption": "Each VRF is carried hop by hop on its own subinterface, so CORP, GUEST and IOT never share a routing table. The only place traffic can cross between VRFs, or reach shared services and the internet, is the fusion firewall, where the policy and the logs live."
    },
    {
     "type": "compare",
     "title": "VRF-lite or a full VPN control plane?",
     "columns": [
      {
       "title": "VRF-lite",
       "items": [
        "VRFs configured hop by hop",
        "Each VRF needs its own subinterface or SVI on every transit link",
        "Per-VRF routing protocol instance or static routes",
        "Simple and fine for 2–4 VRFs across a few hops",
        "Operational effort grows with every VRF and every hop"
       ]
      },
      {
       "title": "MP-BGP VPN (L3VPN or EVPN)",
       "items": [
        "Only edge devices hold the VRFs",
        "Core carries labels or VXLAN, not per-VRF state",
        "One BGP session carries routes for all VRFs",
        "Route targets control who imports what",
        "Scales to hundreds of VRFs and sites"
       ]
      }
     ]
    },
    {
     "type": "cli",
     "device": "R1 · IOS-style CLI",
     "lines": [
      "vrf definition GUEST",
      " rd 65010:20",
      " address-family ipv4",
      " exit-address-family",
      "!",
      "interface GigabitEthernet0/1.20",
      " encapsulation dot1Q 20",
      " vrf forwarding GUEST",
      " ip address 10.20.0.1 255.255.255.252",
      "!",
      "router ospf 20 vrf GUEST",
      " router-id 10.255.20.1",
      " network 10.20.0.0 0.0.255.255 area 0"
     ],
     "title": "VRF-lite on a transit link",
     "note": "The RD is optional for pure VRF-lite but harmless, and it keeps the configuration ready for a later MP-BGP migration."
    },
    {
     "type": "callout",
     "kind": "warning",
     "text": "Binding an interface to a VRF removes any IP address already configured on it. Apply `vrf forwarding` first, then the address. On a production device, stage the change in a maintenance window because the interface drops out of the global table immediately.",
     "title": "Order of operations"
    },
    {
     "type": "cli",
     "device": "R1 · IOS-style CLI",
     "lines": [
      "R1# show ip route vrf GUEST",
      "Routing Table: GUEST",
      "      10.0.0.0/8 is variably subnetted, 3 subnets, 3 masks",
      "C        10.20.0.0/30 is directly connected, GigabitEthernet0/1.20",
      "L        10.20.0.1/32 is directly connected, GigabitEthernet0/1.20",
      "O        10.20.64.0/18 [110/2] via 10.20.0.2, 00:12:41, GigabitEthernet0/1.20",
      "R1# ping vrf GUEST 10.20.64.1 source GigabitEthernet0/1.20",
      "!!!!!",
      "Success rate is 100 percent (5/5), round-trip min/avg/max = 1/1/2 ms"
     ],
     "title": "Verifying per-VRF routing",
     "note": "A plain `ping` uses the global table and would fail here. Most show and test commands need the `vrf` keyword."
    },
    {
     "type": "table",
     "head": [
      "Item",
      "What it is",
      "Scope",
      "Typical format"
     ],
     "rows": [
      [
       "VRF name",
       "Local label for the instance",
       "Only the local device",
       "GUEST, CORP, IOT"
      ],
      [
       "Route distinguisher (RD)",
       "Prefix added to make overlapping routes unique inside MP-BGP",
       "Per VRF per device (unique per PE is common)",
       "ASN:nn or router-ID:nn"
      ],
      [
       "Route target (RT)",
       "Extended community that controls import and export",
       "Network-wide policy",
       "ASN:nn, e.g. 65010:20"
      ]
     ],
     "title": "RD, RT and VRF name: three different things"
    },
    {
     "type": "steps",
     "title": "Ways to leak routes to shared services",
     "items": [
      {
       "title": "Fusion firewall",
       "text": "Each VRF peers with a firewall that holds the inter-VRF policy. Best visibility and control; the usual enterprise choice."
      },
      {
       "title": "Fusion router",
       "text": "A router with all VRFs exchanges routes using per-VRF peering. Simple, but policy is limited to route filtering and ACLs."
      },
      {
       "title": "Route-target import",
       "text": "With MP-BGP, a VRF imports the shared-services RT and the shared-services VRF imports each client RT. Precise but easy to over-leak."
      },
      {
       "title": "Static inter-VRF routes",
       "text": "A static route in one VRF points to a next hop in another. Acceptable for one or two prefixes; hard to audit at scale."
      }
     ]
    },
    {
     "type": "template",
     "title": "VRF and route-target plan",
     "purpose": "Agree VRF names, identifiers and leaking rules before any device is touched, so every team configures the same values.",
     "columns": [
      "VRF",
      "Purpose",
      "RD scheme",
      "Export RT",
      "Import RT(s)",
      "Leaks to / policy point"
     ],
     "example": [
      [
       "GUEST",
       "Visitor internet only",
       "<loopback>:20",
       "65010:20",
       "65010:20, 65010:900 (DHCP/DNS)",
       "Internet via fusion firewall only"
      ],
      [
       "IOT",
       "Building systems",
       "<loopback>:30",
       "65010:30",
       "65010:30, 65010:900",
       "Vendor jump host via firewall; no CORP"
      ]
     ],
     "rows": 6
    },
    {
     "type": "scenario",
     "title": "Guests cannot get an address",
     "situation": "After moving guest SSIDs into a new GUEST VRF, clients associate but never receive an IP address. The DHCP server lives in a shared-services VRF. Relay is configured on the guest SVI. What is the most likely fix?",
     "options": [
      {
       "text": "Move the DHCP server into the global routing table so that every VRF on the campus can reach it.",
       "feedback": "The global table is not visible from a VRF by default, so this alone changes nothing and weakens segmentation.",
       "best": false
      },
      {
       "text": "Configure the same route distinguisher on GUEST and the shared-services VRF so routes are shared.",
       "feedback": "The RD only makes routes unique inside MP-BGP; it never controls import. Matching RDs do not leak anything.",
       "best": false
      },
      {
       "text": "Disable VRF-lite on the guest SVI until the DHCP issue is solved, then re-enable it afterwards.",
       "feedback": "That removes the isolation the change was meant to deliver and hides the real problem.",
       "best": false
      },
      {
       "text": "Leak the DHCP server's prefix into GUEST and the guest subnets back, and use a VRF-aware relay.",
       "feedback": "Correct. The relay forwards requests from the GUEST VRF, so the server's route must exist there, and replies need a return route. Both directions must be leaked through the policy point.",
       "best": true
      }
     ]
    },
    {
     "type": "terms",
     "items": [
      {
       "term": "VRF-lite",
       "def": "VRFs configured hop by hop without an MP-BGP control plane; each VRF needs its own logical interface on every transit link."
      },
      {
       "term": "Route distinguisher (RD)",
       "def": "A 64-bit value prepended to an IPv4 or IPv6 prefix so overlapping customer routes stay unique inside MP-BGP."
      },
      {
       "term": "Route target (RT)",
       "def": "A BGP extended community attached on export and matched on import to decide which VRFs receive a route."
      }
     ]
    },
    {
     "type": "keypoints",
     "title": "Key takeaways",
     "items": [
      "A VRF is a separate routing table and FIB; identical prefixes can coexist in different VRFs.",
      "VRF-lite needs a logical interface per VRF on every hop; MP-BGP VPNs keep VRF state only at the edges.",
      "The RD makes routes unique; the RT decides import and export; the VRF name is local.",
      "Leak to shared services in both directions at one documented policy point, ideally a fusion firewall.",
      "Bind the interface to the VRF before adding its address, and use VRF-aware show and ping commands."
     ]
    },
    {
     "type": "quiz",
     "items": [
      {
       "q": "A router has the prefix 10.1.0.0/16 in both the CORP and IOT VRFs. What allows this?",
       "options": [
        "The router silently prefers the VRF that was configured first on the device",
        "Overlapping prefixes are only allowed when both VRFs share the same RD value",
        "Each VRF has its own routing table and FIB, so the prefixes never collide",
        "The prefixes are automatically summarised into one entry in the global table"
       ],
       "answer": 2,
       "explain": "VRFs are separate tables. Overlap is normal; collisions only become a concern when routes are leaked between VRFs."
      },
      {
       "q": "In an MP-BGP VPN, which attribute decides whether a route is imported into a VRF?",
       "options": [
        "The route target extended community",
        "The route distinguisher prepended to the prefix",
        "The VRF name configured on the receiving router",
        "The advertising router's next hop"
       ],
       "answer": 0,
       "explain": "Route targets are policy. The RD only makes prefixes unique; the VRF name is local."
      },
      {
       "q": "An engineer configures `ip address` and then `vrf forwarding CORP` on an interface. What happens?",
       "options": [
        "The address moves into CORP automatically with no impact",
        "The IP address is removed and must be configured again",
        "The command is rejected until the address is removed by hand",
        "The interface keeps its address in both the global table and CORP"
       ],
       "answer": 1,
       "explain": "Binding an interface to a VRF clears its IP configuration, so apply the VRF first."
      },
      {
       "q": "Which route-leaking approach gives the most inspection and logging between VRFs?",
       "options": [
        "Static inter-VRF routes pointing directly at a next hop in the other VRF",
        "Importing every client route target into the shared-services VRF",
        "Using one route distinguisher for all VRFs that need to communicate",
        "Leaking through a fusion firewall that holds the inter-VRF policy"
       ],
       "answer": 3,
       "explain": "A firewall at the leaking point adds stateful policy and logs. RT import and static leaks only control reachability."
      },
      {
       "q": "When does VRF-lite start to become hard to operate?",
       "options": [
        "When many VRFs cross many routed hops, each needing its own subinterface",
        "As soon as a second VRF is added to any single device in the campus network",
        "When the VRFs use overlapping private address space in different buildings",
        "When a management VRF is used for out-of-band access to every device"
       ],
       "answer": 0,
       "explain": "VRF-lite effort grows with VRFs multiplied by hops. MP-BGP VPNs keep that state only at the edge."
      }
     ]
    }
   ]
  },
  {
   "id": "m5-l2",
   "title": "GRE Tunnels and Recursive Routing",
   "subtitle": "Point-to-point overlays, MTU budgets and the classic flapping-tunnel trap",
   "minutes": 35,
   "objectives": [
    "Describe GRE encapsulation and the overhead it adds.",
    "Configure a GRE tunnel with correct MTU and MSS settings.",
    "Recognise recursive routing and fix it with route separation or a front-door VRF."
   ],
   "blocks": [
    {
     "type": "text",
     "text": "**Generic Routing Encapsulation (GRE)** wraps one packet inside another so that it can cross a network that would not otherwise carry it. It is protocol-agnostic, supports multicast, and therefore lets you run an IGP between two sites over the internet or a provider core. GRE adds no confidentiality or integrity by itself; in production it is almost always protected by IPsec, which the next lesson covers."
    },
    {
     "type": "packet",
     "title": "GRE over IPv4: what is on the wire",
     "fields": [
      {
       "label": "Version",
       "bits": 4
      },
      {
       "label": "IHL",
       "bits": 4
      },
      {
       "label": "DSCP",
       "bits": 6
      },
      {
       "label": "ECN",
       "bits": 2
      },
      {
       "label": "Total length",
       "bits": 16
      },
      {
       "label": "Identification",
       "bits": 16
      },
      {
       "label": "Flags",
       "bits": 3
      },
      {
       "label": "Fragment offset",
       "bits": 13
      },
      {
       "label": "TTL",
       "bits": 8
      },
      {
       "label": "Protocol = 47",
       "bits": 8
      },
      {
       "label": "Header checksum",
       "bits": 16
      },
      {
       "label": "Source = local tunnel source",
       "bits": 32
      },
      {
       "label": "Destination = remote tunnel endpoint",
       "bits": 32
      },
      {
       "label": "C",
       "bits": 1
      },
      {
       "label": "Reserved0",
       "bits": 12
      },
      {
       "label": "Ver",
       "bits": 3
      },
      {
       "label": "Protocol type (0x0800 = IPv4)",
       "bits": 16
      },
      {
       "label": "Passenger packet: original IP header and payload",
       "bits": 32,
       "variable": true
      }
     ],
     "caption": "Twenty bytes of delivery IPv4 header plus a 4-byte base GRE header make the 24 bytes of overhead. Setting the key or sequence-number options adds 4 bytes each, which is why the MTU arithmetic below must match the options you actually use."
    },
    {
     "type": "cli",
     "device": "R1 · IOS-style CLI",
     "lines": [
      "interface Tunnel0",
      " description GRE to Branch-7",
      " ip address 172.31.7.1 255.255.255.252",
      " ip mtu 1400",
      " ip tcp adjust-mss 1360",
      " keepalive 10 3",
      " tunnel source GigabitEthernet0/0",
      " tunnel destination 198.51.100.7",
      "!",
      "router ospf 1",
      " network 172.31.7.0 0.0.0.3 area 0"
     ],
     "title": "Point-to-point GRE with an IGP over it",
     "note": "1400/1360 leaves room for IPsec later. For plain GRE, 1476 is the true maximum on a 1500-byte path."
    },
    {
     "type": "formula",
     "title": "Tunnel MTU arithmetic",
     "items": [
      {
       "name": "GRE IP MTU",
       "expr": "1500 − 20 (delivery IP) − 4 (GRE) = 1476",
       "meaning": "The largest passenger IP packet that fits a 1500-byte transport without fragmentation."
      },
      {
       "name": "TCP MSS",
       "expr": "IP MTU − 20 (IP) − 20 (TCP) = 1436 for GRE alone",
       "meaning": "Clamping MSS on the tunnel stops TCP hosts from sending segments that will need fragmenting."
      },
      {
       "name": "Safe IPsec-ready values",
       "expr": "ip mtu 1400, adjust-mss 1360",
       "meaning": "Leaves headroom for ESP, NAT-T and padding so the same tunnel survives protection being added."
      }
     ]
    },
    {
     "type": "callout",
     "kind": "definition",
     "text": "A tunnel is recursively routed when the best route to its **own destination address** points back into the tunnel. The router cannot send a packet into a tunnel whose transport depends on that same tunnel, so it shuts the tunnel down, the routes learned over it disappear, the tunnel comes back, and the cycle repeats.",
     "title": "Recursive routing"
    },
    {
     "type": "cycle",
     "title": "How the flap cycle forms",
     "center": "Repeats every keepalive cycle",
     "items": [
      {
       "label": "Tunnel up",
       "text": "the route to 198.51.100.7 uses the physical WAN"
      },
      {
       "label": "Adjacency forms",
       "text": "OSPF runs over Tunnel0 and exchanges all prefixes"
      },
      {
       "label": "Better route learned",
       "text": "the far side advertises a route covering 198.51.100.7 through the tunnel"
      },
      {
       "label": "Recursion detected",
       "text": "the destination now resolves into the tunnel, so the router disables Tunnel0"
      },
      {
       "label": "Routes withdrawn",
       "text": "the adjacency drops, the physical route returns and the cycle starts again"
      }
     ],
     "caption": "Nothing in the loop is broken hardware: the overlay is learning a route to its own transport. Breaking any link of the cycle durably means keeping transport prefixes out of the overlay."
    },
    {
     "type": "cli",
     "device": "R1 · IOS-style CLI",
     "lines": [
      "%TUN-5-RECURDOWN: Tunnel0 temporarily disabled due to recursive routing",
      "%LINEPROTO-5-UPDOWN: Line protocol on Interface Tunnel0, changed state to down",
      "%OSPF-5-ADJCHG: Process 1, Nbr 10.255.0.7 on Tunnel0 from FULL to DOWN",
      "%LINEPROTO-5-UPDOWN: Line protocol on Interface Tunnel0, changed state to up",
      "%OSPF-5-ADJCHG: Process 1, Nbr 10.255.0.7 on Tunnel0 from LOADING to FULL"
     ],
     "title": "The log signature of recursive routing",
     "note": "A tunnel that goes down and up on a regular rhythm, together with adjacency changes, is the tell-tale pattern."
    },
    {
     "type": "compare",
     "title": "Fixes that work and fixes that hide the problem",
     "columns": [
      {
       "title": "Durable fixes",
       "items": [
        "Never advertise transport (WAN) prefixes into the overlay IGP",
        "Pin the tunnel destination with a /32 static route via the physical next hop",
        "Put the transport interface in a front-door VRF so tunnel lookups never use the overlay table",
        "Filter the remote endpoint prefix inbound on the tunnel"
       ]
      },
      {
       "title": "Weak fixes",
       "items": [
        "Raising the IGP cost on the tunnel (a longer prefix still wins)",
        "Disabling keepalives so the flap is less visible",
        "Shortening timers so the tunnel recovers faster",
        "Rebooting the branch router"
       ]
      }
     ]
    },
    {
     "type": "cli",
     "device": "R1 · IOS-style CLI",
     "lines": [
      "vrf definition INET",
      " address-family ipv4",
      " exit-address-family",
      "!",
      "interface GigabitEthernet0/0",
      " vrf forwarding INET",
      " ip address 203.0.113.2 255.255.255.252",
      "!",
      "ip route vrf INET 0.0.0.0 0.0.0.0 203.0.113.1",
      "!",
      "interface Tunnel0",
      " tunnel source GigabitEthernet0/0",
      " tunnel destination 198.51.100.7",
      " tunnel vrf INET"
     ],
     "title": "Front-door VRF: transport and overlay in separate tables",
     "note": "The tunnel endpoint is resolved only in INET, while the tunnel interface itself stays in the global or a corporate VRF. A default route from the internet can never collide with overlay routes."
    },
    {
     "type": "keypoints",
     "items": [
      "Tunnel down/down: check the route to the tunnel destination and that the source interface is up.",
      "Up/up but no adjacency: verify that both sides use the same subnet and that multicast hellos pass.",
      "Small pings pass, large transfers stall: check `ip mtu`, MSS clamping and whether ICMP 'fragmentation needed' is filtered.",
      "Periodic flapping: suspect recursive routing before blaming the carrier."
     ],
     "title": "GRE troubleshooting quick list"
    },
    {
     "type": "scenario",
     "title": "The tunnel that flaps every 70 seconds",
     "situation": "A new GRE tunnel to a branch comes up, OSPF reaches FULL, and roughly a minute later both drop and return. The branch advertises a summary 198.51.100.0/24 into OSPF, which includes the head-end's tunnel destination. What do you change?",
     "options": [
      {
       "text": "Stop advertising the transport range into OSPF, or put the WAN interface in a front-door VRF.",
       "feedback": "Correct. Removing the overlap between transport and overlay routing removes the recursion permanently.",
       "best": true
      },
      {
       "text": "Set a higher OSPF cost on Tunnel0 so that the physical route to the branch is always preferred.",
       "feedback": "The tunnel-learned /24 is compared with the physical default route by longest match first, so cost does not help.",
       "best": false
      },
      {
       "text": "Increase the keepalive interval to 30 seconds so the tunnel has more time to stabilise itself.",
       "feedback": "Keepalives are not the cause; the route to the destination is. The flap would continue.",
       "best": false
      },
      {
       "text": "Replace GRE with IP-in-IP encapsulation, which does not suffer from recursive routing at all.",
       "feedback": "Any tunnel whose destination is learned through itself has the same issue.",
       "best": false
      }
     ]
    },
    {
     "type": "terms",
     "items": [
      {
       "term": "GRE",
       "def": "A stateless encapsulation (IP protocol 47) that carries any network-layer packet, including multicast, inside a delivery IP packet."
      },
      {
       "term": "Front-door VRF",
       "def": "A VRF that holds the transport interface and its routes, so tunnel endpoint lookups are isolated from the overlay routing table."
      }
     ]
    },
    {
     "type": "keypoints",
     "title": "Key takeaways",
     "items": [
      "GRE carries any protocol, including multicast, but adds no security on its own.",
      "Plain GRE costs 24 bytes: IP MTU 1476 on a 1500-byte path; use 1400 and MSS 1360 if IPsec will be added.",
      "A tunnel that flaps on a regular rhythm usually has recursive routing.",
      "Fix recursion by separating transport and overlay routing, ideally with a front-door VRF.",
      "Large transfers that stall while small pings pass point to MTU and filtered ICMP."
     ]
    },
    {
     "type": "quiz",
     "items": [
      {
       "q": "What is the IP MTU of a plain GRE tunnel over a 1500-byte IPv4 path with no key or sequence fields?",
       "options": [
        "1500 bytes",
        "1460 bytes",
        "1400 bytes",
        "1476 bytes"
       ],
       "answer": 3,
       "explain": "1500 minus 20 bytes of delivery IP header and 4 bytes of GRE header gives 1476."
      },
      {
       "q": "Which log pattern most strongly suggests recursive routing?",
       "options": [
        "The tunnel stays down/down after the tunnel source interface is administratively shut",
        "The tunnel and its IGP adjacency go down and up again on a regular cycle",
        "The tunnel stays up but small pings succeed while large ones fail",
        "The tunnel is up/up but the IGP never progresses beyond the INIT state"
       ],
       "answer": 1,
       "explain": "Recursion causes a rhythmic flap: the adjacency brings in the bad route, the tunnel drops, the route goes away and the tunnel returns."
      },
      {
       "q": "Why does raising the IGP cost on a tunnel usually fail to fix recursive routing?",
       "options": [
        "The IGP silently ignores manually configured cost values on all GRE tunnel interfaces",
        "Tunnel interfaces always use a fixed administrative distance of zero in the routing table",
        "Longest-prefix match is applied before metrics, so the more specific route still wins",
        "Cost changes only take effect after the tunnel interface is reset"
       ],
       "answer": 2,
       "explain": "Routing chooses the most specific prefix first. Cost matters only between equal-length routes from the same protocol."
      },
      {
       "q": "What does the `tunnel vrf INET` command achieve?",
       "options": [
        "The tunnel interface itself is moved into the INET VRF for overlay routing",
        "The tunnel endpoint is looked up in the INET VRF, not the overlay table",
        "All traffic entering the tunnel is filtered against the INET routing table",
        "The INET VRF routes are leaked into the global table through the tunnel"
       ],
       "answer": 1,
       "explain": "It sets the VRF used for the transport lookup only. The tunnel interface stays in whatever VRF its `vrf forwarding` command places it."
      },
      {
       "q": "Users across a GRE tunnel can load small web pages but large file transfers hang. What is the most likely cause?",
       "options": [
        "An IGP metric mismatch between the two ends of the tunnel interfaces",
        "The GRE keepalive interval is too short for the tunnel round-trip time",
        "The tunnel uses a /30 subnet instead of a /31 point-to-point subnet",
        "A path MTU problem, with ICMP feedback filtered along the way"
       ],
       "answer": 3,
       "explain": "This is the classic MTU black hole. Lower `ip mtu`, clamp MSS and allow ICMP type 3 code 4."
      }
     ]
    }
   ]
  },
  {
   "id": "m5-l3",
   "title": "IPsec Site-to-Site and Dynamic Multipoint VPN",
   "subtitle": "IKEv2, route-based tunnels and on-demand spoke-to-spoke paths",
   "minutes": 40,
   "objectives": [
    "Explain the IKEv2 exchanges and the SAs they create.",
    "Configure a route-based IKEv2 tunnel protected by IPsec and interpret its counters.",
    "Describe how NHRP lets spokes build direct tunnels in a hub-and-spoke dynamic multipoint VPN."
   ],
   "blocks": [
    {
     "type": "text",
     "text": "IPsec adds confidentiality, integrity and peer authentication to an overlay. In modern designs it is built **route-based**: a virtual tunnel interface (VTI) carries traffic, routing decides what enters it, and IKEv2 negotiates the keys. This keeps security and routing cleanly separated, and it is the foundation for both classic site-to-site tunnels and hub-and-spoke dynamic multipoint VPNs."
    },
    {
     "type": "framework",
     "title": "IPsec building blocks",
     "items": [
      {
       "label": "IKE",
       "title": "IKE SA",
       "text": "The authenticated, encrypted control channel between peers, built by IKEv2 (UDP 500, or 4500 when NAT is detected)."
      },
      {
       "label": "CHLD",
       "title": "Child SA",
       "text": "A pair of unidirectional IPsec SAs (one each way) that actually protect user traffic, identified by SPIs."
      },
      {
       "label": "ESP",
       "title": "Encapsulating Security Payload",
       "text": "IP protocol 50. Provides encryption and integrity; AEAD ciphers such as AES-GCM do both in one step."
      },
      {
       "label": "AUTH",
       "title": "Peer authentication",
       "text": "Pre-shared keys for small estates; certificates from an internal PKI for anything that must scale or rotate."
      },
      {
       "label": "PFS",
       "title": "Perfect forward secrecy",
       "text": "A fresh Diffie-Hellman exchange per child SA rekey, so one compromised key does not expose earlier traffic."
      }
     ]
    },
    {
     "type": "sequence",
     "title": "IKEv2 in four exchanges",
     "actors": [
      "HQ-R1 (initiator)",
      "BR7 (responder)"
     ],
     "steps": [
      {
       "from": 0,
       "to": 1,
       "label": "IKE_SA_INIT request",
       "note": "SAi1, KEi, Ni on UDP 500"
      },
      {
       "from": 1,
       "to": 0,
       "label": "IKE_SA_INIT response",
       "note": "SAr1, KEr, Nr, NAT detection",
       "reply": true
      },
      {
       "from": 0,
       "to": 1,
       "label": "IKE_AUTH request",
       "note": "encrypted: IDi, AUTH, SAi2, TSi, TSr"
      },
      {
       "from": 1,
       "to": 0,
       "label": "IKE_AUTH response",
       "note": "IDr, AUTH, SAr2: first child SA up",
       "reply": true
      },
      {
       "from": 0,
       "to": 1,
       "label": "CREATE_CHILD_SA request",
       "note": "rekey, new KE for PFS"
      },
      {
       "from": 1,
       "to": 0,
       "label": "CREATE_CHILD_SA response",
       "reply": true
      },
      {
       "from": 0,
       "to": 1,
       "label": "INFORMATIONAL request",
       "note": "liveness (dead peer detection)"
      },
      {
       "from": 1,
       "to": 0,
       "label": "INFORMATIONAL response",
       "reply": true
      }
     ],
     "caption": "Only two round trips are needed before user traffic is protected. A 'no proposal chosen' failure happens in message 2, while a wrong key or certificate fails in message 4, so the failing exchange tells you where to look."
    },
    {
     "type": "compare",
     "title": "Policy-based or route-based?",
     "columns": [
      {
       "title": "Policy-based (crypto ACL)",
       "items": [
        "Interesting traffic defined by an ACL",
        "Each subnet pair can become its own SA",
        "No interface, so dynamic routing is awkward",
        "Mismatched ACLs between peers are a classic failure"
       ]
      },
      {
       "title": "Route-based (VTI)",
       "items": [
        "A tunnel interface with an IP address",
        "Routing (static, OSPF, BGP) decides what is protected",
        "One SA pair per tunnel, any traffic",
        "Interface counters, QoS and monitoring just work"
       ]
      }
     ]
    },
    {
     "type": "cli",
     "device": "HQ-R1 · IOS-style CLI",
     "lines": [
      "crypto ikev2 proposal PROP-GCM",
      " encryption aes-gcm-256",
      " prf sha384",
      " group 20",
      "crypto ikev2 policy POL-1",
      " proposal PROP-GCM",
      "crypto ikev2 keyring KR-BR7",
      " peer BR7",
      "  address 198.51.100.7",
      "  pre-shared-key <from-secrets-vault>",
      "crypto ikev2 profile PROF-BR7",
      " match identity remote address 198.51.100.7 255.255.255.255",
      " authentication remote pre-share",
      " authentication local pre-share",
      " keyring local KR-BR7",
      "crypto ipsec transform-set TS-GCM esp-gcm 256",
      "crypto ipsec profile IPSEC-BR7",
      " set transform-set TS-GCM",
      " set ikev2-profile PROF-BR7"
     ],
     "title": "IKEv2 and IPsec profile",
     "note": "AES-GCM is an AEAD cipher, so the proposal needs a PRF but no separate integrity algorithm. Group 20 is 384-bit ECP."
    },
    {
     "type": "callout",
     "kind": "pro",
     "title": "Plan for post-quantum key exchange",
     "text": "Traffic recorded today could be decrypted later by a large quantum computer, so long-lived confidential data deserves attention now. IKEv2 can combine several key exchanges in one negotiation (RFC 9370), letting a post-quantum algorithm such as ML-KEM (FIPS 203) run alongside classical ECDH. Platform support is still arriving: inventory your tunnels, prefer AES-256 and strong groups today, and check vendor roadmaps before committing dates."
    },
    {
     "type": "cli",
     "device": "HQ-R1 · IOS-style CLI",
     "lines": [
      "interface Tunnel7",
      " ip address 172.31.7.1 255.255.255.252",
      " ip mtu 1400",
      " ip tcp adjust-mss 1360",
      " tunnel source GigabitEthernet0/0",
      " tunnel mode ipsec ipv4",
      " tunnel destination 198.51.100.7",
      " tunnel protection ipsec profile IPSEC-BR7",
      "!",
      "HQ-R1# show crypto ipsec sa interface Tunnel7 | include pkts",
      "    #pkts encaps: 15204, #pkts encrypt: 15204, #pkts digest: 15204",
      "    #pkts decaps: 0, #pkts decrypt: 0, #pkts verify: 0"
     ],
     "title": "Static VTI and a one-way traffic symptom",
     "note": "Encaps rising while decaps stays at zero means our packets leave protected but nothing comes back: check the peer's routing back into its tunnel, its firewall or NAT, not the crypto settings."
    },
    {
     "type": "table",
     "head": [
      "Symptom",
      "Likely cause",
      "First check"
     ],
     "rows": [
      [
       "IKE_SA_INIT fails, 'no proposal chosen'",
       "Algorithm or DH group mismatch",
       "Compare proposals on both peers"
      ],
      [
       "IKE_AUTH fails",
       "Wrong PSK, identity mismatch, expired or untrusted certificate",
       "Peer identity type and certificate chain"
      ],
      [
       "Child SA up, encaps only",
       "Return routing, ACL or NAT on the far side",
       "Peer's route back via its tunnel"
      ],
      [
       "Small packets pass, large fail",
       "MTU and fragmentation",
       "Tunnel ip mtu and MSS clamp"
      ],
      [
       "Tunnel drops behind NAT after idle",
       "NAT mapping expires",
       "NAT keepalives and DPD settings"
      ]
     ],
     "title": "Reading an IPsec failure by phase"
    },
    {
     "type": "text",
     "text": "A **dynamic multipoint VPN** scales the same idea to hundreds of sites. Every spoke has one multipoint GRE (mGRE) tunnel interface protected by IPsec. Spokes register their public (NBMA) address with the hub using the **Next Hop Resolution Protocol (NHRP)**. Traffic between spokes can start through the hub, and NHRP then lets the spokes discover each other's public addresses and build a direct tunnel on demand."
    },
    {
     "type": "sequence",
     "title": "On-demand spoke-to-spoke tunnel",
     "actors": [
      "Spoke A",
      "Hub",
      "Spoke B"
     ],
     "steps": [
      {
       "from": 0,
       "to": 1,
       "label": "NHRP registration",
       "note": "tunnel IP to NBMA address"
      },
      {
       "from": 2,
       "to": 1,
       "label": "NHRP registration"
      },
      {
       "from": 0,
       "to": 1,
       "label": "Data for B's subnet",
       "note": "follows the hub's summary route"
      },
      {
       "from": 1,
       "to": 2,
       "label": "Data forwarded to B"
      },
      {
       "from": 1,
       "to": 0,
       "label": "NHRP redirect",
       "reply": true,
       "note": "a better path exists"
      },
      {
       "from": 0,
       "to": 1,
       "label": "Resolution request for B"
      },
      {
       "from": 1,
       "to": 2,
       "label": "Request forwarded to B"
      },
      {
       "from": 2,
       "to": 0,
       "label": "Resolution reply with B's NBMA address",
       "note": "after B builds its side",
       "reply": true
      },
      {
       "from": 0,
       "to": 2,
       "label": "IKEv2 and IPsec SA, then direct data",
       "note": "shortcut route installed"
      }
     ],
     "caption": "The first packets always take the hub path, so users see no delay; the direct tunnel is built in the background and ages out when idle. Without redirect on the hub and shortcut on the spokes, traffic stays on the hub path forever."
    },
    {
     "type": "cli",
     "device": "Hub and spoke · IOS-style CLI",
     "lines": [
      "! Hub",
      "interface Tunnel100",
      " ip address 10.100.0.1 255.255.255.0",
      " ip nhrp network-id 100",
      " ip nhrp map multicast dynamic",
      " ip nhrp redirect",
      " tunnel source GigabitEthernet0/0",
      " tunnel mode gre multipoint",
      " tunnel protection ipsec profile DMVPN-PROF",
      "! Spoke",
      "interface Tunnel100",
      " ip address 10.100.0.21 255.255.255.0",
      " ip nhrp network-id 100",
      " ip nhrp nhs 10.100.0.1 nbma 203.0.113.10 multicast",
      " ip nhrp shortcut",
      " tunnel source GigabitEthernet0/0",
      " tunnel mode gre multipoint",
      " tunnel protection ipsec profile DMVPN-PROF"
     ],
     "title": "Minimal multipoint tunnel with NHRP redirect and shortcut",
     "note": "With redirect and shortcut, the hub can advertise only a summary to spokes; specific shortcut routes are created when traffic needs them."
    },
    {
     "type": "callout",
     "kind": "pro",
     "text": "Run two hubs on separate transports for resilience, summarise from the hubs, and choose a routing protocol that scales to the spoke count (BGP with route reflection on the hubs is common). Plan the IPsec SA count for the busiest spoke-to-spoke patterns, not the average.",
     "title": "Design notes for hub-and-spoke VPNs"
    },
    {
     "type": "scenario",
     "title": "Branch tunnel up, but one-way traffic",
     "situation": "A new branch VTI shows an established IKEv2 SA. On HQ, `#pkts encaps` increases steadily but `#pkts decaps` stays at zero. Branch users report no reply from HQ servers. What is the best next step?",
     "options": [
      {
       "text": "Change the IKEv2 proposal to a different Diffie-Hellman group on both of the peers.",
       "feedback": "The SA is up, so proposals already match. Changing them only adds risk.",
       "best": false
      },
      {
       "text": "Check that the branch routes return traffic for HQ subnets into its own tunnel interface.",
       "feedback": "Correct. Crypto negotiation already succeeded; zero decaps means nothing protected is coming back, which is usually a routing, NAT or ACL issue on the far side.",
       "best": true
      },
      {
       "text": "Lower the tunnel IP MTU to 1300 bytes on both routers in case large packets are dropped.",
       "feedback": "MTU problems affect large packets, not every packet. Zero decaps points elsewhere.",
       "best": false
      },
      {
       "text": "Replace the pre-shared key with a certificate in case peer authentication is failing silently.",
       "feedback": "Authentication succeeded; the SA would not exist otherwise.",
       "best": false
      }
     ]
    },
    {
     "type": "terms",
     "items": [
      {
       "term": "IKEv2",
       "def": "The key-exchange protocol that authenticates IPsec peers and negotiates SAs in a small, fixed set of exchanges."
      },
      {
       "term": "Virtual tunnel interface (VTI)",
       "def": "A routable tunnel interface whose traffic is protected by IPsec, making encryption route-based."
      },
      {
       "term": "NHRP",
       "def": "Next Hop Resolution Protocol: maps tunnel addresses to public (NBMA) addresses so multipoint tunnels can find peers dynamically."
      }
     ]
    },
    {
     "type": "keypoints",
     "title": "Key takeaways",
     "items": [
      "Build IPsec route-based with VTIs so routing, counters and QoS work normally.",
      "IKE_SA_INIT agrees algorithms and DH; IKE_AUTH proves identity and creates the first child SA.",
      "Encaps rising with zero decaps means the far side is not sending protected traffic back.",
      "Hub-and-spoke VPNs use NHRP registration, redirect and shortcut to build spoke-to-spoke tunnels on demand.",
      "Use AEAD ciphers, strong DH groups and managed keys, and start planning post-quantum key exchange."
     ]
    },
    {
     "type": "quiz",
     "items": [
      {
       "q": "Which IKEv2 exchange authenticates the peers and creates the first child SA?",
       "options": [
        "IKE_AUTH",
        "IKE_SA_INIT",
        "CREATE_CHILD_SA",
        "INFORMATIONAL"
       ],
       "answer": 0,
       "explain": "IKE_SA_INIT negotiates algorithms and DH; IKE_AUTH proves identities and installs the first child SA."
      },
      {
       "q": "Why does an AES-GCM IKEv2 proposal not include a separate integrity algorithm?",
       "options": [
        "AES-GCM disables integrity checking to reduce CPU load on the router",
        "Integrity checking is negotiated later in the IKE_AUTH exchange instead",
        "AES-GCM is an AEAD cipher: it encrypts and authenticates together",
        "GCM relies on the Diffie-Hellman group for integrity of each packet"
       ],
       "answer": 2,
       "explain": "AEAD ciphers authenticate the data they encrypt, so only a PRF is configured for key derivation."
      },
      {
       "q": "What is the main operational advantage of route-based IPsec over policy-based IPsec?",
       "options": [
        "It removes the need to authenticate the two IPsec peers to each other",
        "It encrypts traffic faster because it uses a different cipher family",
        "It avoids the use of IKE for key exchange between the two peers",
        "Routing, interface counters and QoS work naturally on the tunnel"
       ],
       "answer": 3,
       "explain": "A VTI behaves like any interface, so dynamic routing and monitoring are straightforward."
      },
      {
       "q": "In a dynamic multipoint VPN, what does a spoke learn through NHRP resolution?",
       "options": [
        "The public (NBMA) address behind another spoke's tunnel address",
        "The pre-shared key that protects the hub's multipoint tunnel interface",
        "The routing table of the hub, used to replace its own IGP routes",
        "The MTU of the transport path between the hub and every spoke"
       ],
       "answer": 0,
       "explain": "NHRP maps overlay addresses to underlay addresses so spokes can build direct tunnels."
      },
      {
       "q": "An IPsec tunnel behind a home-office NAT drops after a few idle minutes and recovers when traffic restarts. What should you tune first?",
       "options": [
        "The IKEv2 encryption algorithm and Diffie-Hellman group on both peers",
        "The tunnel IP MTU and TCP MSS values on both of the tunnel interfaces",
        "NAT keepalives and dead peer detection to hold the NAT entry open",
        "The route distinguisher configured on the branch VRF for the tunnel"
       ],
       "answer": 2,
       "explain": "Idle NAT entries expire; periodic keepalives keep the UDP 4500 mapping open."
      }
     ]
    }
   ]
  },
  {
   "id": "m5-l4",
   "title": "VXLAN with an EVPN Control Plane",
   "subtitle": "Layer 2 and Layer 3 segments over a routed fabric, learned through BGP",
   "minutes": 40,
   "objectives": [
    "Describe VXLAN encapsulation, VNIs and the MTU impact on the underlay.",
    "Explain how BGP EVPN route types distribute MAC, IP and tenant prefix information.",
    "Read and verify a basic leaf configuration with an L2VNI and an L3VNI."
   ],
   "blocks": [
    {
     "type": "text",
     "text": "Module 1 built a routed spine-leaf fabric. Applications still sometimes need the same Layer 2 segment on many racks, and tenants need isolation beyond 4,094 VLANs. **VXLAN** (RFC 7348) solves the data-plane part by tunnelling Ethernet frames in UDP between **VTEPs** on the leaves. **BGP EVPN** solves the control-plane part: instead of flooding to learn where hosts live, leaves advertise MAC and IP reachability to each other through BGP."
    },
    {
     "type": "packet",
     "title": "VXLAN encapsulation: outer UDP and VXLAN headers",
     "fields": [
      {
       "label": "UDP source port (hash of inner flow)",
       "bits": 16
      },
      {
       "label": "UDP destination port = 4789",
       "bits": 16
      },
      {
       "label": "UDP length",
       "bits": 16
      },
      {
       "label": "UDP checksum (usually 0)",
       "bits": 16
      },
      {
       "label": "Flags (I bit = 1)",
       "bits": 8
      },
      {
       "label": "Reserved",
       "bits": 24
      },
      {
       "label": "VXLAN Network Identifier (VNI)",
       "bits": 24
      },
      {
       "label": "Reserved",
       "bits": 8
      },
      {
       "label": "Original Ethernet frame: inner MACs, payload",
       "bits": 32,
       "variable": true
      }
     ],
     "caption": "These 16 bytes follow a 14-byte outer Ethernet header and a 20-byte outer IPv4 header whose source is the local VTEP loopback and whose destination is the remote VTEP (or a multicast group). Together that is the 50 bytes of overhead; the 24-bit VNI gives over 16 million segments."
    },
    {
     "type": "formula",
     "title": "VXLAN numbers to remember",
     "items": [
      {
       "name": "Segment space",
       "expr": "2^24 = 16,777,216 VNIs",
       "meaning": "Versus 4,094 usable VLAN IDs; VNIs are global identifiers across the fabric."
      },
      {
       "name": "Overhead",
       "expr": "14 + 20 + 8 + 8 = 50 bytes (54 with an outer 802.1Q tag)",
       "meaning": "Added to every inner frame on the underlay."
      },
      {
       "name": "Underlay MTU",
       "expr": "Inner MTU + 50 ≥ 1550; jumbo (9,000+) is the norm",
       "meaning": "Without it, full-size host frames are dropped silently inside the fabric."
      }
     ]
    },
    {
     "type": "compare",
     "title": "Flood-and-learn or EVPN?",
     "columns": [
      {
       "title": "Flood-and-learn VXLAN",
       "items": [
        "BUM traffic flooded via underlay multicast or head-end lists",
        "Remote MACs learned from data traffic",
        "No knowledge of host IPs, so ARP is flooded",
        "Simple, but noisy and slow to converge on moves"
       ]
      },
      {
       "title": "BGP EVPN control plane",
       "items": [
        "MAC and IP learned locally and advertised in BGP",
        "Remote VTEPs discovered automatically",
        "ARP suppression answers locally from EVPN data",
        "Supports multi-tenancy, mobility and multihoming"
       ]
      }
     ]
    },
    {
     "type": "table",
     "head": [
      "Type",
      "Name",
      "Carries",
      "Used for"
     ],
     "rows": [
      [
       "1",
       "Ethernet auto-discovery",
       "Ethernet segment reachability",
       "Multihoming fast convergence and aliasing"
      ],
      [
       "2",
       "MAC/IP advertisement",
       "Host MAC, optional IP, VNI(s)",
       "Host reachability, ARP suppression, mobility"
      ],
      [
       "3",
       "Inclusive multicast Ethernet tag",
       "VTEP interest in a VNI",
       "Building BUM replication lists"
      ],
      [
       "4",
       "Ethernet segment",
       "ES identifier",
       "Designated forwarder election"
      ],
      [
       "5",
       "IP prefix",
       "IPv4/IPv6 prefix in a tenant VRF",
       "External and subnet routes per tenant"
      ]
     ],
     "title": "EVPN route types you will meet"
    },
    {
     "type": "sequence",
     "title": "How a host becomes reachable fabric-wide",
     "actors": [
      "Server A",
      "Leaf-3",
      "Spine (RR)",
      "Leaf-5"
     ],
     "steps": [
      {
       "from": 0,
       "to": 1,
       "label": "First frame or ARP",
       "note": "MAC and IP on VLAN 10"
      },
      {
       "from": 1,
       "to": 1,
       "label": "Learn locally, map to VNI 10010"
      },
      {
       "from": 1,
       "to": 2,
       "label": "EVPN Type 2 route",
       "note": "MAC, IP, VNI 10010, RT; next hop Leaf-3"
      },
      {
       "from": 2,
       "to": 3,
       "label": "Type 2 route reflected"
      },
      {
       "from": 3,
       "to": 3,
       "label": "RT matches import: install",
       "note": "ARP now answered locally"
      },
      {
       "from": 3,
       "to": 1,
       "label": "VXLAN traffic to Leaf-3 VTEP",
       "note": "unicast, no flooding"
      }
     ],
     "caption": "Reachability is learned through BGP before any data needs to flow, so remote leaves never flood to find Server A. If the route arrives but is not installed, the route-target import policy is the first suspect."
    },
    {
     "type": "text",
     "text": "For routing between subnets, leaves use a **distributed anycast gateway**: the same gateway IP and MAC exist on every leaf, so a host always routes at its first hop, even after it moves. With **symmetric IRB**, the ingress leaf routes into a per-tenant **L3VNI**, and the egress leaf routes again into the destination subnet. Each leaf only needs the VNIs of locally attached subnets, which keeps state and configuration small."
    },
    {
     "type": "cli",
     "device": "Leaf-3 · data-centre CLI (illustrative)",
     "lines": [
      "nv overlay evpn",
      "vlan 10",
      "  vn-segment 10010",
      "interface nve1",
      "  no shutdown",
      "  host-reachability protocol bgp",
      "  source-interface loopback1",
      "  member vni 10010",
      "    ingress-replication protocol bgp",
      "  member vni 50001 associate-vrf",
      "router bgp 65001",
      "  neighbor 10.0.0.1",
      "    remote-as 65001",
      "    update-source loopback0",
      "    address-family l2vpn evpn",
      "      send-community extended",
      "evpn",
      "  vni 10010 l2",
      "    rd auto",
      "    route-target both auto"
     ],
     "title": "One L2VNI, one L3VNI, iBGP EVPN to a spine reflector",
     "note": "Ingress replication via BGP uses Type 3 routes instead of underlay multicast. Route targets must carry extended communities, so `send-community extended` is essential."
    },
    {
     "type": "callout",
     "kind": "warning",
     "text": "If the underlay MTU is 1500, pings with default size work and the fabric looks healthy, yet databases and backups stall. Always test with full-size, do-not-fragment pings between VTEP loopbacks and between hosts before go-live.",
     "title": "The silent MTU failure"
    },
    {
     "type": "keypoints",
     "items": [
      "Underlay: loopbacks reachable with ECMP; jumbo DF ping between VTEPs succeeds.",
      "BGP EVPN sessions to both spines established, prefixes received.",
      "Type 3 routes present for each local VNI, and remote VTEPs listed as peers.",
      "Type 2 routes appear for local hosts and are imported on remote leaves.",
      "Tenant VRF shows Type 5 or host routes; anycast gateway answers on every leaf."
     ],
     "title": "Verification sequence on a new leaf"
    },
    {
     "type": "scenario",
     "title": "Hosts in the same VNI cannot reach each other",
     "situation": "Two servers in VNI 10010 on different leaves cannot ping each other. Both leaves show the EVPN session up. Leaf-3 advertises a Type 2 route for its server, but Leaf-5 does not install it. What should you check first?",
     "options": [
      {
       "text": "Whether the underlay MTU on the spine switches is set to 9216 bytes on every single fabric link.",
       "feedback": "MTU problems allow small pings and break large ones; here even the control-plane route is not imported.",
       "best": false
      },
      {
       "text": "Whether spanning tree is blocking VLAN 10 on the spine uplinks of both of the leaf switches.",
       "feedback": "The fabric is routed; spanning tree does not run between leaves and spines.",
       "best": false
      },
      {
       "text": "Whether Leaf-3's exported route targets match Leaf-5's import route targets for VNI 10010.",
       "feedback": "Correct. A route that is received but not installed is almost always an import policy problem, and RTs are the import policy.",
       "best": true
      },
      {
       "text": "Whether the anycast gateway MAC address is identical on both leaves.",
       "feedback": "The gateway matters for routing between subnets; these hosts share a subnet.",
       "best": false
      }
     ]
    },
    {
     "type": "terms",
     "items": [
      {
       "term": "VTEP",
       "def": "VXLAN tunnel endpoint: the device (usually a leaf) that encapsulates and decapsulates VXLAN traffic."
      },
      {
       "term": "VNI",
       "def": "The 24-bit VXLAN Network Identifier that names a Layer 2 segment (L2VNI) or a tenant routing instance (L3VNI)."
      },
      {
       "term": "EVPN",
       "def": "A BGP address family that advertises MAC, IP and prefix reachability for Layer 2 and Layer 3 overlay services."
      },
      {
       "term": "Distributed anycast gateway",
       "def": "The same default-gateway IP and MAC configured on every leaf so hosts route at their first hop wherever they attach."
      }
     ]
    },
    {
     "type": "keypoints",
     "title": "Key takeaways",
     "items": [
      "VXLAN tunnels Ethernet in UDP port 4789 between VTEPs and adds 50 bytes, so the underlay needs jumbo MTU.",
      "BGP EVPN advertises MAC/IP (Type 2), VTEP interest (Type 3) and tenant prefixes (Type 5).",
      "Route targets decide which leaves import which routes; received but not installed means check RTs.",
      "A distributed anycast gateway and symmetric IRB let every leaf route at the first hop.",
      "Prove the fabric with full-size do-not-fragment pings between VTEPs before go-live."
     ]
    },
    {
     "type": "quiz",
     "items": [
      {
       "q": "How many bytes does VXLAN add to an untagged inner frame on an IPv4 underlay?",
       "options": [
        "24 bytes",
        "50 bytes",
        "36 bytes",
        "64 bytes"
       ],
       "answer": 1,
       "explain": "Outer Ethernet 14, outer IPv4 20, UDP 8 and VXLAN 8 make 50."
      },
      {
       "q": "Which EVPN route type advertises a host's MAC and IP address?",
       "options": [
        "Type 2",
        "Type 1",
        "Type 3",
        "Type 5"
       ],
       "answer": 0,
       "explain": "Type 2 is the MAC/IP advertisement route; Type 3 announces VTEP interest for BUM replication; Type 5 carries IP prefixes."
      },
      {
       "q": "Why do VTEPs vary the outer UDP source port?",
       "options": [
        "To identify the tenant VRF that the inner frame belongs to",
        "Hash entropy, so underlay ECMP spreads flows across the spines",
        "To signal the VNI to devices that cannot read the VXLAN header",
        "To prevent the underlay from fragmenting the outer packets"
       ],
       "answer": 1,
       "explain": "The source port is derived from a hash of inner headers, giving per-flow load sharing."
      },
      {
       "q": "What is the main benefit of ARP suppression in an EVPN fabric?",
       "options": [
        "ARP packets are encrypted so hosts cannot spoof the gateway address",
        "Hosts no longer need a default gateway configured to reach other subnets",
        "The underlay MTU requirement drops back to a standard 1,500 bytes",
        "Leaves answer ARP requests locally from EVPN data, reducing flooding"
       ],
       "answer": 3,
       "explain": "Because EVPN already knows IP-to-MAC bindings, the leaf can reply on the remote host's behalf."
      },
      {
       "q": "In symmetric IRB, what does the L3VNI carry?",
       "options": [
        "Broadcast and unknown-unicast traffic for every bridged segment",
        "BGP EVPN control-plane updates between leaves and spines",
        "Routed traffic between subnets for one tenant VRF",
        "Management traffic from the leaves to the controller"
       ],
       "answer": 2,
       "explain": "Ingress and egress leaves both route; the transit VNI between them is the tenant's L3VNI."
      }
     ]
    }
   ]
  },
  {
   "id": "m5-l5",
   "title": "SD-WAN Architecture and Policy",
   "subtitle": "Orchestrator, controllers and edges; application-aware routing across many transports",
   "minutes": 40,
   "objectives": [
    "Describe the planes of an SD-WAN solution and how an edge is onboarded.",
    "Design application-aware routing using measurable SLA classes.",
    "Choose between centralised and direct internet breakout and plan a phased rollout."
   ],
   "blocks": [
    {
     "type": "text",
     "text": "SD-WAN takes the overlay tools from this module (VRFs, IPsec, dynamic tunnels) and puts them under **central policy**. Instead of configuring each router, you describe intent once: which sites talk to which, which applications need which path quality, where internet traffic breaks out. Controllers distribute routes, keys and policy; edges measure every path continuously and steer each application to a path that meets its SLA."
    },
    {
     "type": "layers",
     "title": "SD-WAN planes",
     "items": [
      {
       "label": "Orchestration and management",
       "parts": [
        "Zero-touch provisioning",
        "Templates and device groups",
        "Dashboards, APIs and audit"
       ]
      },
      {
       "label": "Control",
       "parts": [
        "Controllers distribute overlay routes, keys and policy",
        "Edges never need full-mesh routing sessions"
       ]
      },
      {
       "label": "Data",
       "parts": [
        "Edge routers build IPsec tunnels over every transport",
        "Per-tunnel probes measure loss, latency and jitter"
       ]
      },
      {
       "label": "Transport",
       "parts": [
        "MPLS",
        "Broadband internet",
        "4G/5G",
        "Satellite"
       ]
      }
     ]
    },
    {
     "type": "topology",
     "title": "SD-WAN with dual hubs and cloud security",
     "nodes": [
      {
       "id": "orc",
       "kind": "controller",
       "label": "Orchestrator",
       "x": 0.5,
       "y": 0,
       "sub": "onboarding, templates"
      },
      {
       "id": "ctl",
       "kind": "controller",
       "label": "Controllers",
       "x": 2,
       "y": 0,
       "sub": "routes, keys, policy"
      },
      {
       "id": "sse",
       "kind": "cloud",
       "label": "SSE cloud",
       "x": 5.5,
       "y": 0,
       "sub": "SWG, CASB, ZTNA, FWaaS"
      },
      {
       "id": "mpls",
       "kind": "cloud",
       "label": "MPLS",
       "x": 2,
       "y": 1.5
      },
      {
       "id": "inet",
       "kind": "internet",
       "label": "Internet",
       "x": 4.5,
       "y": 1.5
      },
      {
       "id": "h1",
       "kind": "router",
       "label": "DC hub 1",
       "x": 0.5,
       "y": 3,
       "sub": "tax systems VRF"
      },
      {
       "id": "h2",
       "kind": "router",
       "label": "DC hub 2",
       "x": 2,
       "y": 3
      },
      {
       "id": "b1",
       "kind": "router",
       "label": "Branch edge",
       "x": 4.5,
       "y": 3,
       "sub": "MPLS + broadband"
      },
      {
       "id": "b2",
       "kind": "router",
       "label": "Branch edge",
       "x": 6.5,
       "y": 3,
       "sub": "broadband + 5G"
      }
     ],
     "links": [
      {
       "a": "ctl",
       "b": "orc",
       "label": "control",
       "style": "dashed"
      },
      {
       "a": "h1",
       "b": "mpls"
      },
      {
       "a": "h2",
       "b": "mpls"
      },
      {
       "a": "b1",
       "b": "mpls"
      },
      {
       "a": "h2",
       "b": "inet"
      },
      {
       "a": "b1",
       "b": "inet"
      },
      {
       "a": "b2",
       "b": "inet"
      },
      {
       "a": "inet",
       "b": "sse",
       "label": "DIA, inspected"
      },
      {
       "a": "b1",
       "b": "b2",
       "label": "IPsec overlay",
       "style": "tunnel"
      }
     ],
     "caption": "Every edge builds IPsec tunnels over every transport it has and measures each one. Controllers and the orchestrator steer policy but are not in the data path, and approved SaaS traffic breaks out locally through the SSE cloud instead of hairpinning to the hubs."
    },
    {
     "type": "flow",
     "title": "Zero-touch onboarding of an edge",
     "items": [
      {
       "label": "Power on",
       "text": "Edge gets an address on any transport and contacts the provisioning service."
      },
      {
       "label": "Authenticate",
       "text": "Serial number and device certificate are checked against the allowed list."
      },
      {
       "label": "Receive identity",
       "text": "Edge learns its controllers, site ID and configuration template."
      },
      {
       "label": "Control up",
       "text": "Secure control connections to controllers are established."
      },
      {
       "label": "Data up",
       "text": "IPsec tunnels form to permitted peers; policy and telemetry begin."
      }
     ]
    },
    {
     "type": "framework",
     "title": "Policy types in a typical SD-WAN",
     "items": [
      {
       "label": "TOP",
       "title": "Topology policy",
       "text": "Who builds tunnels to whom: full mesh, hub-and-spoke, regional mesh, per VRF."
      },
      {
       "label": "AAR",
       "title": "Application-aware routing",
       "text": "Maps applications to SLA classes and preferred transports; moves flows when a path breaches its SLA."
      },
      {
       "label": "DATA",
       "title": "Traffic policy",
       "text": "Per-application actions such as local breakout, service chaining or forward error correction."
      },
      {
       "label": "QOS",
       "title": "QoS policy",
       "text": "Queuing, shaping per transport and marking, consistent with the campus QoS model."
      },
      {
       "label": "SEC",
       "title": "Security policy",
       "text": "Segmentation per VRF, edge firewalling and redirection to SSE cloud security (secure web gateway, CASB, ZTNA, firewall as a service). Combined with SD-WAN under one policy this is called SASE."
      },
      {
       "label": "LOC",
       "title": "Local policy",
       "text": "Device-specific items such as interface ACLs or transport preferences."
      }
     ]
    },
    {
     "type": "table",
     "head": [
      "Class",
      "Loss",
      "Latency (one-way)",
      "Jitter",
      "Preferred path"
     ],
     "rows": [
      [
       "Voice",
       "≤ 1%",
       "≤ 150 ms",
       "≤ 30 ms",
       "MPLS, then broadband"
      ],
      [
       "Interactive video",
       "≤ 1%",
       "≤ 150 ms",
       "≤ 30 ms",
       "MPLS or best broadband"
      ],
      [
       "Business-critical apps",
       "≤ 2%",
       "≤ 250 ms",
       "n/a",
       "Any compliant path"
      ],
      [
       "Bulk and backup",
       "≤ 5%",
       "n/a",
       "n/a",
       "Cheapest path, off-peak"
      ]
     ],
     "title": "Example SLA classes (tune to your applications)"
    },
    {
     "type": "formula",
     "title": "Path measurement basics",
     "items": [
      {
       "name": "Loss %",
       "expr": "(probes sent − probes received) ÷ probes sent × 100",
       "meaning": "Measured per tunnel over a sliding window, often several minutes."
      },
      {
       "name": "Jitter",
       "expr": "mean of |delay(n) − delay(n−1)|",
       "meaning": "Variation in delay between consecutive probes; drives voice quality."
      },
      {
       "name": "SLA compliance",
       "expr": "loss ≤ L AND latency ≤ D AND jitter ≤ J",
       "meaning": "A path is eligible for a class only when all thresholds are met; hysteresis prevents flapping."
      }
     ]
    },
    {
     "type": "compare",
     "title": "Where should internet traffic leave?",
     "columns": [
      {
       "title": "Centralised breakout",
       "items": [
        "Branch internet hairpins to a data centre or hub",
        "One security stack to manage",
        "Adds latency to SaaS and cloud apps",
        "Consumes expensive WAN bandwidth"
       ]
      },
      {
       "title": "Direct internet access (DIA)",
       "items": [
        "Trusted SaaS breaks out locally at the branch",
        "Security delivered by edge firewall or cloud security service",
        "Lower latency, less hub load",
        "Requires consistent security policy at every site"
       ]
      }
     ]
    },
    {
     "type": "cli",
     "device": "Orchestrator · policy export (illustrative YAML)",
     "lines": [
      "app_route_policy: VOICE-FIRST",
      "  vpn: CORP",
      "  sequences:",
      "    - match: { app_list: VOICE-APPS }",
      "      sla_class: VOICE",
      "      preferred: [mpls, internet]",
      "      fallback: best-path",
      "    - match: { app_list: SAAS-TRUSTED }",
      "      action: local-internet-breakout",
      "sla_classes:",
      "  VOICE: { loss_pct: 1, latency_ms: 150, jitter_ms: 30 }"
     ],
     "title": "Intent expressed as data",
     "note": "Field names differ between platforms; the shape (match, SLA class, preference, fallback) is common to most."
    },
    {
     "type": "callout",
     "kind": "insight",
     "text": "If edges lose contact with the controllers, existing tunnels and policies normally keep forwarding for a grace period. Design controller redundancy for change and convergence, but do not confuse a controller outage with a WAN outage.",
     "title": "Controllers are not in the data path"
    },
    {
     "type": "case",
     "title": "A ministry's 140-site SD-WAN rollout",
     "context": "A national ministry runs 140 offices on a single MPLS service with central internet breakout. Video calls to cloud collaboration tools are poor, MPLS contracts are expensive, and three regional offices already have fibre broadband. Leadership wants SD-WAN within a year without disrupting tax-collection systems that run on a central data centre.",
     "questions": [
      "How would you phase the rollout?",
      "Which applications would you allow to break out locally, and how would you secure them?",
      "How would you protect the tax-collection systems during migration?",
      "What would you measure to prove success?"
     ],
     "answer": "Start with a design and pilot phase: two hub edges in the data centre, controllers in redundant locations, and a pilot of three to five sites with both MPLS and broadband. Keep separate VRFs for tax systems, general corporate traffic and guest access from day one. Allow DIA only for an approved SaaS list (collaboration and productivity suites), secured by a cloud security service or edge firewall with consistent policy; everything else continues to the data centre. Tax-collection traffic stays in its own VRF, pinned to MPLS with broadband as SLA-checked fallback, and sites migrate in waves with a rollback plan and a frozen change window around tax deadlines. Success measures: SLA compliance per class, MOS or call-quality scores for collaboration, mean time to provision a new site, WAN cost per site and zero incidents on tax systems."
    },
    {
     "type": "chart",
     "kind": "line",
     "title": "Afternoon packet loss per transport against the VOICE SLA",
     "labels": [
      "12:00",
      "13:00",
      "14:00",
      "14:20",
      "14:40",
      "15:00",
      "16:00"
     ],
     "series": [
      {
       "name": "Broadband",
       "values": [
        0.2,
        0.3,
        4.0,
        4.2,
        3.8,
        0.4,
        0.3
       ]
      },
      {
       "name": "MPLS",
       "values": [
        0.1,
        0.1,
        0.1,
        0.1,
        0.1,
        0.1,
        0.1
       ]
      },
      {
       "name": "VOICE limit",
       "values": [
        1,
        1,
        1,
        1,
        1,
        1,
        1
       ]
      }
     ],
     "unit": "%",
     "yLabel": "Loss",
     "caption": "Illustrative data matching the scenario below: broadband breaches the 1% voice limit for about an hour while MPLS stays clean. A policy that prefers broadband statically, without acting on the breach, keeps calls on the bad path."
    },
    {
     "type": "scenario",
     "title": "Voice still poor during broadband brownouts",
     "situation": "Branch voice calls break up every afternoon. Telemetry shows broadband loss rising to 4% for 20-minute periods while MPLS stays clean. The app-aware policy maps voice to the VOICE class with broadband preferred because it has more bandwidth. Calls are not moving. What is the most likely problem?",
     "options": [
      {
       "text": "Order more bandwidth on the broadband circuit so that voice has more room during the afternoon.",
       "feedback": "Loss during brownouts is a quality issue, not capacity; more bandwidth from the same provider may not help.",
       "best": false
      },
      {
       "text": "Make MPLS preferred for voice, or make the policy move flows when the VOICE SLA is breached.",
       "feedback": "Correct. Voice needs a compliant path more than bandwidth, and the policy must act on SLA breaches rather than a static preference.",
       "best": true
      },
      {
       "text": "Scale up the SD-WAN controllers, which are overloaded and too slow to steer the voice flows.",
       "feedback": "Path steering happens on the edges using local measurements; the controllers are not in the forwarding path.",
       "best": false
      },
      {
       "text": "Remove voice from the overlay and send it directly to the internet from each branch office.",
       "feedback": "That removes measurement and steering entirely and usually makes call quality worse.",
       "best": false
      }
     ]
    },
    {
     "type": "checklist",
     "title": "Overlay go-live checklist",
     "items": [
      "VRF names, RDs and route targets match the agreed plan on every device.",
      "Inter-VRF leaking happens only at the documented policy point.",
      "Tunnel endpoints are resolved via the transport (or a front-door VRF), never via the overlay.",
      "Tunnel IP MTU and TCP MSS are set and tested with full-size DF pings.",
      "IKEv2 proposals use AEAD ciphers and strong DH groups; keys or certificates come from a managed store.",
      "VXLAN underlay MTU is jumbo end to end; EVPN sessions and route imports are verified.",
      "SD-WAN SLA classes, preferred paths and fallback behaviour are tested by injecting loss and delay.",
      "Rollback steps and a monitoring dashboard exist before the first site migrates."
     ]
    },
    {
     "type": "reflection",
     "prompt": "Think about the WAN you know best. Which three applications would you put into explicit SLA classes first, and what evidence would you collect before choosing their thresholds?"
    },
    {
     "type": "terms",
     "items": [
      {
       "term": "Orchestrator",
       "def": "The SD-WAN component that onboards edges, assigns identity and distributes the list of controllers."
      },
      {
       "term": "Application-aware routing",
       "def": "Steering each application to a transport path whose measured loss, latency and jitter meet the application's SLA class."
      },
      {
       "term": "SASE",
       "def": "Secure access service edge: WAN connectivity (SD-WAN) and network security delivered together as a cloud service with one identity-based policy."
      },
      {
       "term": "SSE",
       "def": "Security service edge: the security half of SASE, combining secure web gateway, CASB, zero-trust network access and firewall as a service."
      }
     ]
    },
    {
     "type": "keypoints",
     "title": "Key takeaways",
     "items": [
      "SD-WAN separates orchestration, control and data planes; controllers are not in the forwarding path.",
      "Application-aware routing steers each app to a path that meets every threshold of its SLA class.",
      "Direct internet access works safely only with consistent SSE or edge security at every site.",
      "Use hysteresis and SLA-driven fallback rather than static path preference.",
      "Roll out in waves with a pilot, per-VRF protection of critical systems and a rollback plan."
     ]
    },
    {
     "type": "quiz",
     "items": [
      {
       "q": "In an SD-WAN, which component typically validates a new edge and tells it which controllers to use?",
       "options": [
        "The orchestrator or provisioning service",
        "The nearest branch edge router acting as a hub",
        "The MPLS provider's provider-edge router",
        "The cloud security service used for internet breakout"
       ],
       "answer": 0,
       "explain": "Onboarding and identity are orchestration functions; controllers then distribute routes and policy."
      },
      {
       "q": "A voice SLA class requires loss ≤ 1%, latency ≤ 150 ms and jitter ≤ 30 ms. A path measures 0.4% loss, 90 ms latency and 45 ms jitter. Is it eligible?",
       "options": [
        "Yes, because two out of three thresholds are met",
        "Yes, because latency is well under the limit",
        "No, because latency is too close to the threshold",
        "No, because jitter exceeds the threshold"
       ],
       "answer": 3,
       "explain": "All thresholds must be met; one breach makes the path non-compliant."
      },
      {
       "q": "What happens to forwarding in most SD-WAN designs if all controllers become unreachable?",
       "options": [
        "All tunnels drop immediately and the branch falls back to static routes",
        "Edges switch to flooding traffic over every transport until recovery",
        "Existing tunnels keep forwarding on the last policy for a while",
        "Traffic is sent to the orchestrator for forwarding instead of the edges"
       ],
       "answer": 2,
       "explain": "The data plane is on the edges; controllers are needed for changes and new state."
      },
      {
       "q": "Which is the strongest reason to adopt direct internet access at branches?",
       "options": [
        "It removes the need for any security inspection of internet-bound traffic",
        "Lower SaaS latency and less backhaul, with consistent security enforced",
        "It allows every application to bypass the SD-WAN policy completely",
        "It makes the MPLS transport unnecessary for all internal applications"
       ],
       "answer": 1,
       "explain": "DIA improves SaaS experience but only works safely with consistent, centrally managed security."
      },
      {
       "q": "Why do SD-WAN policies apply hysteresis to path switching?",
       "options": [
        "To encrypt the probes that measure loss, latency and jitter on each overlay tunnel",
        "To stop flows bouncing between paths when measurements hover near a limit",
        "To make sure the controllers approve every individual path change first",
        "To delay onboarding of new edges until all transports are stable"
       ],
       "answer": 1,
       "explain": "Hysteresis requires sustained improvement before switching back, preventing oscillation."
      }
     ]
    }
   ]
  }
 ]
});
TRACK.modules.push({
 "id": "m6",
 "order": 6,
 "code": "Wireless",
 "title": "Wireless — Enterprise Wireless",
 "subtitle": "Design, secure and operate WLANs that carry voice, video and critical devices.",
 "outcomes": [
  "Design WLAN coverage and capacity using RF arithmetic, surveys and channel and power plans.",
  "Choose a WLAN architecture and enable fast, reliable roaming with 802.11k, v and r.",
  "Secure enterprise and guest wireless with WPA3, certificate-based EAP and OWE.",
  "Map voice and video QoS over Wi-Fi and validate it with real clients.",
  "Evaluate location services, analytics and Wi-Fi 7 features for business value."
 ],
 "lessons": [
  {
   "id": "m6-l1",
   "title": "RF Design, Site Surveys and Channel Planning",
   "subtitle": "Designing coverage and capacity you can prove, band by band",
   "minutes": 40,
   "objectives": [
    "Apply decibel arithmetic, free-space path loss and SNR to WLAN design decisions.",
    "Choose survey types and design targets for data, voice and location use cases.",
    "Plan channels, widths and transmit power across 2.4, 5 and 6 GHz."
   ],
   "blocks": [
    {
     "type": "text",
     "text": "Wireless is the Fabric stage where the physical medium is shared, invisible and constantly changing. Good enterprise WLANs are designed like any other network: requirements first, then a design with measurable targets, then validation. This lesson gives you the RF arithmetic and the survey discipline that every later wireless decision rests on."
    },
    {
     "type": "formula",
     "title": "RF arithmetic you will use every day",
     "items": [
      {
       "name": "Decibel rules",
       "expr": "+3 dB ≈ double power, +10 dB = ten times power; −3 dB ≈ half",
       "meaning": "Gains and losses in dB simply add and subtract."
      },
      {
       "name": "EIRP",
       "expr": "Tx power (dBm) + antenna gain (dBi) − cable/connector loss (dB)",
       "meaning": "What actually leaves the antenna; regulators limit EIRP, not just radio power."
      },
      {
       "name": "Free-space path loss",
       "expr": "FSPL (dB) = 20·log10(d km) + 20·log10(f MHz) + 32.44",
       "meaning": "At 20 m and 5,500 MHz this is about 73 dB; walls and bodies add more."
      },
      {
       "name": "SNR",
       "expr": "SNR (dB) = RSSI (dBm) − noise floor (dBm)",
       "meaning": "−65 dBm signal over a −92 dBm noise floor gives 27 dB SNR."
      }
     ]
    },
    {
     "type": "chart",
     "kind": "line",
     "title": "Free-space path loss by distance and band",
     "labels": [
      "5 m",
      "10 m",
      "20 m",
      "40 m"
     ],
     "series": [
      {
       "name": "2.4 GHz (ch 6)",
       "values": [
        54.2,
        60.2,
        66.2,
        72.2
       ]
      },
      {
       "name": "5 GHz (ch 100)",
       "values": [
        61.2,
        67.2,
        73.3,
        79.3
       ]
      },
      {
       "name": "6 GHz (ch 37)",
       "values": [
        62.2,
        68.2,
        74.2,
        80.2
       ]
      }
     ],
     "unit": " dB",
     "yLabel": "Path loss",
     "caption": "Calculated with the FSPL formula above, before any walls. Every doubling of distance adds about 6 dB, and 5 or 6 GHz loses roughly 7–8 dB more than 2.4 GHz over the same distance, which is why higher bands need denser AP placement."
    },
    {
     "type": "table",
     "head": [
      "Band",
      "Non-overlapping 20 MHz channels",
      "Strengths",
      "Watch-outs"
     ],
     "rows": [
      [
       "2.4 GHz",
       "3 in most regions (1, 6, 11)",
       "Range, legacy and IoT support",
       "Crowded, interference-prone, too few channels for density"
      ],
      [
       "5 GHz",
       "Up to about 25, depending on region and DFS use",
       "Capacity, mature client support",
       "DFS channels can be vacated when radar is detected"
      ],
      [
       "6 GHz",
       "Up to 59 where the full band is allowed; 24 where only the lower 500 MHz is",
       "Clean spectrum, wide channels, modern clients",
       "Requires WPA3 or OWE; shorter range through walls"
      ]
     ],
     "title": "The three enterprise bands"
    },
    {
     "type": "chart",
     "kind": "bar",
     "title": "Non-overlapping channels by width",
     "labels": [
      "20 MHz",
      "40 MHz",
      "80 MHz",
      "160 MHz",
      "320 MHz"
     ],
     "series": [
      {
       "name": "2.4 GHz",
       "values": [
        3,
        1,
        0,
        0,
        0
       ]
      },
      {
       "name": "5 GHz",
       "values": [
        25,
        12,
        6,
        2,
        0
       ]
      },
      {
       "name": "6 GHz",
       "values": [
        59,
        29,
        14,
        7,
        3
       ]
      }
     ],
     "caption": "Counts for a regulatory domain that allows the full 6 GHz band and all 5 GHz channels including DFS; many regions allow fewer. Doubling channel width halves the channels available for reuse, which is the core trade-off in dense designs."
    },
    {
     "type": "callout",
     "kind": "pro",
     "title": "6 GHz power classes",
     "text": "Most enterprise 6 GHz APs run as **low-power indoor** devices. Where regulators permit it, **standard-power** operation (higher power, also outdoors) requires the AP to check with an **automated frequency coordination (AFC)** service so it avoids incumbent links. Rules and allowed sub-bands differ by country and keep evolving: check your regulator before you design for standard power."
    },
    {
     "type": "table",
     "head": [
      "Use case",
      "Minimum signal (RSSI)",
      "Minimum SNR",
      "Other targets"
     ],
     "rows": [
      [
       "General data",
       "−70 dBm",
       "20 dB",
       "Coverage everywhere users sit"
      ],
      [
       "Voice and real-time video",
       "−67 dBm",
       "25 dB",
       "Every spot covered by a second AP for roaming; low retry rates"
      ],
      [
       "Location services",
       "−75 dBm from at least 3 APs",
       "—",
       "APs around the perimeter as well as the interior"
      ],
      [
       "High density (halls, lecture rooms)",
       "−67 dBm",
       "25 dB",
       "Capacity-driven AP count, narrower channels, minimum data rates raised"
      ]
     ],
     "title": "Common design targets by use case"
    },
    {
     "type": "compare",
     "title": "Survey types and when to use them",
     "columns": [
      {
       "title": "Predictive",
       "items": [
        "Floor plans and wall materials modelled in software",
        "Fast, cheap, good for budgets and first AP placement",
        "Only as accurate as the wall data you enter"
       ]
      },
      {
       "title": "On-site (AP-on-a-stick, passive or active)",
       "items": [
        "Measures real attenuation with a temporary AP",
        "Essential for unusual buildings: hospitals, warehouses, heritage sites",
        "Active mode also measures throughput and retries"
       ]
      },
      {
       "title": "Validation",
       "items": [
        "Walks the finished network",
        "Proves targets for signal, SNR, overlap and roaming",
        "Becomes the baseline for later troubleshooting"
       ]
      }
     ]
    },
    {
     "type": "steps",
     "title": "A disciplined survey process",
     "items": [
      {
       "title": "Gather requirements",
       "text": "Use cases, client types, densities per area, applications and their SLAs, security and compliance needs."
      },
      {
       "title": "Model predictively",
       "text": "Calibrate floor plans, assign wall materials and place APs for the strictest use case in each zone."
      },
      {
       "title": "Measure on site",
       "text": "Validate attenuation of unusual materials and check the existing noise floor and interferers with a spectrum analyser."
      },
      {
       "title": "Adjust the design",
       "text": "Revise AP count, mounting, antennas and channel plan; document every assumption."
      },
      {
       "title": "Validate after install",
       "text": "Run a post-installation survey against the agreed targets and fix gaps before handover."
      }
     ]
    },
    {
     "type": "keypoints",
     "items": [
      "Use 20 MHz channels in 2.4 GHz only, and consider turning surplus 2.4 GHz radios off or into a second 5 GHz/monitor role.",
      "In dense 5 GHz deployments, 20 or 40 MHz usually beats 80 MHz because more channels mean less co-channel contention.",
      "6 GHz has room for 80 MHz or wider channels in most enterprises, but still plan reuse.",
      "Set AP transmit power close to typical client power to avoid one-way links where the client hears the AP but the AP cannot hear the client.",
      "Raise minimum basic data rates to shrink effective cell size and save airtime spent on slow management frames.",
      "Let automatic radio resource management do day-to-day tuning, but give it sensible minimum and maximum power and allowed channel lists."
     ],
     "title": "Channel and power planning rules"
    },
    {
     "type": "callout",
     "kind": "warning",
     "text": "Turning every AP to maximum makes the client think it has a strong link while its own, weaker transmissions fail to reach the AP. The result is retries, sticky clients and co-channel interference. Coverage problems are usually fixed by AP placement, not power.",
     "title": "More power is not more coverage"
    },
    {
     "type": "cli",
     "device": "Linux laptop · terminal",
     "lines": [
      "$ iw dev wlan0 link",
      "Connected to 3c:fd:fe:a1:22:41 (on wlan0)",
      "        SSID: CORP-SECURE",
      "        freq: 5500",
      "        signal: -63 dBm",
      "        rx bitrate: 866.7 MBit/s VHT-MCS 9 80MHz short GI VHT-NSS 2",
      "        tx bitrate: 650.0 MBit/s VHT-MCS 7 80MHz short GI VHT-NSS 2"
     ],
     "title": "Reading a client's view of the link",
     "note": "5,500 MHz is channel 100, a DFS channel. −63 dBm meets a voice-grade target; the lower transmit MCS hints that the AP hears the client less well than the client hears the AP."
    },
    {
     "type": "template",
     "title": "WLAN design sheet",
     "purpose": "Capture per-area requirements and design decisions so that survey, installation and validation teams work to the same targets.",
     "columns": [
      "Area",
      "Use case and density",
      "Bands and channel width",
      "RSSI / SNR target",
      "SSIDs and security",
      "AP model, mount and count"
     ],
     "example": [
      [
       "Ward 3 East",
       "Voice badges, tablets, telemetry; 60 clients",
       "5 GHz 20 MHz, 6 GHz 40 MHz",
       "−67 dBm / 25 dB, 2 APs heard",
       "CLIN-SECURE (WPA3-Ent), IOT-MED",
       "Internal antennas, ceiling, 9 APs"
      ],
      [
       "Lecture hall B",
       "300 students, laptops and phones",
       "5 GHz 20 MHz, 6 GHz 80 MHz",
       "−67 dBm / 25 dB",
       "CAMPUS (WPA3-Ent), GUEST (OWE)",
       "Directional under-seat, 12 APs"
      ]
     ],
     "rows": 6
    },
    {
     "type": "scenario",
     "title": "Warehouse scanners drop out in the high racks",
     "situation": "A warehouse with metal racking was designed predictively. Handheld scanners disconnect in the aisles between the tallest racks, although the coverage map showed −65 dBm everywhere. What is the best next step?",
     "options": [
      {
       "text": "Survey on site with an AP-on-a-stick in the aisles, then redesign placement and antennas.",
       "feedback": "Correct. Metal racking and stock change attenuation in ways predictive models rarely capture. Measure, then redesign.",
       "best": true
      },
      {
       "text": "Raise every AP in the warehouse to maximum transmit power so the signal reaches the aisles.",
       "feedback": "This creates power asymmetry: the scanner, with a small battery-powered radio, still cannot reach the AP.",
       "best": false
      },
      {
       "text": "Move the scanners to 2.4 GHz with 40 MHz channels to gain range between the metal racks.",
       "feedback": "40 MHz in 2.4 GHz overlaps almost the whole band and makes interference worse.",
       "best": false
      },
      {
       "text": "Enable 802.11r on the scanner SSID so the scanners roam faster between the aisle APs.",
       "feedback": "Roaming speed does not create coverage that is not there.",
       "best": false
      }
     ]
    },
    {
     "type": "terms",
     "items": [
      {
       "term": "EIRP",
       "def": "Effective isotropic radiated power: transmit power plus antenna gain minus losses; the value regulators limit."
      },
      {
       "term": "SNR",
       "def": "Signal-to-noise ratio: the difference in dB between received signal strength and the noise floor."
      },
      {
       "term": "DFS",
       "def": "Dynamic Frequency Selection: rules that require APs on certain 5 GHz channels to detect radar and move away from it."
      }
     ]
    },
    {
     "type": "keypoints",
     "title": "Key takeaways",
     "items": [
      "Gains and losses in dB add; every doubling of distance costs about 6 dB.",
      "Set targets per use case (for example −67 dBm and 25 dB SNR for voice) and prove them with a validation survey.",
      "Narrow channels and sensible power beat wide channels and maximum power in dense spaces.",
      "Measure on site wherever materials are unusual; predictive models are only as good as their wall data."
     ]
    },
    {
     "type": "quiz",
     "items": [
      {
       "q": "A radio transmits at 17 dBm through a cable with 2 dB loss into a 5 dBi antenna. What is the EIRP?",
       "options": [
        "24 dBm",
        "22 dBm",
        "15 dBm",
        "20 dBm"
       ],
       "answer": 3,
       "explain": "17 − 2 + 5 = 20 dBm. Gains and losses in dB add and subtract."
      },
      {
       "q": "A client sees the AP at −68 dBm with a noise floor of −95 dBm. What is the SNR?",
       "options": [
        "163 dB",
        "−27 dB",
        "27 dB",
        "68 dB"
       ],
       "answer": 2,
       "explain": "SNR = −68 − (−95) = 27 dB, which meets a 25 dB voice target."
      },
      {
       "q": "Why are narrower 5 GHz channels often preferred in a dense office?",
       "options": [
        "More channels allow better reuse, so nearby APs contend less",
        "Narrow channels give each individual client a higher peak data rate",
        "Narrow channels remove the need to use DFS channels in the 5 GHz band",
        "Narrow channels allow WPA2 and WPA3 clients to share the same SSID"
       ],
       "answer": 0,
       "explain": "Capacity in dense spaces is limited by contention; more channels mean better reuse."
      },
      {
       "q": "Which survey type proves that the installed network meets its targets?",
       "options": [
        "A predictive survey from floor plans",
        "A spectrum scan performed before the APs are ordered",
        "A post-installation validation survey",
        "An AP-on-a-stick survey performed during the design phase"
       ],
       "answer": 2,
       "explain": "Validation surveys measure the finished network and become the operational baseline."
      },
      {
       "q": "What is the main risk of setting AP transmit power far above typical client power?",
       "options": [
        "Clients hear the AP, but the AP cannot reliably hear the clients",
        "Clients refuse to associate with APs that transmit above 14 dBm",
        "DFS radar detection is disabled when power exceeds the client level",
        "Channel width is automatically reduced to 20 MHz on all radios"
       ],
       "answer": 0,
       "explain": "Link asymmetry causes retries and sticky clients; match AP power to the client population."
      }
     ]
    }
   ]
  },
  {
   "id": "m6-l2",
   "title": "WLAN Architectures and Seamless Roaming",
   "subtitle": "Controller, distributed and cloud models; 802.11k, v and r in practice",
   "minutes": 40,
   "objectives": [
    "Compare controller-based, distributed and cloud-managed WLAN architectures.",
    "Explain how 802.11k, 802.11v and 802.11r cooperate to speed up roaming.",
    "Design for Layer 3 roaming and controller high availability."
   ],
   "blocks": [
    {
     "type": "text",
     "text": "Every enterprise WLAN separates three jobs: managing configuration, controlling RF and client state, and forwarding client data. Architectures differ mainly in **where** each job runs. Your choice affects roaming behaviour, failure domains, WAN dependence and how you segment traffic."
    },
    {
     "type": "layers",
     "title": "WLAN functional planes",
     "items": [
      {
       "label": "Management",
       "parts": [
        "Configuration templates",
        "Firmware and inventory",
        "Dashboards and APIs"
       ]
      },
      {
       "label": "Control",
       "parts": [
        "Radio resource management",
        "Client authentication state and key caching",
        "Roaming coordination"
       ]
      },
      {
       "label": "Data",
       "parts": [
        "Tunnelled to a controller, or switched locally at the AP"
       ]
      },
      {
       "label": "Access",
       "parts": [
        "APs, radios and antennas",
        "Clients and their roaming decisions"
       ]
      }
     ]
    },
    {
     "type": "table",
     "head": [
      "Model",
      "Where data is switched",
      "Strengths",
      "Trade-offs"
     ],
     "rows": [
      [
       "Controller with central tunnelling",
       "Controller (APs tunnel client traffic, e.g. CAPWAP, RFC 5415)",
       "Central policy, easy Layer 3 roaming, one place to segment",
       "Controller capacity and placement matter; hairpinning for remote sites"
      ],
      [
       "Controller with local switching",
       "At the AP onto local VLANs",
       "Branch survivability, no hairpin over the WAN",
       "Roaming across VLANs needs careful design"
      ],
      [
       "Cloud-managed",
       "At the AP; only management in the cloud",
       "Fast rollout, simple multi-site operations",
       "Features depend on the platform; plan for cloud reachability loss"
      ],
      [
       "Fabric-integrated",
       "At the access switch into an overlay",
       "Same segmentation for wired and wireless",
       "Requires a matching campus fabric"
      ]
     ],
     "title": "Architecture options"
    },
    {
     "type": "topology",
     "title": "Central tunnelling and local switching side by side",
     "nodes": [
      {
       "id": "wlc",
       "kind": "controller",
       "label": "WLC pair",
       "x": 1,
       "y": 0,
       "sub": "HA with state sync"
      },
      {
       "id": "rad",
       "kind": "idp",
       "label": "RADIUS",
       "x": 3,
       "y": 0,
       "sub": "802.1X policy"
      },
      {
       "id": "core",
       "kind": "l3switch",
       "label": "Core",
       "x": 2,
       "y": 1.5
      },
      {
       "id": "sw",
       "kind": "switch",
       "label": "SW-ACC3",
       "x": 1,
       "y": 3
      },
      {
       "id": "ap1",
       "kind": "ap",
       "label": "AP-3F-08",
       "x": 0,
       "y": 4.5,
       "sub": "central tunnelling"
      },
      {
       "id": "ap2",
       "kind": "ap",
       "label": "AP-3F-07",
       "x": 2,
       "y": 4.5,
       "sub": "local switching"
      },
      {
       "id": "wan",
       "kind": "cloud",
       "label": "WAN / SD-WAN",
       "x": 4,
       "y": 1.5
      },
      {
       "id": "br",
       "kind": "switch",
       "label": "Branch switch",
       "x": 5.5,
       "y": 3
      },
      {
       "id": "ap3",
       "kind": "ap",
       "label": "Branch AP",
       "x": 5.5,
       "y": 4.5,
       "sub": "local switching"
      }
     ],
     "links": [
      {
       "a": "wlc",
       "b": "core"
      },
      {
       "a": "rad",
       "b": "core"
      },
      {
       "a": "core",
       "b": "sw"
      },
      {
       "a": "sw",
       "b": "ap1",
       "label": "access port"
      },
      {
       "a": "sw",
       "b": "ap2",
       "label": "trunk"
      },
      {
       "a": "core",
       "b": "wan"
      },
      {
       "a": "wan",
       "b": "br"
      },
      {
       "a": "br",
       "b": "ap3"
      },
      {
       "a": "ap1",
       "b": "wlc",
       "label": "CAPWAP data",
       "style": "tunnel"
      },
      {
       "a": "ap3",
       "b": "wlc",
       "label": "control only",
       "style": "dashed"
      }
     ],
     "caption": "AP-3F-08 tunnels client traffic to the controller, so clients keep one subnet anywhere in the building. AP-3F-07 and the branch AP drop traffic onto local VLANs and send only control traffic to the controller, which avoids hairpinning across the WAN and keeps the branch working if the link fails."
    },
    {
     "type": "cli",
     "device": "Switch SW-ACC3 · IOS-style CLI",
     "lines": [
      "interface GigabitEthernet1/0/24",
      " description AP-3F-07 (local switching)",
      " switchport mode trunk",
      " switchport trunk native vlan 30",
      " switchport trunk allowed vlan 30,110,120,130",
      " spanning-tree portfast trunk",
      "!",
      "interface GigabitEthernet1/0/25",
      " description AP-3F-08 (central tunnelling)",
      " switchport mode access",
      " switchport access vlan 30",
      " spanning-tree portfast"
     ],
     "title": "Access ports for the two data-plane models",
     "note": "With local switching the AP needs a trunk carrying every client VLAN it maps SSIDs to (VLAN 30 untagged for AP management). With central tunnelling the AP only needs its management VLAN; client VLANs live at the controller."
    },
    {
     "type": "callout",
     "kind": "insight",
     "text": "The infrastructure can advise, but the client's driver chooses when and where to roam. Your job is to give clients good information (802.11k), clear nudges (802.11v) and a fast way in (802.11r), then validate with the actual devices your users carry.",
     "title": "Clients decide when to roam"
    },
    {
     "type": "table",
     "head": [
      "Amendment",
      "What it adds",
      "Benefit"
     ],
     "rows": [
      [
       "802.11k",
       "Neighbour reports and radio measurements",
       "Client scans a short list of channels instead of all of them"
      ],
      [
       "802.11v",
       "BSS transition management requests",
       "Network can suggest a better AP or warn of disassociation"
      ],
      [
       "802.11r",
       "Fast BSS Transition (FT) key hierarchy",
       "Re-keys in the authentication/reassociation frames, skipping full 802.1X"
      ]
     ],
     "title": "The roaming amendments"
    },
    {
     "type": "sequence",
     "title": "A fast roam for a voice handset",
     "actors": [
      "Handset",
      "Current AP",
      "Target AP"
     ],
     "steps": [
      {
       "from": 0,
       "to": 1,
       "label": "802.11k neighbour req",
       "note": "signal below roam threshold"
      },
      {
       "from": 1,
       "to": 0,
       "label": "Neighbour report",
       "note": "short list of channels",
       "reply": true
      },
      {
       "from": 1,
       "to": 0,
       "label": "802.11v transition req",
       "note": "suggests a less loaded AP"
      },
      {
       "from": 0,
       "to": 0,
       "label": "Scan only listed channels"
      },
      {
       "from": 0,
       "to": 2,
       "label": "FT authentication (802.11r)",
       "note": "keys from cached hierarchy"
      },
      {
       "from": 2,
       "to": 0,
       "label": "FT authentication response",
       "reply": true
      },
      {
       "from": 0,
       "to": 2,
       "label": "FT reassociation request"
      },
      {
       "from": 2,
       "to": 0,
       "label": "Reassociation response",
       "note": "no RADIUS round trip: voice resumes",
       "reply": true
      }
     ],
     "caption": "Each amendment removes one delay: 802.11k shortens the scan, 802.11v helps the client choose, and 802.11r moves key derivation into the authentication and reassociation frames so the remote RADIUS server is never contacted during the roam."
    },
    {
     "type": "formula",
     "title": "Roam time budget",
     "items": [
      {
       "name": "Roam time",
       "expr": "scan + authentication + reassociation + key exchange",
       "meaning": "Each term is a place to save time; FT removes the 802.1X exchange from the critical path."
      },
      {
       "name": "Voice target",
       "expr": "roam < 50 ms (commonly used goal)",
       "meaning": "Above roughly 150 ms the user typically hears a gap."
      },
      {
       "name": "Full 802.1X re-auth",
       "expr": "EAP round trips × RADIUS latency + 4-way handshake",
       "meaning": "Can reach hundreds of milliseconds across a WAN to the RADIUS server."
      }
     ]
    },
    {
     "type": "callout",
     "kind": "warning",
     "text": "Some older or specialised clients (scanners, medical devices, printers) misbehave on FT-enabled SSIDs. Use a mixed or adaptive FT mode where supported, or a separate SSID, and run a pilot with every critical device type.",
     "title": "Test 802.11r with your real clients"
    },
    {
     "type": "keypoints",
     "items": [
      "Keep a client's VLAN and IP when it roams: span the client VLAN across the roaming domain, use central tunnelling, or anchor the session at a home controller.",
      "Make controllers redundant (active/standby with state sync or N+1) and test failover during the working day.",
      "Place controllers near the data they serve; avoid hairpinning branch traffic across the WAN.",
      "For cloud-managed estates, confirm what keeps working if the cloud is unreachable: SSIDs, authentication, new clients."
     ],
     "title": "Layer 3 roaming and high availability"
    },
    {
     "type": "case",
     "title": "A hospital wireless redesign",
     "context": "A 600-bed hospital has a ten-year-old WLAN with one flat SSID for staff, guests and devices. Nurses' voice badges drop calls between wards, infusion pumps lose connectivity during upgrades, and the infection-control team now forbids ceiling access in some wards without a permit. The board has approved a redesign over 18 months.",
     "questions": [
      "How would you segment users and devices on the new WLAN?",
      "What roaming design would you choose for voice badges?",
      "How would you work within the ceiling-access restrictions?",
      "What would you validate before declaring each ward live?"
     ],
     "answer": "Segment by SSID only where security or client capability truly differs: a WPA3-Enterprise clinical SSID with role-based policy from RADIUS, a separate SSID for legacy medical devices that cannot do modern security (isolated VRF, strict ACLs), and an OWE guest SSID with captive-portal terms. Voice badges get 802.11k/v/r on the clinical SSID after vendor-certified testing, a −67 dBm / 25 dB design with two-AP coverage and QoS mapped from EF to the voice queue. Ceiling restrictions push the plan towards a predictive design calibrated with targeted on-site measurements, staged ward-by-ward installs scheduled with infection control, and APs mounted to avoid repeated access. Before each ward goes live: validation survey, roaming test walks with real badges, pump connectivity during controlled failover, and a sign-off by clinical engineering."
    },
    {
     "type": "scenario",
     "title": "Calls drop between floors",
     "situation": "Voice handsets drop calls when users walk from the third floor stairwell into the fourth floor corridor. Each floor has its own client VLAN and IP subnet, switched locally at the APs. Survey data shows good overlap in the stairwell. What should you change first?",
     "options": [
      {
       "text": "Increase AP transmit power on both floors to strengthen the signal in the stairwell area.",
       "feedback": "The survey already shows good overlap, and more power adds asymmetry.",
       "best": false
      },
      {
       "text": "Disable 802.11k so that the handsets scan every channel before choosing the next AP.",
       "feedback": "Removing neighbour reports slows roaming down.",
       "best": false
      },
      {
       "text": "Keep the handset's subnet when it roams: one voice VLAN, central tunnelling or anchoring.",
       "feedback": "Correct. Coverage is fine; the handset changes subnet mid-call. Preserving its Layer 3 identity fixes the drop.",
       "best": true
      },
      {
       "text": "Move the voice SSID to 2.4 GHz so the handsets get better range through the stairwell.",
       "feedback": "Range is not the problem, and 2.4 GHz offers fewer clean channels for voice.",
       "best": false
      }
     ]
    },
    {
     "type": "terms",
     "items": [
      {
       "term": "BSS transition management",
       "def": "The 802.11v mechanism that lets the network suggest a better AP to a client or warn it before disassociation."
      },
      {
       "term": "Fast BSS Transition (FT)",
       "def": "802.11r roaming that derives new keys during reassociation so the client avoids a full 802.1X exchange."
      },
      {
       "term": "CAPWAP",
       "def": "An IETF protocol (RFC 5415) for managing APs from a controller and optionally tunnelling client data to it."
      }
     ]
    },
    {
     "type": "keypoints",
     "title": "Key takeaways",
     "items": [
      "Architectures differ in where management, control and data run; choose by roaming, WAN and survivability needs.",
      "Clients decide when to roam; 802.11k informs, 802.11v nudges and 802.11r makes the transition fast.",
      "Keep a client's subnet stable across the roaming domain or calls will drop.",
      "Pilot 802.11r with every critical device type and test controller failover during working hours."
     ]
    },
    {
     "type": "quiz",
     "items": [
      {
       "q": "Which amendment provides clients with a list of neighbouring APs and their channels?",
       "options": [
        "802.11r",
        "802.11v",
        "802.11mc",
        "802.11k"
       ],
       "answer": 3,
       "explain": "802.11k neighbour reports shorten scanning. 802.11r speeds up re-keying, 802.11v lets the network suggest a target AP, and 802.11mc adds fine timing measurement for location."
      },
      {
       "q": "What does 802.11r remove from the critical path of a roam on an 802.1X SSID?",
       "options": [
        "The probe requests used to find candidate APs",
        "The full EAP exchange with the RADIUS server",
        "The reassociation frames exchanged with the new AP",
        "The WMM admission control for the voice queue"
       ],
       "answer": 1,
       "explain": "FT derives keys from a cached hierarchy, avoiding the slow EAP round trips."
      },
      {
       "q": "Who makes the final decision to roam in an 802.11 WLAN?",
       "options": [
        "The controller",
        "The client device",
        "The RADIUS server",
        "The AP the client is leaving"
       ],
       "answer": 1,
       "explain": "The network can advise with 802.11k/v, but the client's driver decides."
      },
      {
       "q": "Branch APs switch traffic locally onto per-floor VLANs, and voice calls drop between floors. What is the root design issue?",
       "options": [
        "Clients change IP subnet during the roam, breaking active sessions",
        "802.11r keys cannot be cached on locally switched access points",
        "Locally switched SSIDs cannot apply WMM priority to the voice traffic",
        "Branch APs cannot send 802.11k neighbour reports to their clients"
       ],
       "answer": 0,
       "explain": "A Layer 3 change mid-call kills the session; keep the client's subnet stable."
      },
      {
       "q": "What should you do before enabling 802.11r on an SSID shared with legacy scanners?",
       "options": [
        "Lower AP transmit power so that the scanners roam more often",
        "Enable 40 MHz channels in 2.4 GHz to improve scanner throughput",
        "Remove the WPA3 configuration and fall back to an open SSID",
        "Pilot every critical client type, or use an adaptive FT mode"
       ],
       "answer": 3,
       "explain": "Some legacy clients fail on FT SSIDs; validate first and use compatibility modes."
      }
     ]
    }
   ]
  },
  {
   "id": "m6-l3",
   "title": "Wireless Security, Guest Access and QoS",
   "subtitle": "WPA3-Enterprise, certificate-based EAP, safe guest networks and voice-grade WMM",
   "minutes": 40,
   "objectives": [
    "Compare WPA2- and WPA3-Enterprise and choose an EAP method.",
    "Configure a supplicant for EAP-TLS with proper server validation.",
    "Design a guest WLAN and map voice and video QoS end to end."
   ],
   "blocks": [
    {
     "type": "text",
     "text": "Wireless security is identity plus encryption plus management-frame protection. **WPA3** raises the floor: it mandates **Protected Management Frames (PMF)**, removes legacy ciphers on WPA3-only SSIDs, and brings stronger options such as a 192-bit mode. The method used to prove identity, the EAP method, matters as much as the WPA version."
    },
    {
     "type": "compare",
     "title": "Enterprise security modes",
     "columns": [
      {
       "title": "WPA2-Enterprise",
       "items": [
        "802.1X/EAP with AES-CCMP",
        "PMF optional",
        "Still widely supported by legacy clients",
        "Not permitted in 6 GHz"
       ]
      },
      {
       "title": "WPA3-Enterprise",
       "items": [
        "802.1X/EAP with PMF required",
        "SHA-256-based key management",
        "Transition mode exists but keeps some WPA2 weaknesses",
        "Required for 6 GHz enterprise SSIDs"
       ]
      },
      {
       "title": "WPA3-Enterprise 192-bit",
       "items": [
        "GCMP-256 and SHA-384 suites",
        "EAP-TLS with strong certificates",
        "For high-assurance environments",
        "Needs client and RADIUS support end to end"
       ]
      }
     ]
    },
    {
     "type": "sequence",
     "title": "802.1X with EAP-TLS on a WLAN",
     "actors": [
      "Client (supplicant)",
      "AP or controller",
      "RADIUS server"
     ],
     "steps": [
      {
       "from": 0,
       "to": 1,
       "label": "Associate to CORP-SECURE",
       "note": "port open for EAP only"
      },
      {
       "from": 1,
       "to": 0,
       "label": "EAP-Request/Identity",
       "reply": true
      },
      {
       "from": 0,
       "to": 1,
       "label": "EAP-Response/Identity"
      },
      {
       "from": 1,
       "to": 2,
       "label": "Access-Request (EAP)"
      },
      {
       "from": 2,
       "to": 0,
       "label": "TLS: server certificate",
       "note": "relayed by the AP in EAP",
       "reply": true
      },
      {
       "from": 0,
       "to": 0,
       "label": "Check CA and server name"
      },
      {
       "from": 0,
       "to": 2,
       "label": "TLS: client certificate",
       "note": "relayed in Access-Request"
      },
      {
       "from": 2,
       "to": 1,
       "label": "Access-Accept, PMK, role",
       "note": "VLAN, role or ACL returned",
       "reply": true
      },
      {
       "from": 1,
       "to": 0,
       "label": "EAP-Success",
       "reply": true
      },
      {
       "from": 1,
       "to": 0,
       "label": "4-way handshake",
       "note": "session keys derived, traffic encrypted"
      }
     ],
     "caption": "The client must check the server certificate (step 6) before it proves its own identity; skipping that check is what lets a look-alike SSID harvest credentials. The RADIUS server returns both the keying material and the policy for the session."
    },
    {
     "type": "table",
     "head": [
      "Method",
      "Client proves identity with",
      "Strength",
      "Typical use"
     ],
     "rows": [
      [
       "EAP-TLS",
       "Client certificate",
       "Strongest; no passwords to phish",
       "Managed laptops, phones and IoT with device PKI"
      ],
      [
       "TEAP",
       "Certificate and/or password inside a tunnel; can chain machine and user",
       "Strong and flexible",
       "Modern managed fleets needing machine plus user auth"
      ],
      [
       "PEAP-MSCHAPv2",
       "Username and password inside TLS",
       "Weak if server validation is skipped",
       "Legacy; migrate away"
      ],
      [
       "EAP-TTLS",
       "Inner password or other methods",
       "Depends on inner method",
       "Mixed or non-domain clients"
      ]
     ],
     "title": "Choosing an EAP method"
    },
    {
     "type": "cli",
     "device": "Linux laptop · wpa_supplicant.conf",
     "lines": [
      "network={",
      "    ssid=\"CORP-SECURE\"",
      "    key_mgmt=WPA-EAP-SHA256",
      "    ieee80211w=2",
      "    eap=TLS",
      "    identity=\"laptop042@corp.example\"",
      "    ca_cert=\"/etc/wifi/corp-root-ca.pem\"",
      "    client_cert=\"/etc/wifi/laptop042.pem\"",
      "    private_key=\"/etc/wifi/laptop042.key\"",
      "    domain_suffix_match=\"radius.corp.example\"",
      "}"
     ],
     "title": "EAP-TLS for a WPA3-Enterprise SSID",
     "note": "`ieee80211w=2` makes PMF mandatory; `ca_cert` plus `domain_suffix_match` ensure the laptop only trusts your RADIUS server."
    },
    {
     "type": "callout",
     "kind": "warning",
     "text": "If clients do not validate the RADIUS server's certificate and name, an attacker's look-alike SSID can harvest credentials. Push supplicant profiles through device management; never rely on users clicking 'trust'.",
     "title": "Skipping server validation defeats the design"
    },
    {
     "type": "steps",
     "title": "Designing guest access",
     "items": [
      {
       "title": "Isolate",
       "text": "Put guests in their own VRF or VLAN with internet-only access, or tunnel them to a DMZ anchor."
      },
      {
       "title": "Encrypt",
       "text": "Use OWE (Enhanced Open) so even open guest traffic is encrypted over the air."
      },
      {
       "title": "Onboard",
       "text": "Captive portal for terms, sponsor approval or self-registration where policy requires it."
      },
      {
       "title": "Contain",
       "text": "Client isolation, per-client rate limits and session timeouts."
      },
      {
       "title": "Log",
       "text": "Retain association and portal logs as legal requirements demand, and no longer."
      }
     ]
    },
    {
     "type": "topology",
     "title": "Guest and staff on the same APs, never on the same network",
     "nodes": [
      {
       "id": "net",
       "kind": "internet",
       "label": "Internet",
       "x": 4.5,
       "y": 0
      },
      {
       "id": "fw",
       "kind": "firewall",
       "label": "Guest firewall",
       "x": 4.5,
       "y": 1.5,
       "sub": "portal, rate limits"
      },
      {
       "id": "core",
       "kind": "l3switch",
       "label": "Core",
       "x": 2.5,
       "y": 1.5,
       "sub": "VRFs GUEST and CORP"
      },
      {
       "id": "ap",
       "kind": "ap",
       "label": "AP",
       "x": 1,
       "y": 1.5,
       "sub": "GUEST (OWE), CORP-SECURE"
      },
      {
       "id": "v",
       "kind": "phone",
       "label": "Visitor",
       "x": 0.5,
       "y": 3,
       "sub": "OWE, client isolation"
      },
      {
       "id": "s",
       "kind": "laptop",
       "label": "Staff laptop",
       "x": 1.5,
       "y": 3,
       "sub": "EAP-TLS, role STAFF"
      },
      {
       "id": "apps",
       "kind": "server",
       "label": "Internal apps",
       "x": 3,
       "y": 3,
       "sub": "VRF CORP only"
      }
     ],
     "links": [
      {
       "a": "v",
       "b": "ap",
       "style": "wireless"
      },
      {
       "a": "s",
       "b": "ap",
       "style": "wireless"
      },
      {
       "a": "ap",
       "b": "core",
       "label": "trunk"
      },
      {
       "a": "core",
       "b": "fw",
       "label": "VRF GUEST"
      },
      {
       "a": "fw",
       "b": "net"
      },
      {
       "a": "core",
       "b": "apps",
       "label": "VRF CORP"
      }
     ],
     "caption": "Both SSIDs share the radios, but guest traffic is placed in VRF GUEST at the first hop and its only exit is the guest firewall towards the internet. Internal applications are reachable only from VRF CORP, so no ACL mistake on a single VLAN can expose them to visitors."
    },
    {
     "type": "table",
     "head": [
      "Traffic",
      "DSCP",
      "802.11 UP",
      "WMM access category"
     ],
     "rows": [
      [
       "Voice",
       "EF (46)",
       "6",
       "AC_VO"
      ],
      [
       "Interactive video",
       "AF41 (34)",
       "4",
       "AC_VI"
      ],
      [
       "Low-latency data",
       "AF21 (18)",
       "3",
       "AC_BE"
      ],
      [
       "Default",
       "DF (0)",
       "0",
       "AC_BE"
      ],
      [
       "Scavenger / bulk",
       "CS1 (8)",
       "1",
       "AC_BK"
      ]
     ],
     "title": "Mapping voice and video QoS onto Wi-Fi (RFC 8325 guidance)"
    },
    {
     "type": "keypoints",
     "items": [
      "Trust DSCP from managed clients and map it to UP on the AP; do not rely on UP set by clients.",
      "Re-mark or police traffic from untrusted SSIDs such as guest.",
      "Use admission control on the voice access category where clients support it.",
      "Raise minimum data rates and keep cells small enough that voice frames go out at high rates.",
      "Measure with real calls: jitter, loss, retries and MOS while walking the roaming paths."
     ],
     "title": "Voice and video over WLAN practices"
    },
    {
     "type": "scenario",
     "title": "Guest network design for a conference centre",
     "situation": "A conference centre needs guest Wi-Fi for 2,000 visitors. Legal requires acceptance of terms; security requires that guests can never reach internal systems; visitors complain that open networks feel unsafe. Which design is best?",
     "options": [
      {
       "text": "A WPA2-Personal SSID with the password printed on badges, on the corporate VLAN with an ACL.",
       "feedback": "Shared passwords leak, offer little protection between guests, and the corporate VLAN is the wrong place for visitors.",
       "best": false
      },
      {
       "text": "A WPA3-Enterprise SSID with an individual RADIUS account created for every single visitor each day.",
       "feedback": "Strong, but heavy to operate for 2,000 one-day visitors and usually unnecessary.",
       "best": false
      },
      {
       "text": "An open SSID with no portal at all, relying on HTTPS on each website for visitors' privacy.",
       "feedback": "This fails the legal requirement and gives no over-the-air protection.",
       "best": false
      },
      {
       "text": "An OWE SSID in a guest VRF with internet-only access, a terms portal, isolation and rate limits.",
       "feedback": "Correct. OWE encrypts over the air without a shared password, the VRF enforces isolation, and the portal meets the legal requirement.",
       "best": true
      }
     ]
    },
    {
     "type": "checklist",
     "title": "WLAN security and QoS go-live checklist",
     "items": [
      "Enterprise SSIDs use WPA3-Enterprise (or a time-boxed transition plan) with PMF required.",
      "EAP-TLS or TEAP is the default method; supplicant profiles enforce server name validation.",
      "RADIUS returns roles or VLANs per identity; unknown devices land in a restricted role.",
      "Guest SSID uses OWE, a separate VRF, client isolation and rate limits.",
      "Voice SSID maps EF to UP 6 and AF41 to UP 4; untrusted SSIDs are re-marked.",
      "6 GHz radios carry only WPA3 or OWE SSIDs.",
      "A rogue and wireless intrusion detection policy is enabled and alerts reach the NOC.",
      "A validation survey and roaming test walk with real devices are signed off."
     ]
    },
    {
     "type": "terms",
     "items": [
      {
       "term": "WPA3",
       "def": "The current Wi-Fi security generation; it mandates PMF and offers SAE for personal and stronger suites for enterprise networks."
      },
      {
       "term": "Protected Management Frames (PMF)",
       "def": "802.11w protection that prevents forged deauthentication and disassociation frames."
      },
      {
       "term": "OWE",
       "def": "Opportunistic Wireless Encryption (Enhanced Open): encrypts traffic on an open SSID without a shared password."
      },
      {
       "term": "WMM",
       "def": "Wi-Fi Multimedia: the four access categories (voice, video, best effort, background) that prioritise traffic over the air."
      }
     ]
    },
    {
     "type": "keypoints",
     "title": "Key takeaways",
     "items": [
      "WPA3-Enterprise requires PMF and is mandatory for enterprise SSIDs in 6 GHz.",
      "Prefer EAP-TLS or TEAP and enforce server certificate and name validation through managed profiles.",
      "Give guests OWE encryption, a separate VRF, isolation, rate limits and a terms portal.",
      "Map EF to UP 6 and AF41 to UP 4, re-mark untrusted SSIDs and test with real calls."
     ]
    },
    {
     "type": "quiz",
     "items": [
      {
       "q": "Which security option is required for any enterprise SSID broadcast in the 6 GHz band?",
       "options": [
        "WPA2-Enterprise only",
        "WPA2-Personal with a long passphrase",
        "WPA3-Enterprise with PMF",
        "An open SSID protected by a captive portal"
       ],
       "answer": 2,
       "explain": "6 GHz permits only WPA3 or OWE; WPA2 and open SSIDs are not allowed there."
      },
      {
       "q": "Why is EAP-TLS considered stronger than PEAP-MSCHAPv2?",
       "options": [
        "It uses a faster cipher suite inside the outer TLS tunnel for each session",
        "It does not require a RADIUS server to authenticate the clients",
        "It works without the client validating any server certificate",
        "Client certificates replace passwords, so there is nothing to phish"
       ],
       "answer": 3,
       "explain": "Certificate-based identity removes the password attack surface entirely."
      },
      {
       "q": "Following RFC 8325 guidance, voice marked EF should map to which 802.11 user priority?",
       "options": [
        "UP 6 (AC_VO)",
        "UP 4 (AC_VI)",
        "UP 7 (AC_VO)",
        "UP 5 (AC_VI)"
       ],
       "answer": 0,
       "explain": "EF maps to UP 6 in the voice access category."
      },
      {
       "q": "What does OWE add to a guest SSID?",
       "options": [
        "Mandatory user authentication against a RADIUS server",
        "Automatic acceptance of the captive portal terms",
        "Over-the-air encryption without a shared password",
        "Isolation of guest traffic into a separate VRF"
       ],
       "answer": 2,
       "explain": "OWE encrypts each client's traffic; isolation and portals are separate controls."
      },
      {
       "q": "A supplicant profile omits server certificate validation. What is the main risk?",
       "options": [
        "Clients will roam more slowly between APs on the same floor",
        "A rogue SSID can pose as the network and harvest credentials",
        "The RADIUS server will reject all clients that use the profile",
        "PMF will be disabled for every client on the secure SSID"
       ],
       "answer": 1,
       "explain": "Without server validation, clients will talk to any RADIUS server, including an attacker's."
      }
     ]
    }
   ]
  },
  {
   "id": "m6-l4",
   "title": "Location, Analytics and Wi-Fi 7",
   "subtitle": "Turning RF into insight, and planning for multi-link, wide-channel WLANs",
   "minutes": 35,
   "objectives": [
    "Compare Wi-Fi and complementary location techniques and their typical accuracy.",
    "Handle analytics data with privacy and MAC randomisation in mind.",
    "Explain the main Wi-Fi 7 features and plan a realistic adoption path."
   ],
   "blocks": [
    {
     "type": "text",
     "text": "A WLAN constantly measures its environment: who is connected, where, how well and for how long. Location services and analytics turn that data into wayfinding, asset tracking, space planning and faster troubleshooting. At the same time, Wi-Fi 7 changes design assumptions with multi-link operation and much wider channels. This lesson covers both at the level a professional needs to make decisions."
    },
    {
     "type": "table",
     "head": [
      "Technique",
      "How it works",
      "Indicative accuracy",
      "Notes"
     ],
     "rows": [
      [
       "RSSI trilateration",
       "Signal strength heard by several APs",
       "5–10 m",
       "Works with any client; affected by bodies and walls"
      ],
      [
       "RF fingerprinting",
       "Compares readings to a calibrated map",
       "3–5 m",
       "Needs calibration and re-calibration after changes"
      ],
      [
       "Angle of arrival",
       "Antenna arrays measure signal direction",
       "1–3 m",
       "Needs specialised APs"
      ],
      [
       "Fine Timing Measurement",
       "Round-trip time between client and APs",
       "1–2 m",
       "Needs client and AP support"
      ],
      [
       "BLE beacons and tags",
       "Bluetooth Low Energy radios in APs or tags",
       "1–5 m",
       "Good for asset tags with long battery life"
      ],
      [
       "Ultra-wideband",
       "Precise time-of-flight",
       "Sub-metre",
       "Separate infrastructure; high-value assets"
      ]
     ],
     "title": "Location techniques"
    },
    {
     "type": "flow",
     "title": "From radio to insight",
     "items": [
      {
       "label": "Sense",
       "text": "APs, BLE radios and sensors collect signal and timing data."
      },
      {
       "label": "Collect",
       "text": "Controller or cloud aggregates readings per device."
      },
      {
       "label": "Locate",
       "text": "Location engine computes positions on calibrated maps."
      },
      {
       "label": "Analyse",
       "text": "Presence, dwell time, occupancy and asset movement."
      },
      {
       "label": "Act",
       "text": "Dashboards, APIs, alerts and integration with other systems."
      }
     ]
    },
    {
     "type": "keypoints",
     "items": [
      "Modern phones use randomised, often per-SSID, MAC addresses; counts of unassociated devices are estimates, not people.",
      "Prefer aggregated, anonymised analytics; store identifiable location data only with a clear purpose and consent.",
      "Set retention limits and access controls for location history, especially for staff and patients.",
      "Document what is collected on public signage or privacy notices where the law requires it."
     ],
     "title": "Privacy and data quality"
    },
    {
     "type": "table",
     "head": [
      "Generation",
      "Standard",
      "Headline features"
     ],
     "rows": [
      [
       "Wi-Fi 6",
       "802.11ax",
       "OFDMA, uplink and downlink MU-MIMO, BSS colouring, target wake time, 1024-QAM"
      ],
      [
       "Wi-Fi 6E",
       "802.11ax in 6 GHz",
       "Wi-Fi 6 features plus clean 6 GHz spectrum and WPA3-only operation"
      ],
      [
       "Wi-Fi 7",
       "802.11be",
       "320 MHz channels in 6 GHz, 4096-QAM, multi-link operation, multi-RU and preamble puncturing"
      ]
     ],
     "title": "Wi-Fi generations at a glance"
    },
    {
     "type": "timeline",
     "title": "Wi-Fi generations",
     "items": [
      {
       "when": "2009",
       "label": "Wi-Fi 4 (802.11n)",
       "text": "MIMO and 40 MHz channels"
      },
      {
       "when": "2013",
       "label": "Wi-Fi 5 (802.11ac)",
       "text": "5 GHz only, 80/160 MHz, downlink MU-MIMO"
      },
      {
       "when": "2019",
       "label": "Wi-Fi 6 (802.11ax)",
       "text": "OFDMA, uplink MU-MIMO, target wake time"
      },
      {
       "when": "2020–2021",
       "label": "Wi-Fi 6E",
       "text": "6 GHz opened in the first countries; WPA3 or OWE only"
      },
      {
       "when": "2024",
       "label": "Wi-Fi 7 (802.11be)",
       "text": "certification opened; MLO, 320 MHz, 4096-QAM"
      },
      {
       "when": "In development",
       "label": "802.11bn ('Wi-Fi 8')",
       "text": "focus on reliability and latency rather than peak speed; check the current timetable"
      }
     ],
     "caption": "Years are when certified products or the first spectrum arrived, not when every client supported them. Each generation pays off only as the client fleet catches up, which is why refreshes should follow the lifecycle rather than the headlines."
    },
    {
     "type": "framework",
     "title": "Wi-Fi 7 features that change design",
     "items": [
      {
       "label": "MLO",
       "title": "Multi-link operation",
       "text": "A client and AP use links in two or more bands at once or switch between them quickly, improving latency and resilience."
      },
      {
       "label": "320",
       "title": "320 MHz channels",
       "text": "Only in 6 GHz; very high peak rates but few channels, so suited to low-density, high-throughput spaces."
      },
      {
       "label": "4K",
       "title": "4096-QAM",
       "text": "12 bits per symbol versus 10, about 20% more peak throughput, but only at very high SNR close to the AP."
      },
      {
       "label": "PUNC",
       "title": "Preamble puncturing",
       "text": "Uses a wide channel while skipping a sub-channel that has interference, instead of falling back to a narrower width."
      },
      {
       "label": "MRU",
       "title": "Multi-RU",
       "text": "Lets one client receive several resource units, improving spectral efficiency in OFDMA scheduling."
      }
     ]
    },
    {
     "type": "formula",
     "title": "Why 4096-QAM is not a capacity plan",
     "items": [
      {
       "name": "Bits per symbol",
       "expr": "log2(4096) = 12 vs log2(1024) = 10",
       "meaning": "A 20% gain in peak rate per spatial stream."
      },
      {
       "name": "Where it works",
       "expr": "Very high SNR, roughly 40 dB or more",
       "meaning": "Only clients close to the AP benefit; the cell edge does not."
      }
     ]
    },
    {
     "type": "callout",
     "kind": "insight",
     "text": "Wi-Fi 7 features such as multi-link operation expect WPA3 with protected management frames. Treat legacy WPA2-only SSIDs as a blocker for Wi-Fi 7 benefits and plan their retirement early.",
     "title": "Wi-Fi 7 and security"
    },
    {
     "type": "steps",
     "title": "A realistic Wi-Fi 7 adoption path",
     "items": [
      {
       "title": "Assess clients",
       "text": "Inventory client capabilities; benefits arrive only as Wi-Fi 7 clients arrive."
      },
      {
       "title": "Prepare the wire",
       "text": "Multi-gigabit access ports and adequate PoE budgets for new APs."
      },
      {
       "title": "Clean up security",
       "text": "Move SSIDs to WPA3 and consolidate SSIDs across bands for MLO."
      },
      {
       "title": "Pilot",
       "text": "Deploy in high-value areas and measure latency, roaming and throughput."
      },
      {
       "title": "Refresh by lifecycle",
       "text": "Replace APs as they age; avoid forklift upgrades with no client benefit."
      }
     ]
    },
    {
     "type": "scenario",
     "title": "320 MHz everywhere?",
     "situation": "A director has read about Wi-Fi 7 and wants 320 MHz channels on every AP in a dense open-plan office with 900 users. What do you recommend?",
     "options": [
      {
       "text": "Agree, because wider channels always give every user more capacity, even in a dense open-plan office.",
       "feedback": "Wide channels raise peak rates for one client but leave too few channels to separate neighbouring APs.",
       "best": false
      },
      {
       "text": "Use 320 MHz channels in the 5 GHz band instead, so that 6 GHz stays free for future expansion.",
       "feedback": "320 MHz channels exist only in 6 GHz.",
       "best": false
      },
      {
       "text": "Use 80 MHz or narrower in open-plan areas, and keep 320 MHz for low-density, high-throughput rooms.",
       "feedback": "Correct. In dense areas, channel reuse matters more than peak width; there are very few 320 MHz channels even in the full 6 GHz band.",
       "best": true
      },
      {
       "text": "Disable 6 GHz entirely and keep the office on 5 GHz with 160 MHz channels for all of the APs.",
       "feedback": "This throws away the cleanest spectrum and still reduces reuse.",
       "best": false
      }
     ]
    },
    {
     "type": "reflection",
     "prompt": "Pick one building you know. Which wireless use case there would benefit most from location services or Wi-Fi 7, and what would you need to change in the network first?"
    },
    {
     "type": "terms",
     "items": [
      {
       "term": "Multi-link operation (MLO)",
       "def": "A Wi-Fi 7 capability that lets a device use links in several bands simultaneously or switch rapidly between them."
      },
      {
       "term": "Preamble puncturing",
       "def": "Transmitting on a wide channel while excluding an interfered sub-channel rather than shrinking the whole channel."
      },
      {
       "term": "Fine Timing Measurement (FTM)",
       "def": "An 802.11 round-trip-time measurement that enables metre-level Wi-Fi positioning when clients and APs support it."
      }
     ]
    },
    {
     "type": "keypoints",
     "title": "Key takeaways",
     "items": [
      "Pick a location technique by the accuracy you need: RSSI for zones, FTM, angle of arrival or UWB for metres or less.",
      "MAC randomisation makes device counts estimates; aggregate, anonymise and limit retention.",
      "Wi-Fi 7 gains (MLO, wide channels, 4096-QAM) need Wi-Fi 7 clients, WPA3 and multi-gigabit, well-powered access ports.",
      "Keep 320 MHz for low-density rooms; dense areas still need channel reuse."
     ]
    },
    {
     "type": "quiz",
     "items": [
      {
       "q": "Which location technique typically needs specialised antenna-array APs?",
       "options": [
        "RSSI trilateration",
        "Angle of arrival",
        "Fingerprinting",
        "Fine Timing Measurement"
       ],
       "answer": 1,
       "explain": "Angle of arrival measures signal direction using antenna arrays built into specific APs."
      },
      {
       "q": "Why are counts of nearby phones in Wi-Fi analytics only estimates?",
       "options": [
        "Phones are only detected when they are associated to an enterprise SSID",
        "Analytics engines discard all probe requests sent on 6 GHz channels",
        "Randomised MAC addresses can change over time and differ per SSID",
        "Every phone uses the same MAC address on every network that it sees"
       ],
       "answer": 2,
       "explain": "MAC randomisation means one device can appear as several, and identities are not stable."
      },
      {
       "q": "In which band are Wi-Fi 7's 320 MHz channels available?",
       "options": [
        "6 GHz only",
        "5 GHz only",
        "Both 5 and 6 GHz",
        "All three bands"
       ],
       "answer": 0,
       "explain": "Only 6 GHz has enough contiguous spectrum for 320 MHz channels."
      },
      {
       "q": "What does 4096-QAM improve compared with 1024-QAM?",
       "options": [
        "About double the range at the cell edge for every client",
        "Better penetration through walls and floors for all bands",
        "Faster roaming between APs on the same controller",
        "About 20% higher peak rate, only at very high SNR"
       ],
       "answer": 3,
       "explain": "12 versus 10 bits per symbol; the gain applies only close to the AP."
      },
      {
       "q": "What is the main benefit of multi-link operation for a latency-sensitive client?",
       "options": [
        "It doubles the number of SSIDs the client can see on each AP",
        "It removes the need for the client to support WPA3 at all",
        "It lets 2.4 GHz use 320 MHz channels when the band is idle",
        "Frames can use whichever band's link is free, cutting delay"
       ],
       "answer": 3,
       "explain": "MLO spreads or switches traffic across links in different bands."
      }
     ]
    }
   ]
  }
 ]
});
TRACK.modules.push({
 "id": "m7",
 "order": 7,
 "code": "Assure",
 "title": "Assure — Assurance, Security & Troubleshooting",
 "subtitle": "See everything, prove service levels, find root cause fast and protect the network itself.",
 "outcomes": [
  "Collect SNMPv3, syslog and IPFIX data securely and interpret it correctly.",
  "Design streaming telemetry subscriptions and synthetic probes that reveal user-impacting events.",
  "Apply a structured troubleshooting method across VRFs, overlays and wireless.",
  "Deploy 802.1X and MAB with dynamic segmentation through a phased rollout.",
  "Protect devices with control-plane policing, hardening baselines and infrastructure ACLs."
 ],
 "lessons": [
  {
   "id": "m7-l1",
   "title": "Monitoring Foundations: SNMPv3, Syslog and Flow Data",
   "subtitle": "The three classic signals, configured securely and read correctly",
   "minutes": 35,
   "objectives": [
    "Configure SNMPv3 with authentication, privacy and source restrictions.",
    "Build a reliable syslog pipeline with accurate time.",
    "Export flow records with IPFIX and estimate traffic from sampled data."
   ],
   "blocks": [
    {
     "type": "text",
     "text": "The Assure stage of **The ZCNP Fabric** asks one question continuously: is the network doing what we designed it to do? You cannot answer it without trustworthy data. This lesson covers the three signals every network already produces (counters and state through **SNMP**, events through **syslog**, and conversations through **flow records**) and how to collect them without opening new security holes."
    },
    {
     "type": "topology",
     "title": "Where the classic monitoring signals go",
     "nodes": [
      {
       "id": "r1",
       "kind": "router",
       "label": "R1",
       "x": 0.5,
       "y": 1,
       "sub": "source Loopback0"
      },
      {
       "id": "sw",
       "kind": "switch",
       "label": "SW1",
       "x": 0.5,
       "y": 3,
       "sub": "source Vlan50"
      },
      {
       "id": "mg",
       "kind": "l3switch",
       "label": "Management net",
       "x": 2.5,
       "y": 2,
       "sub": "VRF MGMT"
      },
      {
       "id": "ntp",
       "kind": "server",
       "label": "NTP pair",
       "x": 4.5,
       "y": 0,
       "sub": "10.10.50.5 and .6"
      },
      {
       "id": "nms",
       "kind": "monitor",
       "label": "NMS poller",
       "x": 4.5,
       "y": 1.33,
       "sub": "SNMPv3 authPriv"
      },
      {
       "id": "sys",
       "kind": "siem",
       "label": "Syslog collector",
       "x": 4.5,
       "y": 2.67,
       "sub": "10.10.50.30"
      },
      {
       "id": "flow",
       "kind": "db",
       "label": "Flow collector",
       "x": 4.5,
       "y": 4,
       "sub": "IPFIX, UDP 4739"
      }
     ],
     "links": [
      {
       "a": "r1",
       "b": "mg"
      },
      {
       "a": "sw",
       "b": "mg"
      },
      {
       "a": "mg",
       "b": "ntp",
       "label": "time"
      },
      {
       "a": "mg",
       "b": "nms",
       "label": "polls, traps"
      },
      {
       "a": "mg",
       "b": "sys",
       "label": "events"
      },
      {
       "a": "mg",
       "b": "flow",
       "label": "flow records"
      }
     ],
     "caption": "Every device sends its signals from one stable source interface across a protected management network. All four collectors depend on the NTP pair: without agreed time, counters, events and flows cannot be lined up during an incident."
    },
    {
     "type": "compare",
     "title": "SNMP versions and security levels",
     "columns": [
      {
       "title": "SNMPv2c",
       "items": [
        "Community string sent in clear text",
        "No real authentication or encryption",
        "Still common on legacy kit; restrict tightly or retire"
       ]
      },
      {
       "title": "SNMPv3 security levels",
       "items": [
        "noAuthNoPriv: username only, avoid",
        "authNoPriv: messages authenticated, not encrypted",
        "authPriv: authenticated and encrypted, the target state"
       ]
      }
     ]
    },
    {
     "type": "cli",
     "device": "R1 · IOS-style CLI",
     "lines": [
      "ip access-list standard NMS-HOSTS",
      " permit 10.10.50.0 0.0.0.255",
      "!",
      "snmp-server view NMS-VIEW iso included",
      "snmp-server group NMS-GRP v3 priv read NMS-VIEW access NMS-HOSTS",
      "snmp-server user nms-poller NMS-GRP v3 auth sha <auth-secret> priv aes 256 <priv-secret>",
      "snmp-server host 10.10.50.20 version 3 priv nms-poller",
      "snmp-server enable traps snmp linkdown linkup",
      "snmp-server enable traps bgp"
     ],
     "title": "SNMPv3 with authPriv, a read-only view and a source ACL",
     "note": "Use the strongest authentication and privacy algorithms your platforms support. SNMPv3 users are not shown in the running configuration, so record them in your secrets store."
    },
    {
     "type": "table",
     "head": [
      "Level",
      "Keyword",
      "Typical example"
     ],
     "rows": [
      [
       "0",
       "Emergency",
       "System unusable"
      ],
      [
       "1",
       "Alert",
       "Immediate action needed, e.g. temperature critical"
      ],
      [
       "2",
       "Critical",
       "Hardware component failure"
      ],
      [
       "3",
       "Error",
       "Interface or process error"
      ],
      [
       "4",
       "Warning",
       "Threshold approaching, configuration conflict"
      ],
      [
       "5",
       "Notice",
       "Interface up/down, neighbour changes"
      ],
      [
       "6",
       "Informational",
       "Configuration change, ACL hit log"
      ],
      [
       "7",
       "Debug",
       "Troubleshooting output; never send continuously to a server"
      ]
     ],
     "title": "Syslog severity levels"
    },
    {
     "type": "cli",
     "device": "R1 · IOS-style CLI",
     "lines": [
      "ntp server 10.10.50.5 prefer",
      "ntp server 10.10.50.6",
      "service timestamps log datetime msec localtime show-timezone",
      "logging source-interface Loopback0",
      "logging host 10.10.50.30",
      "logging trap informational",
      "logging buffered 64000 informational"
     ],
     "title": "Syslog to a collector with trustworthy timestamps",
     "note": "A consistent source interface makes events from one device easy to correlate. Where supported, prefer TCP or TLS transport so events are not silently lost."
    },
    {
     "type": "callout",
     "kind": "pro",
     "text": "Correlation across devices, flows, logs and tickets only works if every clock agrees. Use at least two internal NTP sources, authenticate them where possible, alarm on unsynchronised devices, and log in one agreed time zone or UTC.",
     "title": "Time is the backbone of assurance"
    },
    {
     "type": "table",
     "head": [
      "Format",
      "Structure",
      "Notes"
     ],
     "rows": [
      [
       "NetFlow v5",
       "Fixed fields, IPv4 only",
       "Legacy; no IPv6, no extensibility"
      ],
      [
       "NetFlow v9",
       "Template-based (RFC 3954)",
       "Flexible fields, IPv6 support"
      ],
      [
       "IPFIX",
       "Template-based IETF standard (RFC 7011), default port 4739",
       "Variable-length and enterprise-specific fields; the modern default"
      ]
     ],
     "title": "Flow export formats"
    },
    {
     "type": "cli",
     "device": "R1 · IOS-style CLI",
     "lines": [
      "flow record FR-APP",
      " match ipv4 source address",
      " match ipv4 destination address",
      " match ipv4 protocol",
      " match transport source-port",
      " match transport destination-port",
      " match interface input",
      " collect counter bytes long",
      " collect counter packets long",
      " collect timestamp absolute first",
      " collect timestamp absolute last",
      "flow exporter FE-COLLECTOR",
      " destination 10.10.50.40",
      " source Loopback0",
      " transport udp 4739",
      " export-protocol ipfix",
      "flow monitor FM-APP",
      " record FR-APP",
      " exporter FE-COLLECTOR",
      " cache timeout active 60"
     ],
     "title": "Flexible flow export using IPFIX",
     "note": "Apply with `ip flow monitor FM-APP input` on the interfaces you want to observe. Match fields define a flow key; collect fields are the measurements stored per flow."
    },
    {
     "type": "formula",
     "title": "Working with flow data",
     "items": [
      {
       "name": "Sampled estimate",
       "expr": "estimated bytes ≈ sampled bytes × N (for 1-in-N sampling)",
       "meaning": "Accurate for large aggregates, unreliable for small flows."
      },
      {
       "name": "Active timeout effect",
       "expr": "long flows are reported every active-timeout seconds",
       "meaning": "A 60 s timeout gives near-real-time visibility of long transfers."
      },
      {
       "name": "Average rate",
       "expr": "bits/s = (bytes × 8) ÷ (last − first timestamp)",
       "meaning": "Useful for finding the real top talkers on a congested link."
      }
     ]
    },
    {
     "type": "scenario",
     "title": "The mystery congestion",
     "situation": "A branch WAN link runs at 95% every morning from 09:00 to 10:30. SNMP interface graphs confirm the load but nobody knows the cause. Which data source answers the question fastest?",
     "options": [
      {
       "text": "Syslog messages from the branch router during the morning, filtered for interface-related events.",
       "feedback": "Syslog records events, not traffic volumes per conversation.",
       "best": false
      },
      {
       "text": "IPFIX flow records from the branch router, grouped by source, destination and port for that window.",
       "feedback": "Correct. Flow data shows who talked to whom and how much, which is exactly what interface counters cannot tell you.",
       "best": true
      },
      {
       "text": "A faster SNMP polling interval on the WAN interface so that the morning peak is graphed in more detail.",
       "feedback": "Finer graphs show the same total; they still do not identify the traffic.",
       "best": false
      },
      {
       "text": "A packet capture on the WAN link for the whole morning, analysed afterwards packet by packet.",
       "feedback": "Possible, but heavy and slow to analyse compared with flow data that already exists.",
       "best": false
      }
     ]
    },
    {
     "type": "terms",
     "items": [
      {
       "term": "SNMPv3 authPriv",
       "def": "The SNMPv3 security level that both authenticates and encrypts messages using per-user keys."
      },
      {
       "term": "IPFIX",
       "def": "IP Flow Information Export (RFC 7011): the IETF standard, template-based protocol for exporting flow records."
      },
      {
       "term": "Flow key",
       "def": "The set of match fields (for example the 5-tuple and input interface) that defines which packets belong to one flow."
      }
     ]
    },
    {
     "type": "keypoints",
     "title": "Key takeaways",
     "items": [
      "Target SNMPv3 authPriv with read-only views and source ACLs; retire clear-text v2c communities.",
      "Send syslog from a stable source with millisecond timestamps, and never stream debug output continuously.",
      "Use IPFIX flow records to answer who is talking to whom; multiply sampled counts by the sampling rate.",
      "Accurate, authenticated NTP is what makes every other signal usable."
     ]
    },
    {
     "type": "quiz",
     "items": [
      {
       "q": "Which SNMPv3 security level should be the target for production polling?",
       "options": [
        "authPriv",
        "noAuthNoPriv",
        "authNoPriv",
        "community-based v2c"
       ],
       "answer": 0,
       "explain": "authPriv authenticates and encrypts. The others leave data or identity unprotected."
      },
      {
       "q": "An engineer sends debug-level syslog continuously to the central server from 400 devices. What is the main problem?",
       "options": [
        "Severity 7 messages are never accepted by any syslog collector",
        "Severity 7 floods the collector and buries important events",
        "Debug messages are sent without timestamps to remote servers",
        "Debug level disables the local logging buffer on each device"
       ],
       "answer": 1,
       "explain": "Debug output is for short, targeted troubleshooting, not continuous export."
      },
      {
       "q": "What does a template-based flow format such as IPFIX allow that NetFlow v5 does not?",
       "options": [
        "Encryption of every flow record sent between the exporter and the collector",
        "Real-time packet payload inspection for every exported flow record",
        "Flexible, extensible fields, including IPv6 and enterprise elements",
        "Guaranteed delivery of flow records using its own retransmission"
       ],
       "answer": 2,
       "explain": "Templates describe the fields, so new information elements can be added."
      },
      {
       "q": "With 1-in-1,000 sampling, a collector sees 2 MB for a flow aggregate. Roughly how much traffic was there?",
       "options": [
        "About 2 MB",
        "About 200 MB",
        "About 2 GB",
        "About 20 GB"
       ],
       "answer": 2,
       "explain": "Multiply by the sampling rate: 2 MB × 1,000 ≈ 2 GB."
      },
      {
       "q": "Why configure a consistent logging source interface such as a loopback?",
       "options": [
        "A stable source address for every event, which eases correlation",
        "It encrypts syslog messages sent to the collector by default",
        "It raises the severity of all interface events to the critical level",
        "It allows debug messages to bypass the logging rate limiter"
       ],
       "answer": 0,
       "explain": "A stable source address makes filtering and correlation reliable regardless of which interface is used."
      }
     ]
    }
   ]
  },
  {
   "id": "m7-l2",
   "title": "Streaming Telemetry and Synthetic Testing",
   "subtitle": "Push-based, model-driven data and probes that measure what users feel",
   "minutes": 40,
   "objectives": [
    "Contrast polled and streamed telemetry and choose cadences.",
    "Subscribe to model-driven telemetry with an open-source collector.",
    "Use synthetic probes and tracking to measure and react to path quality."
   ],
   "blocks": [
    {
     "type": "text",
     "text": "SNMP polling asks each device for counters every few minutes. At modern scale that is both too slow and too expensive: problems shorter than the poll interval are invisible, and devices waste CPU answering. **Streaming telemetry** reverses the direction. Devices push structured, model-based data at a chosen cadence or on change, and collectors store it in time-series databases built for this load."
    },
    {
     "type": "compare",
     "title": "Poll or push?",
     "columns": [
      {
       "title": "Polling (SNMP)",
       "items": [
        "Collector asks, device answers",
        "Typical interval 1–5 minutes",
        "Microbursts and short flaps are missed",
        "MIBs vary between platforms"
       ]
      },
      {
       "title": "Streaming telemetry",
       "items": [
        "Device pushes on a schedule or on change",
        "Intervals of seconds, or immediate for state changes",
        "Efficient encodings over gRPC",
        "Uses YANG models, including vendor-neutral ones"
       ]
      }
     ]
    },
    {
     "type": "chart",
     "kind": "line",
     "title": "A 90-second burst inside one 5-minute poll",
     "labels": [
      "0:30",
      "1:00",
      "1:30",
      "2:00",
      "2:30",
      "3:00",
      "3:30",
      "4:00",
      "4:30",
      "5:00"
     ],
     "series": [
      {
       "name": "30 s streamed samples",
       "values": [
        32,
        35,
        34,
        96,
        99,
        97,
        38,
        33,
        36,
        34
       ]
      },
      {
       "name": "5-minute polled average",
       "values": [
        53.4,
        53.4,
        53.4,
        53.4,
        53.4,
        53.4,
        53.4,
        53.4,
        53.4,
        53.4
       ]
      }
     ],
     "unit": "%",
     "yLabel": "Utilisation",
     "caption": "Illustrative data: the link is saturated for 90 seconds, yet the 5-minute poll reports about 53.4% and raises no alarm. Streamed samples at 10–30 s show the burst and when it happened."
    },
    {
     "type": "layers",
     "title": "A telemetry stack",
     "items": [
      {
       "label": "Use",
       "parts": [
        "Dashboards",
        "Alerting and SLO reports",
        "Capacity planning"
       ]
      },
      {
       "label": "Store",
       "parts": [
        "Time-series database",
        "Retention and down-sampling policies"
       ]
      },
      {
       "label": "Collect",
       "parts": [
        "Collectors that terminate subscriptions",
        "Normalisation and tagging"
       ]
      },
      {
       "label": "Transport",
       "parts": [
        "gNMI or other gRPC-based dial-in/dial-out",
        "Protobuf or JSON encoding over TLS"
       ]
      },
      {
       "label": "Model",
       "parts": [
        "YANG paths on the device",
        "OpenConfig and native models"
       ]
      }
     ]
    },
    {
     "type": "cli",
     "device": "Collector host · gnmic",
     "lines": [
      "# credentials supplied via environment variables, TLS verified against the internal CA",
      "$ gnmic -a leaf1.dc.example:57400 --tls-ca /etc/pki/ca.pem -u telemetry \\",
      "    subscribe --path \"/interfaces/interface/state/counters\" \\",
      "    --stream-mode sample --sample-interval 10s",
      "# on-change subscription for routing state",
      "$ gnmic -a leaf1.dc.example:57400 --tls-ca /etc/pki/ca.pem -u telemetry \\",
      "    subscribe --path \"/network-instances/network-instance/protocols/protocol/bgp/neighbors/neighbor/state/session-state\" \\",
      "    --stream-mode on-change"
     ],
     "title": "Dial-in subscriptions to OpenConfig paths",
     "note": "Counters suit periodic sampling; state such as BGP session status suits on-change, so you learn of a drop within seconds without streaming unchanged values."
    },
    {
     "type": "sequence",
     "title": "A gNMI dial-in subscription",
     "actors": [
      "leaf1 (gNMI target)",
      "Collector",
      "Time-series DB"
     ],
     "steps": [
      {
       "from": 1,
       "to": 0,
       "label": "Capabilities request",
       "note": "gRPC over TLS, port 57400"
      },
      {
       "from": 0,
       "to": 1,
       "label": "Models and encodings",
       "reply": true
      },
      {
       "from": 1,
       "to": 0,
       "label": "SubscribeRequest STREAM",
       "note": "sample 10 s; on-change BGP"
      },
      {
       "from": 0,
       "to": 1,
       "label": "Full state, then sync",
       "note": "sync_response marks the end",
       "reply": true
      },
      {
       "from": 0,
       "to": 1,
       "label": "Counters every 10 s",
       "reply": true
      },
      {
       "from": 1,
       "to": 2,
       "label": "Write tagged points"
      },
      {
       "from": 0,
       "to": 1,
       "label": "On-change: BGP IDLE",
       "note": "seconds after the drop",
       "reply": true
      },
      {
       "from": 1,
       "to": 1,
       "label": "Alert rule fires"
      }
     ],
     "caption": "The collector opens one long-lived stream per device; after the initial full state it receives only samples and changes. Compare this with polling, where the collector must ask again and again and still misses what happens between polls."
    },
    {
     "type": "table",
     "head": [
      "Data",
      "Mode",
      "Typical cadence",
      "Why"
     ],
     "rows": [
      [
       "Interface counters",
       "Sample",
       "10–30 s",
       "Catches bursts that 5-minute polling averages away"
      ],
      [
       "Optical levels, CPU, memory",
       "Sample",
       "30–60 s",
       "Slow-moving, trend-oriented"
      ],
      [
       "BGP/IGP neighbour state",
       "On change",
       "Immediate",
       "Every change matters; no point repeating unchanged state"
      ],
      [
       "Interface oper status",
       "On change",
       "Immediate",
       "Drives fast alerting"
      ],
      [
       "Queue drops on critical links",
       "Sample",
       "5–10 s",
       "Short congestion events are the target"
      ]
     ],
     "title": "Choosing cadence"
    },
    {
     "type": "text",
     "text": "Telemetry tells you what devices see. **Synthetic probes** tell you what users experience. A probe sends test traffic at a fixed rate between two points and measures reachability, latency, jitter and loss continuously, even when no real user is active. The same idea powers SD-WAN path measurement, SLA reporting to the business and automatic failover."
    },
    {
     "type": "cli",
     "device": "BR7 · IOS-style CLI",
     "lines": [
      "ip sla 10",
      " icmp-echo 198.51.100.1 source-interface GigabitEthernet0/0",
      " frequency 10",
      "ip sla schedule 10 life forever start-time now",
      "track 10 ip sla 10 reachability",
      "ip route 198.51.100.1 255.255.255.255 203.0.113.1",
      "ip route 0.0.0.0 0.0.0.0 203.0.113.1 track 10",
      "ip route 0.0.0.0 0.0.0.0 192.0.2.1 250",
      "!",
      "ip sla 20",
      " udp-jitter 10.50.255.1 16384 codec g711alaw",
      " tos 184",
      " frequency 60",
      "ip sla schedule 20 life forever start-time now"
     ],
     "title": "Reachability tracking and a voice-quality probe",
     "note": "The tracked default route is withdrawn when the probe fails, and the floating static route (AD 250) takes over. The jitter probe needs a responder on the far end; `tos 184` marks probes as EF so they share the voice queue. The /32 host route pins the probe target to the primary ISP, so the probe cannot falsely succeed through the backup path."
    },
    {
     "type": "formula",
     "title": "Service-level arithmetic",
     "items": [
      {
       "name": "Availability",
       "expr": "uptime ÷ total time × 100",
       "meaning": "99.9% allows about 8.8 hours of downtime per year; 99.99% about 53 minutes."
      },
      {
       "name": "From MTBF and MTTR",
       "expr": "availability = MTBF ÷ (MTBF + MTTR)",
       "meaning": "Shortening repair time improves availability as much as reducing failures."
      },
      {
       "name": "Probe loss",
       "expr": "lost probes ÷ sent probes × 100",
       "meaning": "Use enough probes per window for the percentage to be meaningful."
      }
     ]
    },
    {
     "type": "template",
     "title": "Telemetry KPI sheet",
     "purpose": "Define every KPI once, with its source, cadence and alert rule, so dashboards and alerts are consistent across teams.",
     "columns": [
      "KPI",
      "Source and path or probe",
      "Method and cadence",
      "Alert threshold",
      "Owner"
     ],
     "example": [
      [
       "WAN link utilisation",
       "/interfaces/interface/state/counters on edge routers",
       "Stream, sample 10 s",
       "> 85% for 5 min",
       "WAN team"
      ],
      [
       "Branch-to-DC voice quality",
       "UDP jitter probe BR→DC, EF marked",
       "Probe every 60 s",
       "Jitter > 30 ms or loss > 1% for 3 intervals",
       "UC team"
      ]
     ],
     "rows": 8
    },
    {
     "type": "case",
     "title": "A telecom NOC moves from polling to streaming",
     "context": "A mobile operator's NOC polls 6,000 routers by SNMP every five minutes. Customers report brief outages that the NOC never sees, the polling servers are overloaded, and every vendor platform needs different MIB handling. The operator wants near-real-time visibility within a year.",
     "questions": [
      "Which data would you move to streaming first, and at what cadence?",
      "How would you handle platforms that cannot stream yet?",
      "What changes in storage and alerting are needed?",
      "How would you prove the new system detects more incidents?"
     ],
     "answer": "Start with high-value, fast-changing data: interface counters and queue drops on aggregation and core links (10–30 s sampling), and on-change subscriptions for interface, BGP and IGP neighbour state. Prefer OpenConfig paths to reduce per-platform differences, falling back to native models where needed. Keep SNMP for legacy platforms but tighten it to SNMPv3 and reduce the polled set. Collectors scale horizontally behind a load balancer and write to a time-series database with tiered retention (raw for days, down-sampled for months). Alerting moves from single thresholds to rules over windows, deduplicated per service. Prove value by running both systems in parallel for a quarter and comparing incidents detected, time to detect and false alarms, and by replaying known customer-reported outages."
    },
    {
     "type": "scenario",
     "title": "Brief outages nobody sees",
     "situation": "Customers report one-minute outages on a metro ring several times a week. Five-minute SNMP graphs look flat and no tickets are raised automatically. What is the best improvement?",
     "options": [
      {
       "text": "On-change telemetry for interface and neighbour state, plus ring counters streamed every 10–30 s.",
       "feedback": "Correct. Short events are invisible to five-minute polling; on-change state and fine-grained sampling expose them.",
       "best": true
      },
      {
       "text": "Reduce the SNMP polling interval to 30 seconds for all 6,000 devices to catch the short outages.",
       "feedback": "This multiplies load on devices and pollers and still misses state changes between polls.",
       "best": false
      },
      {
       "text": "Ask customers to log the exact time of each outage so that the NOC can correlate it afterwards.",
       "feedback": "Useful anecdotally, but it does not create monitoring.",
       "best": false
      },
      {
       "text": "Increase syslog severity to debug on all ring routers so that every short event is fully recorded.",
       "feedback": "Debug floods logs and risks device stability; it is not monitoring.",
       "best": false
      }
     ]
    },
    {
     "type": "terms",
     "items": [
      {
       "term": "Streaming telemetry",
       "def": "Model-driven data that devices push to collectors periodically or on change, instead of being polled."
      },
      {
       "term": "On-change subscription",
       "def": "A telemetry subscription that sends an update only when the subscribed value changes."
      },
      {
       "term": "Synthetic probe",
       "def": "Test traffic generated at a fixed rate to measure reachability, latency, jitter and loss between two points."
      }
     ]
    },
    {
     "type": "keypoints",
     "title": "Key takeaways",
     "items": [
      "Streaming telemetry pushes model-based data at seconds-level cadence or on change, over gRPC with TLS.",
      "Sample counters every 10–30 s; subscribe to neighbour and interface state on change.",
      "Synthetic probes measure what users experience, even when no user is active.",
      "Pin probe targets to the path they test, and mark probes like the traffic they represent."
     ]
    },
    {
     "type": "quiz",
     "items": [
      {
       "q": "Which subscription mode best suits BGP neighbour session state?",
       "options": [
        "Sample every 10 seconds",
        "Sample every 5 minutes",
        "Once",
        "On change"
       ],
       "answer": 3,
       "explain": "State changes are rare but important; on-change reports them immediately without repeating unchanged data."
      },
      {
       "q": "A default route tracks an ICMP probe to the ISP. What happens when the probe fails?",
       "options": [
        "The router reloads its WAN interface to try to recover the ISP link quickly",
        "The tracked route is withdrawn and the floating static route takes over",
        "The probe automatically switches to probing the backup ISP instead",
        "Both default routes stay installed and traffic is load-balanced"
       ],
       "answer": 1,
       "explain": "Tracking ties route installation to probe state; the higher-AD floating route becomes active."
      },
      {
       "q": "Why is a UDP jitter probe marked with ToS 184?",
       "options": [
        "So the probe bypasses every QoS policy along the path to the far end",
        "So it is queued like EF voice and measures what voice experiences",
        "So the far-end responder can authenticate the probe packets it receives",
        "So routers treat the probe as control-plane traffic and police it"
       ],
       "answer": 1,
       "explain": "ToS 184 equals DSCP 46 (EF); probes should experience the same treatment as the traffic they represent."
      },
      {
       "q": "A service has MTBF of 999 hours and MTTR of 1 hour. What is its availability?",
       "options": [
        "99.9%",
        "99%",
        "99.99%",
        "99.5%"
       ],
       "answer": 0,
       "explain": "999 ÷ (999 + 1) = 0.999."
      },
      {
       "q": "What is the main limitation of five-minute SNMP polling for interface utilisation?",
       "options": [
        "SNMP cannot report interface byte counters on modern devices",
        "SNMPv3 encryption makes interface counters inaccurate over time",
        "Short bursts and brief outages are averaged away between polls",
        "Polling requires every device to support streaming telemetry first"
       ],
       "answer": 2,
       "explain": "Averages over five minutes hide microbursts and short events."
      }
     ]
    }
   ]
  },
  {
   "id": "m7-l3",
   "title": "Structured Troubleshooting",
   "subtitle": "A repeatable method that finds root cause faster and leaves evidence behind",
   "minutes": 35,
   "objectives": [
    "Apply a structured troubleshooting process from problem definition to documentation.",
    "Select an approach (top-down, bottom-up, divide-and-conquer, follow-the-path) for a given symptom.",
    "Use per-VRF and overlay-aware commands to isolate a fault across the Fabric."
   ],
   "blocks": [
    {
     "type": "text",
     "text": "Senior engineers are not faster because they know more commands. They are faster because they follow a method: they define the problem precisely, gather facts before forming opinions, test one hypothesis at a time and leave a trail others can follow. At ZCNP level, the network spans VRFs, tunnels, fabrics and wireless, so a method matters even more."
    },
    {
     "type": "cycle",
     "title": "The structured troubleshooting cycle",
     "center": "Evidence over opinion",
     "items": [
      {
       "label": "Define",
       "text": "who is affected, what exactly fails, since when, what changed?"
      },
      {
       "label": "Gather",
       "text": "collect facts: telemetry, logs, configs, traces, baselines"
      },
      {
       "label": "Analyse",
       "text": "compare with the baseline and with working cases"
      },
      {
       "label": "Hypothesise",
       "text": "rank likely causes; pick the most likely and cheapest to test"
      },
      {
       "label": "Test and fix",
       "text": "change one thing, with a rollback ready"
      },
      {
       "label": "Verify",
       "text": "confirm the original symptom is gone and nothing else broke"
      },
      {
       "label": "Document",
       "text": "record cause, fix and prevention; update runbooks and monitoring"
      }
     ],
     "caption": "Documentation closes the loop: each incident should leave behind a better runbook, a new alert or a test, so the next one is shorter. If a test or fix fails, go back to analysis rather than piling on changes."
    },
    {
     "type": "table",
     "head": [
      "Approach",
      "How it works",
      "Best when"
     ],
     "rows": [
      [
       "Top-down",
       "Start at the application and work down the layers",
       "One application fails while others work"
      ],
      [
       "Bottom-up",
       "Start at physical and work up",
       "Many services fail on one link or device"
      ],
      [
       "Divide and conquer",
       "Start in the middle (e.g. can you ping the gateway?) and go up or down",
       "Symptoms are vague; quickest to halve the search space"
      ],
      [
       "Follow the path",
       "Trace hop by hop, both directions",
       "Multi-hop, overlay or asymmetric routing problems"
      ],
      [
       "Spot the difference",
       "Compare a failing case with a working one",
       "Similar sites or devices behave differently"
      ]
     ],
     "title": "Choosing an approach"
    },
    {
     "type": "steps",
     "title": "Worked example: a branch cannot reach an application",
     "items": [
      {
       "title": "Define",
       "text": "Branch 7 users (10.70.7.0/24, VRF CORP) cannot reach the HR application at 10.50.8.20 since last night's change window. Other branches are fine."
      },
      {
       "title": "Gather",
       "text": "Change records show a DC routing-policy update. Branch telemetry shows the SD-WAN tunnel up."
      },
      {
       "title": "Follow the path",
       "text": "From the branch, a VRF-aware traceroute reaches the hub and then times out."
      },
      {
       "title": "Check the return path",
       "text": "On the DC core, the branch prefix is missing from VRF CORP."
      },
      {
       "title": "Fix and verify",
       "text": "The new import policy omitted Branch 7's route target. Correct it, confirm the route, test the application, then document."
      }
     ]
    },
    {
     "type": "cli",
     "device": "Branch and DC · IOS-style CLI",
     "lines": [
      "BR7# traceroute vrf CORP 10.50.8.20 source Loopback10",
      "  1 172.31.7.1 2 msec 1 msec 2 msec",
      "  2 10.50.255.1 3 msec 3 msec 4 msec",
      "  3  *  *  *",
      "  4  *  *  *",
      "!",
      "DC-CORE1# show ip route vrf CORP 10.70.7.0",
      "% Subnet not in table",
      "DC-CORE1# show bgp vpnv4 unicast vrf CORP 10.70.7.0/24",
      "% Network not in table"
     ],
     "title": "Following the path in both directions",
     "note": "Forward traffic reaches the DC; replies have no route back. Always check the return path; most 'one-way' failures live there."
    },
    {
     "type": "keypoints",
     "items": [
      "Baselines: normal utilisation, latency, routing table sizes and neighbour counts.",
      "Change records: what changed in the last 24–72 hours, including automated changes.",
      "Telemetry and logs, aligned to the same clock.",
      "Configuration history from version control, to diff against the last known good state.",
      "Topology and design documents, including VRF and route-target plans."
     ],
     "title": "Sources of truth while troubleshooting"
    },
    {
     "type": "callout",
     "kind": "warning",
     "text": "Changing several things at once may make the symptom disappear without telling you why, and may hide a second fault. Record each change, test, and roll back if it did not help.",
     "title": "One change at a time, with a way back"
    },
    {
     "type": "callout",
     "kind": "insight",
     "title": "AI-assisted assurance, human-verified",
     "text": "Assurance platforms increasingly add machine-learned baselines, anomaly detection and natural-language incident summaries. Treat their output as a **hypothesis generator**: it can rank suspects and assemble evidence quickly, but it can be wrong with confidence. Verify every suggestion against telemetry, logs and configuration before acting, keep a human approving any change, and record which suggestions proved right so you know how far to trust the tool."
    },
    {
     "type": "table",
     "head": [
      "Symptom",
      "First suspect"
     ],
     "rows": [
      [
       "Everything at one site down",
       "Physical, power, transport, tunnel endpoint routing"
      ],
      [
       "One application unreachable from many sites",
       "Application, DNS, firewall or DC routing policy"
      ],
      [
       "Works for small packets, fails for large",
       "MTU in tunnels, VXLAN underlay or IPsec"
      ],
      [
       "Intermittent, at regular intervals",
       "Recursive routing, timers, flapping links, scheduled jobs"
      ],
      [
       "Only wireless users affected",
       "RF, roaming domain, RADIUS, DHCP scope for the WLAN"
      ],
      [
       "Only after authentication",
       "RADIUS policy: wrong VLAN, ACL or group assigned"
      ]
     ],
     "title": "Symptom to first place to look"
    },
    {
     "type": "checklist",
     "title": "Troubleshooting discipline checklist",
     "items": [
      "Problem statement written: who, what, where, since when.",
      "Recent changes checked, including automated pipeline runs.",
      "Scope confirmed with a working comparison case.",
      "Path tested in both directions, in the correct VRF.",
      "Each hypothesis tested with one change and a rollback ready.",
      "Fix verified against the original symptom and by the affected users.",
      "Root cause, fix and prevention recorded; monitoring updated to catch it next time."
     ]
    },
    {
     "type": "scenario",
     "title": "Where do you start?",
     "situation": "After a planned change, users at all 30 branches can browse the internet but cannot reach one internal ERP application in the data centre. Other internal applications work. What approach and first step make the most sense?",
     "options": [
      {
       "text": "Bottom-up: check the cabling and interface error counters at every one of the 30 branches first.",
       "feedback": "All branches reach other applications, so their physical layers are fine.",
       "best": false
      },
      {
       "text": "Reload the WAN hub routers first to clear any stale state left behind by the planned change.",
       "feedback": "This causes a wider outage and destroys evidence.",
       "best": false
      },
      {
       "text": "Open a ticket with the internet provider, because a change in their network may be the cause.",
       "feedback": "Internet access works, and the ERP is internal.",
       "best": false
      },
      {
       "text": "Top-down: check the ERP service, its DNS record and the DC firewall and routing changes first.",
       "feedback": "Correct. One application failing from everywhere points to something shared near the application, not to branch links.",
       "best": true
      }
     ]
    },
    {
     "type": "reflection",
     "prompt": "Recall the last difficult incident you worked on. Which step of the structured cycle did you skip or rush, and what would you do differently with a written method?"
    },
    {
     "type": "terms",
     "items": [
      {
       "term": "Baseline",
       "def": "Recorded normal behaviour (utilisation, latency, table sizes) used to judge whether current data is abnormal."
      },
      {
       "term": "Follow-the-path",
       "def": "A troubleshooting approach that checks forwarding hop by hop in both directions along the traffic's route."
      },
      {
       "term": "MTTR",
       "def": "Mean time to repair: the average time from detecting a failure to restoring service."
      }
     ]
    },
    {
     "type": "keypoints",
     "title": "Key takeaways",
     "items": [
      "Follow the cycle: define, gather, analyse, hypothesise, test and fix, verify, document.",
      "Choose the approach from the symptom: bottom-up for one device, top-down for one app, follow the path for multi-hop.",
      "Always test the path in both directions and in the correct VRF.",
      "Change one thing at a time with a rollback ready, and treat AI suggestions as hypotheses to verify."
     ]
    },
    {
     "type": "quiz",
     "items": [
      {
       "q": "Many services fail for every user behind one access switch. Which approach is usually fastest?",
       "options": [
        "Top-down, starting with each of the affected applications in turn",
        "Spot the difference against an unrelated data-centre switch",
        "Follow the path from the internet edge to the user subnet",
        "Bottom-up, starting with physical and link checks on that switch"
       ],
       "answer": 3,
       "explain": "Widespread failure on one device suggests lower-layer issues; start there."
      },
      {
       "q": "A traceroute in the correct VRF reaches the DC core and then times out. What should you check next?",
       "options": [
        "Whether the source branch router has a working default route",
        "Whether the traceroute was run using the global routing table",
        "Whether the branch Wi-Fi uses WPA3-Enterprise with PMF enabled",
        "Whether the DC has a route back to the source in the same VRF"
       ],
       "answer": 3,
       "explain": "Forward progress to the core means the problem is likely on the return path."
      },
      {
       "q": "Why change only one variable at a time when testing a hypothesis?",
       "options": [
        "Because devices reject more than one configuration change per minute",
        "So you know which change fixed it and can roll back the rest",
        "Because change records only allow one line per incident ticket",
        "Because monitoring tools cannot display several changes together"
       ],
       "answer": 1,
       "explain": "Multiple simultaneous changes hide cause and effect."
      },
      {
       "q": "Which data source best supports a 'what changed?' question during an incident?",
       "options": [
        "The current running configuration of the device that is being investigated",
        "Five-minute SNMP utilisation graphs for the affected interfaces",
        "Version-controlled config history plus change and pipeline records",
        "Customer descriptions of when they first noticed the problem"
       ],
       "answer": 2,
       "explain": "Diffs against the last known good state show exactly what changed and when."
      },
      {
       "q": "Small pings across an overlay succeed but file transfers stall. Which suspect comes first?",
       "options": [
        "An MTU or MSS problem in the tunnel or VXLAN underlay",
        "A routing loop between the two sites that drops large packets",
        "An SNMPv3 authentication mismatch on the edge routers",
        "A spanning-tree topology change on the access layer"
       ],
       "answer": 0,
       "explain": "Size-dependent failure is the signature of MTU problems."
      }
     ]
    }
   ]
  },
  {
   "id": "m7-l4",
   "title": "Network Access Control: 802.1X, MAB and Dynamic Segmentation",
   "subtitle": "Identity at the edge port, policy from RADIUS, and a safe rollout path",
   "minutes": 40,
   "objectives": [
    "Explain the 802.1X roles and the fallback to MAC Authentication Bypass.",
    "Configure a switch port for 802.1X with MAB and change of authorisation.",
    "Design dynamic segmentation with RADIUS-assigned VLANs, ACLs or group tags, and roll it out in phases."
   ],
   "blocks": [
    {
     "type": "text",
     "text": "Every network port is a door. **802.1X** makes the device prove who it is before the door opens, and **RADIUS** returns not just yes or no but **policy**: which segment, which ACL, which group. Devices that cannot run a supplicant, such as printers or cameras, use **MAC Authentication Bypass (MAB)**, which must be paired with profiling and tight policy because MAC addresses are easy to spoof."
    },
    {
     "type": "layers",
     "title": "802.1X roles",
     "items": [
      {
       "label": "Policy and identity",
       "parts": [
        "Directory and certificate authority",
        "Device profiling and posture data"
       ]
      },
      {
       "label": "Authentication server",
       "parts": [
        "RADIUS server evaluates identity and returns policy"
       ]
      },
      {
       "label": "Authenticator",
       "parts": [
        "Switch port or WLAN; relays EAP over RADIUS and enforces the result"
       ]
      },
      {
       "label": "Supplicant",
       "parts": [
        "Software on the endpoint that speaks EAP over LAN (EAPOL)"
       ]
      }
     ]
    },
    {
     "type": "sequence",
     "title": "A printer plugs in: 802.1X, MAB fallback and CoA",
     "actors": [
      "Printer",
      "Access switch",
      "RADIUS server"
     ],
     "steps": [
      {
       "from": 0,
       "to": 1,
       "label": "Link up",
       "note": "port allows EAPOL only"
      },
      {
       "from": 1,
       "to": 0,
       "label": "EAP-Request/Identity",
       "note": "repeated every tx-period"
      },
      {
       "from": 1,
       "to": 0,
       "label": "EAP-Request/Identity",
       "note": "no supplicant answers"
      },
      {
       "from": 1,
       "to": 1,
       "label": "Fall back to MAB"
      },
      {
       "from": 1,
       "to": 2,
       "label": "Access-Request (MAC)",
       "note": "identity = MAC address"
      },
      {
       "from": 2,
       "to": 2,
       "label": "Profile match: printer"
      },
      {
       "from": 2,
       "to": 1,
       "label": "Access-Accept + policy",
       "note": "VLAN, ACL or group tag",
       "reply": true
      },
      {
       "from": 1,
       "to": 1,
       "label": "Apply policy, open port"
      },
      {
       "from": 2,
       "to": 1,
       "label": "CoA: reauthenticate",
       "note": "profile changed (RFC 5176)"
      },
      {
       "from": 1,
       "to": 2,
       "label": "CoA-ACK",
       "reply": true
      }
     ],
     "caption": "A device with a supplicant would answer step 2 and complete EAP instead. The short tx-period controls how long the printer waits before MAB starts, and CoA lets the policy server change the session later without anyone touching the switch."
    },
    {
     "type": "cli",
     "device": "SW-ACC1 · IOS-style CLI",
     "lines": [
      "aaa new-model",
      "radius server NAC-1",
      " address ipv4 10.10.60.10 auth-port 1812 acct-port 1813",
      " key <from-secrets-vault>",
      "aaa group server radius NAC-GRP",
      " server name NAC-1",
      "aaa authentication dot1x default group NAC-GRP",
      "aaa authorization network default group NAC-GRP",
      "aaa accounting dot1x default start-stop group NAC-GRP",
      "aaa server radius dynamic-author",
      " client 10.10.60.10 server-key <from-secrets-vault>",
      "dot1x system-auth-control"
     ],
     "title": "Global AAA, RADIUS and CoA",
     "note": "Add a second RADIUS server in the group for resilience. `dynamic-author` lets the policy server send CoA messages (RFC 5176) to re-authorise or disconnect sessions."
    },
    {
     "type": "cli",
     "device": "SW-ACC1 · IOS-style CLI",
     "lines": [
      "interface GigabitEthernet1/0/5",
      " switchport mode access",
      " switchport access vlan 100",
      " switchport voice vlan 200",
      " authentication host-mode multi-domain",
      " authentication order dot1x mab",
      " authentication priority dot1x mab",
      " authentication port-control auto",
      " authentication periodic",
      " authentication timer reauthenticate server",
      " mab",
      " dot1x pae authenticator",
      " dot1x timeout tx-period 10",
      " spanning-tree portfast"
     ],
     "title": "Access port with 802.1X, MAB fallback and a phone",
     "note": "Multi-domain allows one voice device and one data device. The shorter tx-period speeds up fallback to MAB for devices without a supplicant."
    },
    {
     "type": "table",
     "head": [
      "Mode",
      "Behaviour",
      "Use"
     ],
     "rows": [
      [
       "Single-host",
       "One authenticated MAC per port",
       "Highest assurance desktops"
      ],
      [
       "Multi-domain",
       "One voice and one data device, each authenticated",
       "Phone with a PC behind it"
      ],
      [
       "Multi-auth",
       "Every MAC authenticates separately (one voice VLAN device)",
       "Unmanaged hubs or virtual machines on a port"
      ],
      [
       "Multi-host",
       "First device authenticates; others ride along",
       "Rarely acceptable; weakest option"
      ]
     ],
     "title": "Host modes"
    },
    {
     "type": "steps",
     "title": "Rolling out access control without outages",
     "items": [
      {
       "title": "Monitor mode",
       "text": "Authenticate everything but allow all traffic (open authentication). Learn which devices fail and why."
      },
      {
       "title": "Fix the gaps",
       "text": "Deploy supplicant profiles and certificates; profile and register MAB devices."
      },
      {
       "title": "Low-impact mode",
       "text": "Keep the port open with a pre-authentication ACL allowing only essentials (DHCP, DNS, PXE) until authentication succeeds."
      },
      {
       "title": "Closed mode",
       "text": "Nothing but EAPOL until authorised, for areas where risk justifies it."
      },
      {
       "title": "Operate",
       "text": "Watch failure dashboards, keep the endpoint inventory current and review policies quarterly."
      }
     ]
    },
    {
     "type": "table",
     "head": [
      "Result",
      "How it is signalled",
      "Effect"
     ],
     "rows": [
      [
       "VLAN assignment",
       "Tunnel-Type = VLAN (13), Tunnel-Medium-Type = 802 (6), Tunnel-Private-Group-ID = VLAN",
       "Port placed in the returned VLAN"
      ],
      [
       "Named ACL",
       "Filter-Id names an ACL defined on the switch",
       "Traffic filtered per session"
      ],
      [
       "Downloadable ACL",
       "Platform-specific attributes carry the ACL entries",
       "Central ACL management"
      ],
      [
       "Group tag",
       "Platform-specific attribute assigns a group identifier",
       "Group-based policy enforced across the fabric"
      ],
      [
       "Re-authentication timer",
       "Session-Timeout with Termination-Action",
       "Forces periodic re-authentication"
      ]
     ],
     "title": "RADIUS authorisation results"
    },
    {
     "type": "compare",
     "title": "Two ways to segment dynamically",
     "columns": [
      {
       "title": "VLAN and ACL based",
       "items": [
        "Identity mapped to a VLAN and an IP subnet",
        "Policy written as IP ACLs",
        "Works on almost any hardware",
        "Rules multiply as subnets and groups grow"
       ]
      },
      {
       "title": "Group-based policy",
       "items": [
        "Identity mapped to a group tag carried with the traffic",
        "Policy is a matrix: group to group, allow or deny",
        "Independent of IP addressing",
        "Needs end-to-end support for carrying or mapping tags"
       ]
      }
     ]
    },
    {
     "type": "callout",
     "kind": "warning",
     "text": "A MAC address is printed on the label and easy to clone. Treat MAB devices as low trust: profile them, give them only the access they need (a printer reaches print servers, not the finance VLAN), and alert when a known MAC appears with an unexpected profile.",
     "title": "MAB is not authentication"
    },
    {
     "type": "callout",
     "kind": "pro",
     "title": "Protect RADIUS itself",
     "text": "Classic RADIUS over UDP relies on an MD5-based shared secret. After the 2024 'BlastRADIUS' disclosure showed that responses could be forged by an on-path attacker, the recommended mitigations are to require the Message-Authenticator attribute on every request and response, apply vendor patches, and move RADIUS traffic onto TLS (RADIUS over TLS, also called RadSec) or an isolated management network. Treat your NAC traffic as critical infrastructure."
    },
    {
     "type": "scenario",
     "title": "Printers vanished after enforcement",
     "situation": "After moving a floor from monitor to closed mode, every network printer is offline. 802.1X laptops work. Logs show printers time out on 802.1X and never try MAB within the switch's limits. What is the best fix?",
     "options": [
      {
       "text": "Return the whole floor to monitor mode permanently so that printers and laptops both work again.",
       "feedback": "This abandons enforcement instead of fixing the specific gap.",
       "best": false
      },
      {
       "text": "Put the printers on multi-host ports behind the nearest laptop so they share its session.",
       "feedback": "Multi-host lets unauthenticated devices ride on another's session, which defeats the control.",
       "best": false
      },
      {
       "text": "Install a supplicant and certificate on every printer immediately so they can do 802.1X.",
       "feedback": "Most printers cannot run one, and it would not restore service quickly.",
       "best": false
      },
      {
       "text": "Enable MAB with a short tx-period for fast fallback, and map printer MACs to a printer policy.",
       "feedback": "Correct. Printers have no supplicant; they depend on fast MAB fallback and a matching policy.",
       "best": true
      }
     ]
    },
    {
     "type": "terms",
     "items": [
      {
       "term": "Supplicant",
       "def": "The endpoint software that performs 802.1X authentication using EAP over LAN."
      },
      {
       "term": "MAB",
       "def": "MAC Authentication Bypass: using a device's MAC address as its identity when it cannot run 802.1X."
      },
      {
       "term": "Change of Authorisation (CoA)",
       "def": "A RADIUS message (RFC 5176) from the policy server that changes or ends an existing session's authorisation."
      }
     ]
    },
    {
     "type": "keypoints",
     "title": "Key takeaways",
     "items": [
      "802.1X roles: supplicant, authenticator and RADIUS server, which returns policy as well as a decision.",
      "MAB proves only a MAC address: profile those devices and give them narrow access.",
      "Roll out in phases: monitor, fix gaps, low-impact, then closed where risk justifies it.",
      "Use CoA for dynamic changes, and harden RADIUS with Message-Authenticator and TLS transport."
     ]
    },
    {
     "type": "quiz",
     "items": [
      {
       "q": "In 802.1X, which component enforces the policy returned by RADIUS?",
       "options": [
        "The supplicant software running on the endpoint",
        "The directory that stores the user's account",
        "The certificate authority that issued the client certificate",
        "The authenticator, such as the switch port or WLAN"
       ],
       "answer": 3,
       "explain": "The authenticator relays EAP and then enforces the result."
      },
      {
       "q": "A desk has an IP phone with a PC behind it, each authenticating separately. Which host mode fits?",
       "options": [
        "Single-host",
        "Multi-domain",
        "Multi-host",
        "Open authentication only"
       ],
       "answer": 1,
       "explain": "Multi-domain allows one voice and one data session on the port."
      },
      {
       "q": "What is the purpose of monitor mode in an access-control rollout?",
       "options": [
        "To block every device until administrators approve each MAC address",
        "To disable RADIUS accounting temporarily so the policy server is not overloaded",
        "Authenticate everything without blocking, to reveal failures first",
        "To mirror all user traffic to a monitoring appliance for inspection"
       ],
       "answer": 2,
       "explain": "Monitor mode gives visibility with no user impact, so gaps can be fixed first."
      },
      {
       "q": "Which RADIUS attribute carries the VLAN identifier in a dynamic VLAN assignment?",
       "options": [
        "Tunnel-Private-Group-ID",
        "Filter-Id",
        "Session-Timeout",
        "Chargeable-User-Identity"
       ],
       "answer": 0,
       "explain": "Tunnel-Type and Tunnel-Medium-Type set the VLAN context; Tunnel-Private-Group-ID carries the VLAN."
      },
      {
       "q": "Why should MAB-authenticated devices get narrowly scoped access?",
       "options": [
        "MAB sessions cannot be re-authenticated after the first login",
        "MAB uses an encryption method that is too weak for most traffic",
        "MAB devices can only reach the RADIUS server and nothing else",
        "MAC addresses are easy to spoof, so identity confidence is low"
       ],
       "answer": 3,
       "explain": "MAB proves little; limit the blast radius with tight policy and profiling."
      }
     ]
    }
   ]
  },
  {
   "id": "m7-l5",
   "title": "Infrastructure Protection: CoPP, Hardening and iACLs",
   "subtitle": "Protect the control and management planes before an attacker or a storm tests them",
   "minutes": 35,
   "objectives": [
    "Identify management, control and data plane threats and controls.",
    "Build and roll out a control-plane policing policy safely.",
    "Apply a hardening baseline and an infrastructure ACL at the network edge."
   ],
   "blocks": [
    {
     "type": "text",
     "text": "Routers and switches are targets in their own right. A flood of packets aimed at a device's CPU can drop routing adjacencies and take a site offline even when links are healthy. Infrastructure protection treats each **plane** separately: lock down how people and tools manage the device, protect the protocols that keep it in the network, and filter traffic that has no business reaching the device at all."
    },
    {
     "type": "layers",
     "title": "Planes and their protection",
     "items": [
      {
       "label": "Management plane",
       "parts": [
        "SSH only, AAA with TACACS+ or RADIUS",
        "Management VRF or out-of-band network",
        "Source-restricted access"
       ]
      },
      {
       "label": "Control plane",
       "parts": [
        "Control-plane policing (CoPP)",
        "Routing protocol authentication",
        "Maximum-prefix and neighbour limits"
       ]
      },
      {
       "label": "Data plane",
       "parts": [
        "Infrastructure ACLs at the edge",
        "Unicast RPF and anti-spoofing",
        "Storm control and DHCP/ARP protection at access"
       ]
      }
     ]
    },
    {
     "type": "topology",
     "title": "Where the iACL and CoPP act",
     "nodes": [
      {
       "id": "att",
       "kind": "attacker",
       "label": "Flood source",
       "x": 1,
       "y": 0,
       "sub": "spoofed or botnet"
      },
      {
       "id": "isp",
       "kind": "router",
       "label": "ISP-A",
       "x": 4,
       "y": 0,
       "sub": "203.0.113.1"
      },
      {
       "id": "edge",
       "kind": "router",
       "label": "R-EDGE1",
       "x": 2.5,
       "y": 1.5,
       "sub": "IACL-IN on Gi0/0"
      },
      {
       "id": "core",
       "kind": "router",
       "label": "R1",
       "x": 2.5,
       "y": 3,
       "sub": "CoPP on control plane"
      },
      {
       "id": "noc",
       "kind": "monitor",
       "label": "NOC",
       "x": 4.5,
       "y": 3,
       "sub": "10.10.50.0/24"
      },
      {
       "id": "srv",
       "kind": "server",
       "label": "Transit services",
       "x": 1,
       "y": 4.5,
       "sub": "customer traffic"
      }
     ],
     "links": [
      {
       "a": "att",
       "b": "edge",
       "label": "to 198.51.100.x: denied",
       "style": "attack"
      },
      {
       "a": "isp",
       "b": "edge",
       "label": "eBGP: permitted"
      },
      {
       "a": "edge",
       "b": "core"
      },
      {
       "a": "noc",
       "b": "core",
       "label": "SSH, SNMPv3"
      },
      {
       "a": "core",
       "b": "srv",
       "label": "transit"
      }
     ],
     "caption": "The infrastructure ACL drops traffic aimed at device addresses at the border while letting transit traffic and the BGP session through. Whatever still reaches a CPU, including traffic from inside, meets CoPP, which keeps routing protocols alive under load."
    },
    {
     "type": "cli",
     "device": "R1 · IOS-style CLI",
     "lines": [
      "ip access-list extended COPP-ACL-ROUTING",
      " permit tcp any any eq bgp",
      " permit tcp any eq bgp any",
      " permit ospf any any",
      "ip access-list extended COPP-ACL-MGMT",
      " permit tcp 10.10.50.0 0.0.0.255 any eq 22",
      " permit udp 10.10.50.0 0.0.0.255 any eq snmp",
      "!",
      "class-map match-any COPP-ROUTING",
      " match access-group name COPP-ACL-ROUTING",
      "class-map match-any COPP-MGMT",
      " match access-group name COPP-ACL-MGMT"
     ],
     "title": "CoPP classification",
     "note": "Classes should reflect how important the traffic is to keeping the device in the network, from routing protocols down to everything else."
    },
    {
     "type": "cli",
     "device": "R1 · IOS-style CLI",
     "lines": [
      "policy-map COPP-POLICY",
      " class COPP-ROUTING",
      "  police 2000000 conform-action transmit exceed-action transmit",
      " class COPP-MGMT",
      "  police 512000 conform-action transmit exceed-action drop",
      " class class-default",
      "  police 256000 conform-action transmit exceed-action drop",
      "!",
      "control-plane",
      " service-policy input COPP-POLICY",
      "!",
      "R1# show policy-map control-plane input class class-default"
     ],
     "title": "CoPP policy applied to the control plane",
     "note": "Routing is set to transmit on exceed while you baseline it; never drop routing traffic until you know its real peak. Counters on `class-default` reveal traffic you did not classify."
    },
    {
     "type": "steps",
     "title": "Rolling out CoPP safely",
     "items": [
      {
       "title": "Inventory",
       "text": "List every protocol the device must process: routing, management, monitoring, first-hop redundancy, DHCP relay."
      },
      {
       "title": "Classify",
       "text": "Build ACLs and classes from that list, with a catch-all class."
      },
      {
       "title": "Baseline",
       "text": "Apply with exceed-action transmit and collect conform/exceed counters through busy periods and failovers."
      },
      {
       "title": "Enforce",
       "text": "Set rates above observed peaks with headroom; switch exceed to drop for lower classes first."
      },
      {
       "title": "Monitor",
       "text": "Alert on exceed counters; review after topology or protocol changes."
      }
     ]
    },
    {
     "type": "cli",
     "device": "Internet edge R-EDGE1 · IOS-style CLI",
     "lines": [
      "ip access-list extended IACL-IN",
      " remark anti-spoofing",
      " deny ip 10.0.0.0 0.255.255.255 any",
      " deny ip 172.16.0.0 0.15.255.255 any",
      " deny ip 192.168.0.0 0.0.255.255 any",
      " deny ip 198.51.100.0 0.0.0.255 any",
      " remark required protocols to infrastructure",
      " permit tcp host 203.0.113.1 host 203.0.113.2 eq bgp",
      " permit tcp host 203.0.113.1 eq bgp host 203.0.113.2",
      " permit icmp any 198.51.100.0 0.0.0.255 packet-too-big",
      " remark protect infrastructure, permit transit",
      " deny ip any 198.51.100.0 0.0.0.255",
      " deny ip any host 203.0.113.2",
      " permit ip any any",
      "!",
      "interface GigabitEthernet0/0",
      " ip access-group IACL-IN in"
     ],
     "title": "Infrastructure ACL on the upstream interface",
     "note": "198.51.100.0/24 is the infrastructure block (loopbacks and links); 203.0.113.0/30 is the ISP peering link. Customer and user traffic transits freely; only the devices themselves are shielded."
    },
    {
     "type": "cli",
     "device": "R1 · IOS-style CLI",
     "lines": [
      "no ip http server",
      "no ip http secure-server",
      "ip ssh version 2",
      "enable algorithm-type scrypt secret <from-secrets-vault>",
      "login block-for 120 attempts 5 within 60",
      "aaa authentication login default group TACACS-GRP local",
      "line vty 0 15",
      " access-class VTY-MGMT in",
      " transport input ssh",
      " exec-timeout 10 0",
      "interface GigabitEthernet0/0",
      " no ip proxy-arp",
      " no ip redirects",
      " no lldp transmit"
     ],
     "title": "A hardening baseline excerpt",
     "note": "Disable the web server only if no tool depends on it. Keep a local break-glass account for when AAA servers are unreachable, stored in the secrets vault."
    },
    {
     "type": "table",
     "head": [
      "Theme",
      "Examples"
     ],
     "rows": [
      [
       "Access",
       "SSH only, AAA with per-user accounts, source-restricted VTY, session timeouts, login rate limits"
      ],
      [
       "Services",
       "Disable unused services (HTTP, discovery protocols on external interfaces, proxy ARP, redirects)"
      ],
      [
       "Integrity",
       "Signed software images, secure boot where available, configuration archive in version control"
      ],
      [
       "Protocols",
       "Routing protocol authentication, BGP maximum-prefix, TTL security for external peers"
      ],
      [
       "Visibility",
       "Accurate NTP, central syslog, SNMPv3, accounting of commands via AAA"
      ]
     ],
     "title": "Hardening baseline themes"
    },
    {
     "type": "scenario",
     "title": "Routing flaps during an attack",
     "situation": "During a traffic flood aimed at a core router's interface addresses, OSPF and BGP sessions drop and recover repeatedly. Links are not saturated. The router has no CoPP or infrastructure ACL. What is the best long-term protection?",
     "options": [
      {
       "text": "Increase OSPF and BGP hold timers on all core routers so that sessions survive much longer during floods.",
       "feedback": "Longer timers only delay detection of real failures and do not protect the CPU.",
       "best": false
      },
      {
       "text": "An edge infrastructure ACL to stop traffic to device addresses, plus CoPP protecting routing protocols.",
       "feedback": "Correct. The iACL stops most hostile traffic at the border; CoPP ensures what remains cannot starve the routing processes.",
       "best": true
      },
      {
       "text": "Upgrade the core router to a model with a faster CPU so that it can process the flood traffic.",
       "feedback": "Any CPU can be overwhelmed by a large enough flood; protection must filter and rate-limit.",
       "best": false
      },
      {
       "text": "Disable ICMP on all interfaces of the core router so that the flood traffic is ignored entirely.",
       "feedback": "This breaks path MTU discovery and troubleshooting while leaving other floods untouched.",
       "best": false
      }
     ]
    },
    {
     "type": "terms",
     "items": [
      {
       "term": "Control-plane policing (CoPP)",
       "def": "A QoS policy applied to traffic destined for the device's CPU, rate-limiting each class to protect critical protocols."
      },
      {
       "term": "Infrastructure ACL (iACL)",
       "def": "An edge ACL that permits only required protocols to the network's own device addresses while letting transit traffic pass."
      }
     ]
    },
    {
     "type": "keypoints",
     "title": "Key takeaways",
     "items": [
      "Protect each plane separately: management access, control-plane protocols and data-plane filtering.",
      "Roll out CoPP by inventory, classification and baselining before enforcing drops, and watch class-default.",
      "Use an infrastructure ACL at the edge to shield device addresses while permitting transit and required protocols.",
      "Keep a hardening baseline in version control and check every device against it automatically."
     ]
    },
    {
     "type": "quiz",
     "items": [
      {
       "q": "Why baseline CoPP with exceed-action transmit before enforcing?",
       "options": [
        "Because policing cannot drop traffic until after a reload of the device",
        "To learn real peaks without dropping legitimate control traffic",
        "Because transmit mode encrypts control-plane traffic during the baseline",
        "Because CoPP counters are only populated when exceed-action is transmit"
       ],
       "answer": 1,
       "explain": "Enforcing rates you have not measured can drop routing traffic and cause outages."
      },
      {
       "q": "What is the main purpose of an infrastructure ACL at the internet edge?",
       "options": [
        "Block traffic to the network's own devices while letting transit pass",
        "Replace the firewall that protects internal users and data-centre servers",
        "Encrypt management traffic sent between routers and the NOC",
        "Enforce QoS markings for voice traffic entering the network"
       ],
       "answer": 0,
       "explain": "iACLs shield device addresses; they are not a replacement for user-facing firewalls."
      },
      {
       "q": "Which item belongs to management-plane protection?",
       "options": [
        "Rate-limiting BGP and OSPF packets destined for the route processor",
        "Blocking spoofed private-address sources on the internet uplink",
        "Restricting VTY access to SSH from a management subnet with AAA",
        "Enabling storm control on access ports facing user devices"
       ],
       "answer": 2,
       "explain": "Management-plane controls govern how people and tools access the device."
      },
      {
       "q": "Why permit ICMP packet-too-big messages towards infrastructure in an iACL?",
       "options": [
        "They carry the routing updates that BGP exchanges between the edge routers",
        "They are required for SSH sessions to complete their handshake",
        "Path MTU discovery relies on them; blocking them causes black holes",
        "They prove the source address of every packet is not spoofed"
       ],
       "answer": 2,
       "explain": "Filtering 'fragmentation needed' messages breaks PMTUD for tunnels and TCP sessions."
      },
      {
       "q": "What should happen to traffic matching CoPP's class-default?",
       "options": [
        "Police it at a modest rate and review it, since it was not expected",
        "It should always be dropped completely, including routing protocol traffic",
        "It should be allowed without any limit because it is mostly user traffic",
        "It should be redirected to the management VRF for later inspection"
       ],
       "answer": 0,
       "explain": "Class-default catches unexpected traffic; police it and investigate what appears there."
      }
     ]
    }
   ]
  }
 ]
});
TRACK.modules.push({
 "id": "m8",
 "order": 8,
 "code": "Program",
 "title": "Program — Network Automation & NetDevOps",
 "subtitle": "Model-driven APIs, automation code, pipelines and closed-loop operations, with guardrails.",
 "outcomes": [
  "Read YANG models and use NETCONF, RESTCONF and gNMI to read and change devices.",
  "Write idempotent Python and Ansible automation with secrets handled safely.",
  "Build a NetDevOps pipeline with intent tests, lab validation, canary rollout and pre/post checks.",
  "Design event-driven workflows and apply guardrails to AI-assisted operations.",
  "Integrate all eight stages of The ZCNP Fabric into a capstone design and automation project."
 ],
 "lessons": [
  {
   "id": "m8-l1",
   "title": "Data Models and Programmable Interfaces",
   "subtitle": "YANG, NETCONF, RESTCONF and gNMI: structured data instead of screen-scraping",
   "minutes": 45,
   "objectives": [
    "Read a YANG module and its tree representation.",
    "Compare NETCONF, RESTCONF and gNMI and choose one for a task.",
    "Build NETCONF and RESTCONF requests and subscribe or set values with gNMI."
   ],
   "blocks": [
    {
     "type": "text",
     "text": "The Program stage of **The ZCNP Fabric** turns everything you have designed into code-driven operations. Its foundation is **structured data**. Instead of sending CLI text and parsing human-readable output, automation talks to devices through APIs whose data is described by **YANG** models. The device validates requests against the model, and tools can generate code, documentation and tests from it."
    },
    {
     "type": "layers",
     "title": "The model-driven stack",
     "items": [
      {
       "label": "Automation and applications",
       "parts": [
        "Python scripts, Ansible, controllers, CI/CD pipelines"
       ]
      },
      {
       "label": "Protocols",
       "parts": [
        "NETCONF (RFC 6241) over SSH",
        "RESTCONF (RFC 8040) over HTTPS",
        "gNMI over gRPC"
       ]
      },
      {
       "label": "Encodings",
       "parts": [
        "XML",
        "JSON",
        "Protobuf"
       ]
      },
      {
       "label": "Data models",
       "parts": [
        "YANG (RFC 7950)",
        "IETF and OpenConfig models",
        "Native platform models"
       ]
      },
      {
       "label": "Device datastores",
       "parts": [
        "Running, candidate, startup",
        "Operational state"
       ]
      }
     ]
    },
    {
     "type": "cli",
     "device": "zz-vlans.yang · YANG 1.1",
     "lines": [
      "module zz-vlans {",
      "  yang-version 1.1;",
      "  namespace \"urn:example:zz-vlans\";",
      "  prefix zzv;",
      "  container vlans {",
      "    list vlan {",
      "      key \"id\";",
      "      leaf id {",
      "        type uint16 { range \"1..4094\"; }",
      "      }",
      "      leaf name {",
      "        type string { length \"1..32\"; }",
      "      }",
      "      leaf enabled { type boolean; default true; }",
      "    }",
      "  }",
      "}"
     ],
     "title": "A small YANG module",
     "note": "A container groups data, a list holds keyed entries, and leaves carry typed values with constraints the device enforces before accepting a change."
    },
    {
     "type": "tree",
     "title": "The zz-vlans model as a tree",
     "root": {
      "label": "module zz-vlans",
      "text": "namespace urn:example:zz-vlans",
      "children": [
       {
        "label": "container vlans",
        "children": [
         {
          "label": "list vlan [id]",
          "text": "one entry per VLAN",
          "children": [
           {
            "label": "leaf id",
            "text": "uint16, 1..4094, key"
           },
           {
            "label": "leaf name",
            "text": "string, 1..32"
           },
           {
            "label": "leaf enabled",
            "text": "boolean, default true"
           }
          ]
         }
        ]
       }
      ]
     },
     "caption": "Every path an API uses comes from this hierarchy: module, container, keyed list, then typed leaves. A request for VLAN 5000 or a 40-character name is rejected by the device before it touches the configuration."
    },
    {
     "type": "cli",
     "device": "Automation host · pyang",
     "lines": [
      "$ pyang -f tree ietf-interfaces.yang",
      "module: ietf-interfaces",
      "  +--rw interfaces",
      "     +--rw interface* [name]",
      "        +--rw name           string",
      "        +--rw description?   string",
      "        +--rw type           identityref",
      "        +--rw enabled?       boolean",
      "        +--ro oper-status    enumeration",
      "        +--ro statistics",
      "           +--ro in-octets?   yang:counter64"
     ],
     "title": "Reading a model as a tree (excerpt)",
     "note": "`rw` nodes are configuration, `ro` nodes are operational state, `*` marks a list with its key in brackets and `?` marks an optional leaf."
    },
    {
     "type": "compare",
     "title": "Three programmable interfaces",
     "columns": [
      {
       "title": "NETCONF",
       "items": [
        "SSH, port 830",
        "XML encoding",
        "Datastores: running, candidate, startup",
        "Locks, validate, confirmed commit",
        "Best for transactional configuration"
       ]
      },
      {
       "title": "RESTCONF",
       "items": [
        "HTTPS with REST methods",
        "JSON or XML",
        "Resource URLs built from the YANG tree",
        "Easy for web tools and quick integrations",
        "No candidate datastore in the protocol itself"
       ]
      },
      {
       "title": "gNMI",
       "items": [
        "gRPC over HTTP/2 with TLS",
        "Protobuf or JSON encoding",
        "Capabilities, Get, Set, Subscribe",
        "Excellent for streaming telemetry",
        "Common with OpenConfig models"
       ]
      }
     ]
    },
    {
     "type": "sequence",
     "title": "A safe NETCONF transaction",
     "actors": [
      "Automation host",
      "Router (NETCONF server)"
     ],
     "steps": [
      {
       "from": 0,
       "to": 1,
       "label": "<hello> + capabilities",
       "note": "SSH subsystem, port 830"
      },
      {
       "from": 1,
       "to": 0,
       "label": "<hello> + capabilities",
       "note": ":candidate, :confirmed-commit",
       "reply": true
      },
      {
       "from": 0,
       "to": 1,
       "label": "<lock> candidate"
      },
      {
       "from": 0,
       "to": 1,
       "label": "<edit-config> candidate"
      },
      {
       "from": 0,
       "to": 1,
       "label": "<validate> candidate"
      },
      {
       "from": 1,
       "to": 0,
       "label": "<rpc-reply><ok/>",
       "note": "returned after each RPC",
       "reply": true
      },
      {
       "from": 0,
       "to": 1,
       "label": "<commit><confirmed/>",
       "note": "confirm-timeout 120 s"
      },
      {
       "from": 0,
       "to": 0,
       "label": "Post-checks: BGP, routes, probes"
      },
      {
       "from": 0,
       "to": 1,
       "label": "<commit/> to confirm",
       "note": "otherwise the router rolls back"
      },
      {
       "from": 0,
       "to": 1,
       "label": "<unlock> candidate"
      }
     ],
     "caption": "The lock stops anyone else editing the candidate mid-change, validate catches model errors before commit, and the confirmed commit is the safety net: if the post-checks fail or the host loses access, the router reverts on its own."
    },
    {
     "type": "cli",
     "device": "NETCONF RPCs · XML",
     "lines": [
      "<rpc message-id=\"101\" xmlns=\"urn:ietf:params:xml:ns:netconf:base:1.0\">",
      "  <edit-config>",
      "    <target><candidate/></target>",
      "    <config>",
      "      <interfaces xmlns=\"urn:ietf:params:xml:ns:yang:ietf-interfaces\">",
      "        <interface>",
      "          <name>GigabitEthernet2</name>",
      "          <description>WAN to ISP-B</description>",
      "        </interface>",
      "      </interfaces>",
      "    </config>",
      "  </edit-config>",
      "</rpc>",
      "<rpc message-id=\"102\" xmlns=\"urn:ietf:params:xml:ns:netconf:base:1.0\">",
      "  <commit><confirmed/><confirm-timeout>120</confirm-timeout></commit>",
      "</rpc>"
     ],
     "title": "Edit the candidate, then a confirmed commit",
     "note": "If no confirming commit arrives within 120 seconds, the device reverts automatically: a safety net for changes that might cut off your own access."
    },
    {
     "type": "cli",
     "device": "Automation host · RESTCONF with curl",
     "lines": [
      "$ curl -s -u \"$NET_USER:$NET_PASS\" -H \"Accept: application/yang-data+json\" \\",
      "    https://r1.lab.example/restconf/data/ietf-interfaces:interfaces/interface=GigabitEthernet2",
      "{",
      "  \"ietf-interfaces:interface\": [",
      "    {",
      "      \"name\": \"GigabitEthernet2\",",
      "      \"description\": \"WAN to ISP-B\",",
      "      \"type\": \"iana-if-type:ethernetCsmacd\",",
      "      \"enabled\": true",
      "    }",
      "  ]",
      "}"
     ],
     "title": "Reading one interface as JSON",
     "note": "Key values containing `/` must be percent-encoded in the URL: GigabitEthernet0/0/1 becomes `interface=GigabitEthernet0%2F0%2F1`."
    },
    {
     "type": "table",
     "head": [
      "Method",
      "Effect",
      "Typical success code"
     ],
     "rows": [
      [
       "GET",
       "Read configuration and state",
       "200"
      ],
      [
       "POST",
       "Create a child resource or invoke an operation",
       "201 (create) or 204/200"
      ],
      [
       "PUT",
       "Create or fully replace the target resource",
       "201 or 204"
      ],
      [
       "PATCH",
       "Merge changes into the target resource",
       "204 or 200"
      ],
      [
       "DELETE",
       "Remove the target resource",
       "204"
      ]
     ],
     "title": "RESTCONF methods"
    },
    {
     "type": "cli",
     "device": "Automation host · gnmic",
     "lines": [
      "$ gnmic -a leaf1.dc.example:57400 --tls-ca /etc/pki/ca.pem -u automation capabilities",
      "$ gnmic -a leaf1.dc.example:57400 --tls-ca /etc/pki/ca.pem -u automation \\",
      "    get --path \"/interfaces/interface[name=Ethernet1]/state/oper-status\"",
      "$ gnmic -a leaf1.dc.example:57400 --tls-ca /etc/pki/ca.pem -u automation \\",
      "    set --update-path \"/interfaces/interface[name=Ethernet1]/config/description\" \\",
      "        --update-value \"uplink to spine1\""
     ],
     "title": "gNMI Capabilities, Get and Set with OpenConfig paths",
     "note": "OpenConfig separates intended configuration (`config`) from operational values (`state`) under each node."
    },
    {
     "type": "scenario",
     "title": "Choosing the interface",
     "situation": "Your team must push a multi-part routing change to 40 edge routers so that either all parts apply on a router or none do, with automatic rollback if management access is lost. All routers support NETCONF, RESTCONF and gNMI. Which approach fits best?",
     "options": [
      {
       "text": "RESTCONF PATCH requests, one per configuration section, sent to each router in turn.",
       "feedback": "Each call commits separately, so a failure midway leaves a half-applied change.",
       "best": false
      },
      {
       "text": "gNMI Subscribe in on-change mode, applied to the BGP configuration paths on each router.",
       "feedback": "Subscribe is for telemetry; it does not change configuration.",
       "best": false
      },
      {
       "text": "NETCONF with the candidate datastore, validate and a confirmed commit on each router.",
       "feedback": "Correct. Candidate, validate and confirmed commit give an atomic change per device with automatic rollback.",
       "best": true
      },
      {
       "text": "CLI commands sent over SSH to each router and verified afterwards with regular expressions.",
       "feedback": "Works, but it is neither transactional nor model-validated.",
       "best": false
      }
     ]
    },
    {
     "type": "terms",
     "items": [
      {
       "term": "YANG",
       "def": "The data-modelling language (RFC 7950) that defines the structure, types and constraints of configuration and state data."
      },
      {
       "term": "Confirmed commit",
       "def": "A NETCONF commit that reverts automatically unless a confirming commit is received within a timeout."
      },
      {
       "term": "OpenConfig",
       "def": "Vendor-neutral YANG models written by network operators, widely used with gNMI."
      }
     ]
    },
    {
     "type": "keypoints",
     "title": "Key takeaways",
     "items": [
      "YANG defines the structure, types and constraints that devices enforce on API requests.",
      "NETCONF suits transactional configuration with candidate, validate and confirmed commit.",
      "RESTCONF maps YANG paths to HTTPS URLs; percent-encode reserved characters in keys.",
      "gNMI offers Get, Set and Subscribe over gRPC and is the natural fit for streaming telemetry."
     ]
    },
    {
     "type": "quiz",
     "items": [
      {
       "q": "In a YANG tree, what does `+--ro oper-status` indicate?",
       "options": [
        "A required configuration leaf with a default",
        "A list key used for indexing",
        "A deprecated configuration node",
        "A read-only operational state leaf"
       ],
       "answer": 3,
       "explain": "`ro` marks state data that cannot be configured."
      },
      {
       "q": "Which NETCONF feature lets a change revert automatically if you lose access to the device?",
       "options": [
        "Locking the running datastore",
        "Confirmed commit with a confirm timeout",
        "The get-config operation with a subtree filter",
        "The hello exchange that lists the device capabilities"
       ],
       "answer": 1,
       "explain": "Without a confirming commit before the timeout, the device rolls back."
      },
      {
       "q": "A RESTCONF URL must address interface GigabitEthernet0/0/1. How is the key written?",
       "options": [
        "interface=GigabitEthernet0%2F0%2F1",
        "interface/GigabitEthernet0/0/1",
        "interface[name=GigabitEthernet0/0/1]",
        "interface=GigabitEthernet0-0-1"
       ],
       "answer": 0,
       "explain": "Reserved characters in key values are percent-encoded; `/` becomes %2F."
      },
      {
       "q": "Which gNMI RPC is used for streaming telemetry?",
       "options": [
        "Get",
        "Set",
        "Capabilities",
        "Subscribe"
       ],
       "answer": 3,
       "explain": "Subscribe supports stream, once and poll modes."
      },
      {
       "q": "Which RESTCONF method merges changes into an existing resource rather than replacing it?",
       "options": [
        "PUT",
        "POST",
        "PATCH",
        "DELETE"
       ],
       "answer": 2,
       "explain": "PUT replaces the target, DELETE removes it, and PATCH merges into it."
      }
     ]
    }
   ]
  },
  {
   "id": "m8-l2",
   "title": "Python and Ansible for Network Automation",
   "subtitle": "From one-off scripts to idempotent, reviewed playbooks",
   "minutes": 45,
   "objectives": [
    "Use Python libraries to collect structured data and apply configuration safely.",
    "Write an Ansible inventory, Jinja2 template and playbook with verification.",
    "Apply idempotency, secrets handling and dry runs to every automation task."
   ],
   "blocks": [
    {
     "type": "text",
     "text": "Python and Ansible are the everyday tools of network automation. Python gives you full control for data gathering, analysis and custom logic. Ansible gives you a declarative, readable way to apply the same change to many devices. Both work best when they handle **data**: inventories, variables and templates, rather than hard-coded commands."
    },
    {
     "type": "compare",
     "title": "Choosing a tool",
     "columns": [
      {
       "title": "Netmiko-style SSH libraries",
       "items": [
        "Send CLI commands over SSH",
        "Parse output with templates into structured data",
        "Works on almost any device",
        "You own error handling and idempotency"
       ]
      },
      {
       "title": "NAPALM-style abstraction",
       "items": [
        "Same functions across platforms (facts, BGP neighbours, config)",
        "Load, compare, commit and rollback workflow",
        "Shows a diff before committing"
       ]
      },
      {
       "title": "Ansible",
       "items": [
        "Inventory, variables and playbooks in YAML",
        "Modules for CLI and API-based platforms",
        "Check and diff modes where modules support them",
        "Readable by people who do not write Python"
       ]
      }
     ]
    },
    {
     "type": "matrix",
     "title": "Choosing an automation approach",
     "x": "Programmable interfaces on the devices",
     "y": "Number of devices and how often the task repeats",
     "quadrants": [
      {
       "title": "Ansible with CLI modules",
       "items": [
        "Parsed show output",
        "Templates from data",
        "Check and diff where supported"
       ]
      },
      {
       "title": "Pipeline-driven API automation",
       "items": [
        "Ansible or Python over NETCONF, RESTCONF, gNMI",
        "Intent data in Git",
        "Tests and canary waves"
       ]
      },
      {
       "title": "Read-only SSH scripts",
       "items": [
        "Collect and parse state",
        "Build inventory and baselines first"
       ]
      },
      {
       "title": "Python with API clients",
       "items": [
        "Targeted tasks",
        "Structured data in and out"
       ]
      }
     ],
     "caption": "Start in the bottom-left with read-only collection, which is safe and builds the inventory you will need anyway. Move up as the task repeats across more devices, and right as platforms expose model-driven APIs."
    },
    {
     "type": "cli",
     "device": "collect_bgp.py · Python",
     "lines": [
      "import os",
      "from concurrent.futures import ThreadPoolExecutor",
      "from netmiko import ConnectHandler",
      "DRIVER = os.environ[\"NET_DRIVER\"]      # Netmiko platform driver name",
      "HOSTS = [\"edge1.site7.example\", \"edge2.site7.example\"]",
      "def bgp_summary(host):",
      "    params = {\"device_type\": DRIVER, \"host\": host,",
      "              \"username\": os.environ[\"NET_USER\"], \"password\": os.environ[\"NET_PASS\"]}",
      "    with ConnectHandler(**params) as conn:",
      "        return host, conn.send_command(\"show ip bgp summary\", use_textfsm=True)",
      "with ThreadPoolExecutor(max_workers=10) as pool:",
      "    for host, peers in pool.map(bgp_summary, HOSTS):",
      "        print(host, peers)"
     ],
     "title": "Parallel, parsed data collection",
     "note": "Credentials come from the environment (or a vault), never from the script. `use_textfsm=True` returns a list of dictionaries when a parsing template exists for the command."
    },
    {
     "type": "cli",
     "device": "ntp_change.py · Python",
     "lines": [
      "from napalm import get_network_driver",
      "driver = get_network_driver(DRIVER)",
      "with driver(host, user, password) as device:",
      "    device.load_merge_candidate(filename=\"ntp_baseline.cfg\")",
      "    diff = device.compare_config()",
      "    if diff:",
      "        print(diff)",
      "        device.commit_config()",
      "    else:",
      "        device.discard_config()"
     ],
     "title": "Diff before commit",
     "note": "Committing only when a diff exists makes the script idempotent: running it twice changes nothing the second time."
    },
    {
     "type": "keypoints",
     "items": [
      "Keep secrets in environment variables or a vault, never in Git.",
      "Prefer APIs and structured output over parsing free text.",
      "Make every task idempotent: check current state, change only what differs.",
      "Set timeouts and handle failures per device so one bad host does not stop the run.",
      "Log what was changed, where and by whom; keep the output as evidence."
     ],
     "title": "Habits of reliable automation code"
    },
    {
     "type": "cli",
     "device": "inventory.yml and group_vars/all.yml · YAML",
     "lines": [
      "all:",
      "  children:",
      "    access_switches:",
      "      hosts:",
      "        sw-acc1.site7.example:",
      "        sw-acc2.site7.example:",
      "      vars:",
      "        ansible_connection: ansible.netcommon.network_cli",
      "        ansible_network_os: <your platform's network OS name>",
      "# group_vars/all.yml",
      "ntp_servers:",
      "  - 10.10.50.5",
      "  - 10.10.50.6"
     ],
     "title": "Inventory and data",
     "note": "The NTP servers live in data, not in the playbook, so the same playbook serves every site."
    },
    {
     "type": "cli",
     "device": "templates/ntp.j2 and ntp.yml · Jinja2 and Ansible",
     "lines": [
      "{% for server in ntp_servers %}",
      "ntp server {{ server }}",
      "{% endfor %}",
      "---",
      "- name: Enforce NTP baseline",
      "  hosts: access_switches",
      "  gather_facts: false",
      "  tasks:",
      "    - name: Render and push NTP configuration",
      "      ansible.netcommon.cli_config:",
      "        config: \"{{ lookup('ansible.builtin.template', 'ntp.j2') }}\"",
      "    - name: Read NTP associations",
      "      ansible.netcommon.cli_command:",
      "        command: show ntp associations",
      "      register: ntp",
      "    - name: Verify both servers are present",
      "      ansible.builtin.assert:",
      "        that: \"'10.10.50.5' in ntp.stdout and '10.10.50.6' in ntp.stdout\""
     ],
     "title": "Template, push and verify",
     "note": "Run first with `ansible-playbook -i inventory.yml ntp.yml --check --diff --limit sw-acc1.site7.example` to preview the change on one device."
    },
    {
     "type": "flow",
     "title": "A playbook run, done properly",
     "items": [
      {
       "label": "Select",
       "text": "Limit to a canary device or site."
      },
      {
       "label": "Preview",
       "text": "Check and diff mode shows intended changes."
      },
      {
       "label": "Apply",
       "text": "Push the rendered configuration."
      },
      {
       "label": "Verify",
       "text": "Assert the resulting state, not just the command's success."
      },
      {
       "label": "Expand",
       "text": "Widen the limit in waves, stopping on any failure."
      }
     ]
    },
    {
     "type": "callout",
     "kind": "warning",
     "text": "A playbook can be perfectly idempotent and still apply the wrong intent to 500 devices. Safety comes from review, testing in a lab, canary rollout and post-checks, which the next lesson builds into a pipeline.",
     "title": "Idempotent is not the same as safe"
    },
    {
     "type": "scenario",
     "title": "The script that changed too much",
     "situation": "A colleague's Python script adds an ACL line to every edge router. Run twice by mistake, it added duplicate entries and broke the ACL's sequence. What is the best improvement?",
     "options": [
      {
       "text": "Make it idempotent: compare the current ACL with the intended state and apply only the difference.",
       "feedback": "Correct. Comparing intended and actual state is the core of safe, repeatable automation.",
       "best": true
      },
      {
       "text": "Add a comment at the top of the script warning colleagues never to run it twice in a row.",
       "feedback": "Comments do not prevent mistakes; the tool itself must be safe to re-run.",
       "best": false
      },
      {
       "text": "Rewrite the script in a different programming language with stronger error handling built in.",
       "feedback": "The language is not the problem; the logic is.",
       "best": false
      },
      {
       "text": "Run the script only on Sunday mornings, when traffic is low and fewer users would notice.",
       "feedback": "Timing reduces impact but not the defect.",
       "best": false
      }
     ]
    },
    {
     "type": "terms",
     "items": [
      {
       "term": "Idempotency",
       "def": "The property of an automation task that produces the same end state whether it runs once or many times."
      },
      {
       "term": "Inventory",
       "def": "The structured list of devices, groups and variables that automation tools target."
      },
      {
       "term": "Jinja2 template",
       "def": "A text template with variables and loops used to render device configuration from data."
      }
     ]
    },
    {
     "type": "keypoints",
     "title": "Key takeaways",
     "items": [
      "Automate with data: inventories, variables and templates, not hard-coded commands.",
      "Make every task idempotent by comparing intended and current state before changing anything.",
      "Inject secrets at run time from a vault or environment, never from Git.",
      "Preview with check and diff, start with a canary, and assert the resulting state.",
      "Idempotent is not safe on its own: review, test and roll out in waves."
     ]
    },
    {
     "type": "quiz",
     "items": [
      {
       "q": "What makes the NAPALM-style workflow idempotent in the example?",
       "options": [
        "It reconnects to every device twice before committing a change",
        "It commits only when compare_config returns a difference",
        "It removes the existing configuration before loading the file",
        "It runs the commit inside a background thread for each device"
       ],
       "answer": 1,
       "explain": "No diff means no change; re-running is harmless."
      },
      {
       "q": "Where should device credentials for automation live?",
       "options": [
        "In the playbook header so every engineer can read them easily",
        "In a comment inside the Jinja2 template for each platform",
        "In the Git repository alongside the inventory and variables",
        "In environment variables or a vault, injected at run time"
       ],
       "answer": 3,
       "explain": "Secrets in code or Git leak; inject them at run time from a protected store."
      },
      {
       "q": "What does Ansible's `--check --diff` combination provide?",
       "options": [
        "A permanent rollback point stored on every target device",
        "An automatic peer review of the playbook by another engineer",
        "A preview of the changes, where modules support check mode",
        "A parallel run against both lab and production inventories"
       ],
       "answer": 2,
       "explain": "Check mode simulates; diff shows the change. Module support varies, so verify behaviour first."
      },
      {
       "q": "Why does the playbook end with an assert task?",
       "options": [
        "To prove the resulting device state, not just accepted commands",
        "To make the playbook run faster on large inventories of network devices",
        "To encrypt the output of the show command in the logs",
        "To prevent the playbook from running in check mode"
       ],
       "answer": 0,
       "explain": "Successful command execution does not prove the intended state was reached."
      },
      {
       "q": "Why are NTP server addresses kept in group_vars instead of in the playbook?",
       "options": [
        "Ansible cannot read IP addresses written directly inside playbooks",
        "Separating data from logic lets one playbook serve many sites",
        "Group variables are encrypted automatically by Ansible at run time",
        "Playbooks may only contain module names and never any values"
       ],
       "answer": 1,
       "explain": "Data-driven automation reuses the same logic with different inputs."
      }
     ]
    }
   ]
  },
  {
   "id": "m8-l3",
   "title": "NetDevOps: Source Control, CI/CD and Testing",
   "subtitle": "Treat network changes like software: versioned, reviewed, tested and reversible",
   "minutes": 45,
   "objectives": [
    "Use Git branches and reviews for network intent and templates.",
    "Design a CI/CD pipeline with linting, rendering, testing and staged deployment.",
    "Define pre-checks and post-checks that gate every change."
   ],
   "blocks": [
    {
     "type": "text",
     "text": "NetDevOps applies software delivery practice to network change. The **source of truth** is data in version control, not the running configuration of a device. Every change is a commit, reviewed by a colleague, tested automatically and deployed by a pipeline that checks the network before and after. The goal is not speed for its own sake; it is fewer failed changes and faster, safer recovery when something does go wrong."
    },
    {
     "type": "layers",
     "title": "From intent to device",
     "items": [
      {
       "label": "Intent data",
       "parts": [
        "Sites, VLANs, VRFs, RDs/RTs, BGP peers in YAML or an IPAM/inventory system"
       ]
      },
      {
       "label": "Templates and logic",
       "parts": [
        "Jinja2 templates, playbooks, Python modules"
       ]
      },
      {
       "label": "Rendered artefacts",
       "parts": [
        "Per-device configurations or API payloads, built by the pipeline"
       ]
      },
      {
       "label": "Network",
       "parts": [
        "Devices receive changes only through the pipeline; drift is detected and reported"
       ]
      }
     ]
    },
    {
     "type": "topology",
     "title": "NetDevOps toolchain around a source of truth",
     "nodes": [
      {
       "id": "git",
       "kind": "doc",
       "label": "Git repository",
       "x": 1,
       "y": 0,
       "sub": "templates, tests, pipeline"
      },
      {
       "id": "sot",
       "kind": "db",
       "label": "Source of truth",
       "x": 3,
       "y": 0,
       "sub": "IPAM and inventory data"
      },
      {
       "id": "vault",
       "kind": "vault",
       "label": "Secrets vault",
       "x": 5,
       "y": 0,
       "sub": "credentials at run time"
      },
      {
       "id": "ci",
       "kind": "process",
       "label": "CI runner",
       "x": 3,
       "y": 1.5,
       "sub": "lint, render, test"
      },
      {
       "id": "lab",
       "kind": "cloud",
       "label": "Virtual lab",
       "x": 1,
       "y": 3,
       "sub": "same software as prod"
      },
      {
       "id": "prod",
       "kind": "router",
       "label": "Production",
       "x": 5,
       "y": 3,
       "sub": "canary, then waves"
      },
      {
       "id": "tel",
       "kind": "monitor",
       "label": "Telemetry",
       "x": 3,
       "y": 4.5,
       "sub": "pre and post checks"
      }
     ],
     "links": [
      {
       "a": "git",
       "b": "ci",
       "label": "merge request"
      },
      {
       "a": "sot",
       "b": "ci",
       "label": "intent data"
      },
      {
       "a": "vault",
       "b": "ci",
       "label": "secrets",
       "style": "dashed"
      },
      {
       "a": "ci",
       "b": "lab",
       "label": "deploy + checks"
      },
      {
       "a": "ci",
       "b": "prod",
       "label": "NETCONF / gNMI"
      },
      {
       "a": "prod",
       "b": "tel",
       "label": "streams"
      },
      {
       "a": "lab",
       "b": "tel",
       "label": "streams"
      },
      {
       "a": "tel",
       "b": "ci",
       "label": "check results",
       "style": "dashed"
      }
     ],
     "caption": "Engineers change data and templates in Git, never devices. The runner pulls intent from the source of truth and secrets from the vault, proves the change in the lab, then pushes it to production in waves while telemetry decides whether each wave passes."
    },
    {
     "type": "cli",
     "device": "Engineer workstation · Git",
     "lines": [
      "$ git switch -c change/CHG-2417-ntp-baseline",
      "$ git add group_vars/all.yml templates/ntp.j2",
      "$ git commit -m \"CHG-2417: add second NTP server to baseline\"",
      "$ git push -u origin change/CHG-2417-ntp-baseline",
      "# open a merge request: the pipeline lints, renders, tests and deploys to the lab",
      "$ git log --oneline -3",
      "9c1e4ab CHG-2417: add second NTP server to baseline",
      "51d07f2 CHG-2399: GUEST VRF route-target update",
      "e8a3310 CHG-2391: CoPP management class rate increase"
     ],
     "title": "A change starts as a branch",
     "note": "The change ID in the branch and commit message links code, ticket and pipeline evidence together."
    },
    {
     "type": "cycle",
     "title": "The NetDevOps pipeline as a loop",
     "center": "Intent in Git",
     "items": [
      {
       "label": "Branch and commit",
       "text": "change data or templates with a change ID"
      },
      {
       "label": "Lint",
       "text": "YAML, templates and playbooks checked for syntax and style"
      },
      {
       "label": "Render and test",
       "text": "configurations rendered; unit tests check intent rules"
      },
      {
       "label": "Model and lab",
       "text": "offline analysis, then deployment to a virtual lab"
      },
      {
       "label": "Review and approve",
       "text": "peer review plus change approval for production"
      },
      {
       "label": "Canary deploy",
       "text": "pre-checks, then a small set of devices"
      },
      {
       "label": "Post-check and expand",
       "text": "verify, roll out in waves, roll back automatically on failure"
      },
      {
       "label": "Detect drift",
       "text": "compare live configuration with intent and feed findings back"
      }
     ],
     "caption": "The loop never ends at deployment: drift reports and post-check failures become the next commits, so the source of truth and the network converge over time."
    },
    {
     "type": "cli",
     "device": "tests/test_intent.py · pytest",
     "lines": [
      "import yaml",
      "def load(path):",
      "    with open(path) as f:",
      "        return yaml.safe_load(f)",
      "def test_route_distinguishers_unique():",
      "    vrfs = load(\"intent/vrfs.yml\")[\"vrfs\"]",
      "    rds = [v[\"rd\"] for v in vrfs]",
      "    assert len(rds) == len(set(rds)), \"duplicate RD in VRF plan\"",
      "def test_guest_never_imports_corp():",
      "    guest = next(v for v in load(\"intent/vrfs.yml\")[\"vrfs\"] if v[\"name\"] == \"GUEST\")",
      "    assert \"65010:10\" not in guest[\"import_rt\"], \"GUEST must not import CORP routes\""
     ],
     "title": "Testing intent before it reaches a device",
     "note": "Tests encode design rules from earlier modules, such as the VRF and route-target plan, so a pull request that breaks them fails before any device is touched."
    },
    {
     "type": "cli",
     "device": "pipeline.yml · CI definition (illustrative)",
     "lines": [
      "stages: [lint, build, test, lab, approve, deploy]",
      "lint:    { script: [\"yamllint .\", \"ansible-lint playbooks/\"] }",
      "build:   { script: [\"python tools/render.py --out build/\"] }",
      "test:    { script: [\"pytest tests/ --junitxml=reports/unit.xml\",",
      "                    \"python tools/model_checks.py build/\"] }",
      "lab:     { script: [\"ansible-playbook -i inventory/lab.yml deploy.yml\",",
      "                    \"python tools/postchecks.py --inventory inventory/lab.yml\"] }",
      "approve: { when: manual }",
      "deploy:  { script: [\"python tools/prechecks.py --site $SITE\",",
      "                    \"ansible-playbook -i inventory/prod.yml deploy.yml --limit $CANARY\",",
      "                    \"python tools/postchecks.py --site $SITE\"] }"
     ],
     "title": "Pipeline stages expressed as code",
     "note": "Syntax differs between CI systems; the structure (stages, gates, manual approval, canary and checks) is what matters."
    },
    {
     "type": "table",
     "head": [
      "Level",
      "Question it answers",
      "Examples"
     ],
     "rows": [
      [
       "Static",
       "Is the code well-formed?",
       "YAML lint, template render, playbook lint"
      ],
      [
       "Intent (unit)",
       "Does the data obey our design rules?",
       "Unique RDs, no overlapping subnets, MTU ≥ 9,000 in the fabric"
      ],
      [
       "Model",
       "Would the rendered configs behave correctly?",
       "Offline analysis of reachability and ACLs, e.g. with open-source config analysis tools"
      ],
      [
       "Lab",
       "Does it work on real software?",
       "Deploy to a virtual lab, run post-checks"
      ],
      [
       "Production checks",
       "Is the live network healthy before and after?",
       "Neighbour counts, route counts, probes, interface errors"
      ]
     ],
     "title": "Tests at each level"
    },
    {
     "type": "template",
     "title": "Change pre-check and post-check list",
     "purpose": "Define, per change type, what must be true before a change starts and what must be proven after, so pipelines and engineers gate changes the same way.",
     "columns": [
      "Check",
      "Command / API / probe",
      "Expected value",
      "Pre",
      "Post",
      "Stop if"
     ],
     "example": [
      [
       "BGP neighbours on edge",
       "gNMI get neighbor session-state",
       "All ESTABLISHED",
       "Record count",
       "Same count",
       "Any neighbour not ESTABLISHED after 3 min"
      ],
      [
       "Branch-to-DC voice probe",
       "UDP jitter probe results",
       "Jitter < 30 ms, loss < 1%",
       "Baseline",
       "Within 10% of baseline",
       "SLA breach for 2 intervals"
      ]
     ],
     "rows": 8
    },
    {
     "type": "case",
     "title": "An ISP builds an automation pipeline",
     "context": "A regional ISP provisions business internet and L3VPN services by hand. Each order takes five days, one in twelve changes causes a ticket, and configurations differ between engineers. The ISP wants self-service ordering within two years and asks you to design the pipeline that will sit behind it.",
     "questions": [
      "What would be your source of truth, and how would you migrate to it?",
      "Which tests would you require before a service change reaches a PE router?",
      "How would you roll out changes and recover from failures?",
      "Which measures would show the pipeline is working?"
     ],
     "answer": "Make service intent the source of truth: a Git repository (or an inventory/IPAM system with Git-backed templates) holding customers, VRFs, RDs/RTs, interfaces and BGP parameters as data. Migrate by discovering existing services, normalising them into that data model and reconciling until rendered configs match live configs, with drift reports along the way. Required tests: schema and lint checks, intent rules (unique RDs, no RT that leaks one customer into another, valid ASNs and prefixes), rendered-config analysis, and a virtual-lab deployment with post-checks. Rollout: NETCONF confirmed commits per PE, canary customers first, automated pre/post checks on BGP sessions, routes and probes, with automatic rollback when a check fails. Measures: lead time per order, change failure rate, mean time to restore, percentage of services under pipeline control and configuration drift count."
    },
    {
     "type": "checklist",
     "title": "NetDevOps readiness checklist",
     "items": [
      "All intent data and templates are in Git with protected main branch and mandatory review.",
      "No secrets in the repository; the pipeline injects them from a vault.",
      "Every merge request runs lint, render and intent tests automatically.",
      "A virtual lab mirrors production topology closely enough for meaningful tests.",
      "Pre-checks and post-checks exist for every common change type.",
      "Deployments use canary waves and have an automated rollback path.",
      "Drift between intent and live configuration is reported at least daily.",
      "Change failure rate and lead time are measured and reviewed monthly."
     ]
    },
    {
     "type": "scenario",
     "title": "A risky merge request",
     "situation": "A merge request changes the GUEST VRF import list. Lint and rendering pass, but the intent test `test_guest_never_imports_corp` fails. A senior engineer asks you to skip tests just this once because the change is urgent. What do you do?",
     "options": [
      {
       "text": "Skip the test just this once because the change is urgent, and add a note to the change ticket.",
       "feedback": "Bypassing the guard that protects guest isolation creates exactly the incident the test exists to prevent.",
       "best": false
      },
      {
       "text": "Delete the test so that future urgent changes are not blocked by the same rule again.",
       "feedback": "That removes a design control without review.",
       "best": false
      },
      {
       "text": "Keep the gate: inspect the failure, fix the data or formally update the rule, then re-run.",
       "feedback": "Correct. The test protects a security boundary. Either the change is wrong or the rule must be formally updated, never silently bypassed.",
       "best": true
      },
      {
       "text": "Apply the change by hand on the devices to avoid the pipeline, and update Git afterwards.",
       "feedback": "Out-of-band changes create drift and skip all evidence.",
       "best": false
      }
     ]
    },
    {
     "type": "terms",
     "items": [
      {
       "term": "Source of truth",
       "def": "The authoritative, version-controlled data describing how the network should be configured."
      },
      {
       "term": "CI/CD",
       "def": "Continuous integration and delivery: automatically testing every change and deploying it through controlled stages."
      },
      {
       "term": "Configuration drift",
       "def": "Differences between the intended configuration in the source of truth and what is running on devices."
      }
     ]
    },
    {
     "type": "keypoints",
     "title": "Key takeaways",
     "items": [
      "Intent data and templates in Git are the source of truth; devices change only through the pipeline.",
      "Test at every level: static, intent, model, lab and live pre- and post-checks.",
      "Deploy in canary waves and roll back automatically when a post-check fails.",
      "Never bypass a failing gate; fix the data or formally change the rule.",
      "Measure lead time, change failure rate, time to restore and drift."
     ]
    },
    {
     "type": "quiz",
     "items": [
      {
       "q": "In NetDevOps, what should be the source of truth for intended configuration?",
       "options": [
        "The running configuration on each production device",
        "The most recent backup taken by the monitoring system",
        "Version-controlled intent data and templates",
        "The design documents stored on a shared drive"
       ],
       "answer": 2,
       "explain": "Devices hold the actual state; intent lives in version control and is compared against it."
      },
      {
       "q": "Which test catches a duplicate route distinguisher before any device is touched?",
       "options": [
        "A post-check on BGP neighbour counts after deployment",
        "A YAML lint check of the playbook formatting",
        "A synthetic branch probe",
        "An intent unit test over the VRF data"
       ],
       "answer": 3,
       "explain": "Intent tests validate design rules on the data itself."
      },
      {
       "q": "What is the purpose of a canary stage in network deployment?",
       "options": [
        "To run linting and template rendering on the change",
        "To limit the blast radius by changing a few devices first",
        "To obtain formal approval from the change advisory board for the rollout",
        "To encrypt configuration files before they are pushed"
       ],
       "answer": 1,
       "explain": "Problems surface on a small set before the change reaches everything."
      },
      {
       "q": "A post-check fails after the canary deploy. What should the pipeline do?",
       "options": [
        "Stop the rollout and roll back the canary devices",
        "Continue with the next wave and raise a low-priority ticket",
        "Re-run the post-check repeatedly until it eventually passes",
        "Delete the failing post-check so the rollout can continue"
       ],
       "answer": 0,
       "explain": "Failed checks must halt and reverse the change."
      },
      {
       "q": "Why is configuration drift reported regularly?",
       "options": [
        "To measure how quickly the pipeline renders configurations",
        "To decide which engineers should approve merge requests",
        "To compress old configuration backups and save storage",
        "To find out-of-band changes that diverge from intent"
       ],
       "answer": 3,
       "explain": "Drift reveals manual or unauthorised changes that the pipeline does not know about."
      }
     ]
    }
   ]
  },
  {
   "id": "m8-l4",
   "title": "Event-Driven Automation and AI-Assisted Operations",
   "subtitle": "Closing the loop from signal to action, with guardrails",
   "minutes": 40,
   "objectives": [
    "Design event-driven workflows that enrich, decide and act on network events.",
    "Decide which actions may run automatically and which need human approval.",
    "Apply guardrails when using AI assistance for network operations."
   ],
   "blocks": [
    {
     "type": "text",
     "text": "Assurance tells you something happened; automation can respond. **Event-driven automation** connects the two: a telemetry alert, syslog message or ticket triggers a workflow that gathers context, decides what to do and acts or asks for approval. AI assistance is increasingly part of that loop, summarising evidence and suggesting actions. Both multiply the speed of operations, and both multiply mistakes unless they are bounded by clear guardrails."
    },
    {
     "type": "cycle",
     "title": "The closed loop",
     "center": "Kill switch and rate limits",
     "items": [
      {
       "label": "Detect",
       "text": "telemetry, syslog, probes or tickets raise an event"
      },
      {
       "label": "Enrich",
       "text": "add context: device role, recent changes, topology, open incidents"
      },
      {
       "label": "Decide",
       "text": "rules (and optionally AI-generated suggestions) choose an action"
      },
      {
       "label": "Act",
       "text": "run diagnostics automatically; run changes per approval policy"
      },
      {
       "label": "Verify",
       "text": "confirm the outcome with fresh data"
      },
      {
       "label": "Record",
       "text": "update the ticket with evidence and actions taken"
      }
     ],
     "caption": "Every turn of the loop must end in verification and a record, otherwise automation cannot learn which actions worked. The kill switch in the middle stops every workflow at once."
    },
    {
     "type": "cli",
     "device": "rulebooks/bgp.yml · event-driven Ansible rulebook",
     "lines": [
      "- name: React to BGP neighbour loss",
      "  hosts: all",
      "  sources:",
      "    - ansible.eda.webhook:",
      "        host: 0.0.0.0",
      "        port: 5000",
      "  rules:",
      "    - name: Collect diagnostics when a BGP session drops",
      "      condition: event.payload.alert == \"bgp_session_down\"",
      "      action:",
      "        run_playbook:",
      "          name: playbooks/bgp_diagnostics.yml",
      "    - name: Notify on repeated interface flaps",
      "      condition: event.payload.alert == \"interface_flap\" and event.payload.count > 5",
      "      action:",
      "        run_playbook:",
      "          name: playbooks/open_ticket.yml"
     ],
     "title": "Events mapped to safe, read-only first actions",
     "note": "The alerting system posts JSON to the webhook. The first rule only gathers evidence; changing the network is left to a human or to a separately approved workflow."
    },
    {
     "type": "table",
     "head": [
      "Event",
      "Automatic action",
      "Needs approval"
     ],
     "rows": [
      [
       "BGP session down",
       "Collect neighbour, route and log data; attach to ticket",
       "Clearing sessions, changing policy"
      ],
      [
       "Interface flapping",
       "Gather optics and error counters; open ticket",
       "Shutting the interface"
      ],
      [
       "Config drift detected",
       "Report the diff to the owning team",
       "Overwriting the device from intent"
      ],
      [
       "WAN SLA breach",
       "Confirm with extra probes; notify",
       "Permanent path-preference changes"
      ],
      [
       "Known, low-risk fix (e.g. re-enable a port after an approved maintenance)",
       "Run if pre-checks pass",
       "Anything outside the approved runbook"
      ]
     ],
     "title": "What may run automatically?"
    },
    {
     "type": "matrix",
     "title": "Deciding how far to automate an action",
     "x": "Blast radius if the action is wrong",
     "y": "Confidence in the diagnosis",
     "quadrants": [
      {
       "title": "Automate with pre-checks",
       "items": [
        "Re-enable a port after approved maintenance",
        "Restart a stuck telemetry agent"
       ]
      },
      {
       "title": "Automate, human approves",
       "items": [
        "Overwrite drifted config from intent",
        "Change path preference"
       ]
      },
      {
       "title": "Automate diagnostics only",
       "items": [
        "Collect logs and counters",
        "Open and enrich a ticket"
       ]
      },
      {
       "title": "Human decides and acts",
       "items": [
        "Shut an uplink",
        "Clear BGP sessions",
        "Change routing policy"
       ]
      }
     ],
     "caption": "Most new workflows start in the bottom row. An action moves up only when evidence shows the diagnosis is reliable, and moves left only when guardrails make a wrong action cheap to undo."
    },
    {
     "type": "framework",
     "title": "Guardrails for AI-assisted operations",
     "items": [
      {
       "label": "READ",
       "title": "Read-only by default",
       "text": "Assistants query telemetry, logs and configs; write access is granted per approved workflow only."
      },
      {
       "label": "GRND",
       "title": "Grounded in your data",
       "text": "Answers must cite the source of truth, telemetry and runbooks, not guesses."
      },
      {
       "label": "HUM",
       "title": "Human approval for change",
       "text": "Proposed changes become merge requests that pass the same pipeline and review as any other change."
      },
      {
       "label": "SEC",
       "title": "No secrets or personal data in prompts",
       "text": "Redact credentials, keys and customer data before anything leaves the controlled environment."
      },
      {
       "label": "LOG",
       "title": "Full audit trail",
       "text": "Prompts, evidence, suggestions and decisions are logged with the change or incident."
      },
      {
       "label": "EVAL",
       "title": "Measured, not assumed",
       "text": "Track accuracy of suggestions against outcomes and withdraw uses that do not earn trust."
      }
     ]
    },
    {
     "type": "compare",
     "title": "Where AI assistance helps and where it hurts",
     "columns": [
      {
       "title": "Good early uses",
       "items": [
        "Summarising a noisy incident timeline",
        "Explaining an unfamiliar log message or config section",
        "Drafting a runbook or a test from a description",
        "Natural-language queries over telemetry, with links to the data",
        "Suggesting a likely cause for an engineer to verify"
       ]
      },
      {
       "title": "Risky uses",
       "items": [
        "Pushing generated configuration directly to devices",
        "Trusting answers that cite no evidence",
        "Pasting full configs with secrets into external tools",
        "Letting suggestions bypass change control",
        "Using it to replace understanding of the network"
       ]
      }
     ]
    },
    {
     "type": "steps",
     "title": "Adopting AI assistance safely",
     "items": [
      {
       "title": "Pick a read-only use case",
       "text": "For example, incident summaries attached to tickets."
      },
      {
       "title": "Connect approved data only",
       "text": "Telemetry, logs, the source of truth and runbooks, with access controls."
      },
      {
       "title": "Define success",
       "text": "Time saved per incident and accuracy judged by engineers."
      },
      {
       "title": "Pilot with review",
       "text": "Engineers rate every output; failures are analysed."
      },
      {
       "title": "Expand deliberately",
       "text": "Only after evidence; any write action goes through the pipeline."
      }
     ]
    },
    {
     "type": "callout",
     "kind": "warning",
     "text": "A wrong manual change hits one device. A wrong automated or AI-suggested change can hit every device in minutes. Rate-limit automated actions, require pre-checks, and keep a kill switch that stops all event-driven workflows at once.",
     "title": "Automation amplifies"
    },
    {
     "type": "callout",
     "kind": "pro",
     "title": "Agentic assistants need the same guardrails",
     "text": "Newer assistants can call tools and APIs on their own: query telemetry, read configurations, open tickets or propose merge requests. Give them their own identity with narrowly scoped, read-only credentials, an allow-list of tools, dry-run modes for anything that would change state, and an approval step before any change. Log every tool call so a human can reconstruct what the assistant did and why."
    },
    {
     "type": "scenario",
     "title": "Auto-remediation proposal",
     "situation": "An engineer proposes that whenever an access-switch uplink flaps more than five times in ten minutes, automation should shut the uplink and force traffic to the redundant one, with no human involved. Uplinks are dual-homed. What do you recommend?",
     "options": [
      {
       "text": "Collect evidence and ticket first; add shutdown later with health pre-checks and rate limits.",
       "feedback": "Correct. Automate diagnostics first, then the action, with conditions that prevent it from isolating a switch.",
       "best": true
      },
      {
       "text": "Approve the proposal as written, because the uplinks are dual-homed and therefore redundant.",
       "feedback": "If the second uplink is also degraded, or the event is misreported, the switch is isolated automatically.",
       "best": false
      },
      {
       "text": "Reject automation entirely, because interface flaps must always be handled manually by people.",
       "feedback": "That ignores a safe, valuable first step: automatic evidence collection.",
       "best": false
      },
      {
       "text": "Let an AI assistant decide case by case whether to shut each uplink, and apply its choice.",
       "feedback": "Unreviewed AI-driven changes bypass the guardrails this lesson describes.",
       "best": false
      }
     ]
    },
    {
     "type": "terms",
     "items": [
      {
       "term": "Event-driven automation",
       "def": "Workflows triggered automatically by events such as alerts, logs or tickets, rather than run by hand on a schedule."
      },
      {
       "term": "Enrichment",
       "def": "Adding context (device role, recent changes, topology) to an event before deciding how to respond."
      },
      {
       "term": "Kill switch",
       "def": "A single control that halts all automated actions immediately when something goes wrong."
      }
     ]
    },
    {
     "type": "keypoints",
     "title": "Key takeaways",
     "items": [
      "Event-driven workflows detect, enrich, decide, act, verify and record.",
      "Start with read-only actions; automate changes only with pre-checks, rate limits and a kill switch.",
      "AI suggestions are hypotheses: ground them in your data and route changes through the pipeline.",
      "Redact secrets and personal data, scope assistant credentials and log every action."
     ]
    },
    {
     "type": "quiz",
     "items": [
      {
       "q": "What is the safest first action for most event-driven network workflows?",
       "options": [
        "Shutting down the interface that raised the event",
        "Reloading the device to clear transient state",
        "Collecting diagnostics and attaching them to a ticket",
        "Reverting the device to the configuration from last week"
       ],
       "answer": 2,
       "explain": "Read-only actions add value immediately and cannot make the outage worse."
      },
      {
       "q": "An AI assistant suggests a BGP policy change during an incident. How should it be applied?",
       "options": [
        "Directly on the device, because the incident is urgent and time matters",
        "As a merge request through the normal pipeline and review",
        "Only on the core routers where the impact is highest",
        "By pasting it into the console of every affected router"
       ],
       "answer": 1,
       "explain": "AI-generated changes follow the same controls as human ones."
      },
      {
       "q": "Why redact data before using external AI tools during troubleshooting?",
       "options": [
        "Configs and logs may hold secrets and personal or customer data",
        "External tools cannot read any text that includes IP addresses or hostnames",
        "Redaction makes the suggestions more accurate in every case",
        "Logs must be shortened to fit within the tool's display"
       ],
       "answer": 0,
       "explain": "Credentials and personal data must never leave controlled systems."
      },
      {
       "q": "What does 'enrichment' add in an event-driven workflow?",
       "options": [
        "Context: device role, recent changes and topology",
        "Encryption of the event payload as it moves between systems",
        "Compression of telemetry data before it is stored",
        "A second copy of the event for disaster recovery"
       ],
       "answer": 0,
       "explain": "Context turns a raw alert into something a rule or person can act on correctly."
      },
      {
       "q": "Which guardrail limits damage if an automated workflow misbehaves?",
       "options": [
        "A larger webhook port range on the automation server",
        "More detailed log messages from every network device",
        "Faster telemetry sampling for every interface in the whole network",
        "Rate limits on actions plus a kill switch for all workflows"
       ],
       "answer": 3,
       "explain": "Bounding how fast automation acts, and being able to stop it, contains failures."
      }
     ]
    }
   ]
  },
  {
   "id": "m8-l5",
   "title": "The ZCNP Fabric End to End and Your Capstone",
   "subtitle": "One network, eight stages, and the project that proves you can run them all",
   "minutes": 45,
   "objectives": [
    "Trace a user's traffic and an engineer's change through all eight Fabric stages.",
    "Connect design artefacts from every module into one coherent package.",
    "Plan your capstone deliverables and milestones."
   ],
   "blocks": [
    {
     "type": "text",
     "text": "You have now worked through all eight stages of **The ZCNP Fabric**. Real networks do not respect module boundaries: a voice call from a ward tablet crosses wireless, the campus, an overlay, the WAN, a data-centre fabric and back, and every hop is designed, assured and increasingly programmed. This lesson stitches the stages together and introduces your capstone."
    },
    {
     "type": "framework",
     "title": "The ZCNP Fabric, stage by stage",
     "items": [
      {
       "label": "ARC",
       "title": "Architect",
       "text": "Campus, spine-leaf and high-availability design set the shape of everything else."
      },
      {
       "label": "SW",
       "title": "Switch",
       "text": "A loop-free, protected Layer 2 edge with RSTP/MST and edge protections."
      },
      {
       "label": "IGP",
       "title": "IGP",
       "text": "OSPF and IS-IS design, redistribution and policy routing give stable reachability."
      },
      {
       "label": "BGP",
       "title": "BGP",
       "text": "Policy, scale and resilience at the edges and in the core."
      },
      {
       "label": "OVL",
       "title": "Overlay",
       "text": "VRFs, tunnels, IPsec, VXLAN EVPN and SD-WAN create logical networks on the underlay."
      },
      {
       "label": "WLS",
       "title": "Wireless",
       "text": "RF design, roaming, security and QoS extend the network to every mobile user and device."
      },
      {
       "label": "ASR",
       "title": "Assure",
       "text": "Telemetry, probes, troubleshooting, access control and device protection prove and defend service."
      },
      {
       "label": "PRG",
       "title": "Program",
       "text": "Models, APIs, pipelines and event-driven workflows make changes repeatable and safe."
      }
     ]
    },
    {
     "type": "topology",
     "title": "A voice call through the Fabric",
     "nodes": [
      {
       "id": "ph",
       "kind": "phone",
       "label": "Ward handset",
       "x": 0.5,
       "y": 4.5,
       "sub": "EAP-TLS, role CLINICAL"
      },
      {
       "id": "ap",
       "kind": "ap",
       "label": "AP",
       "x": 0.5,
       "y": 3,
       "sub": "WPA3-Enterprise"
      },
      {
       "id": "acc",
       "kind": "switch",
       "label": "Access switch",
       "x": 2,
       "y": 3
      },
      {
       "id": "dist",
       "kind": "l3switch",
       "label": "Distribution",
       "x": 2,
       "y": 1.5,
       "sub": "VRF CORP"
      },
      {
       "id": "edge",
       "kind": "router",
       "label": "SD-WAN edge",
       "x": 3.5,
       "y": 1.5,
       "sub": "VOICE SLA class"
      },
      {
       "id": "wan",
       "kind": "cloud",
       "label": "WAN overlay",
       "x": 4.75,
       "y": 0
      },
      {
       "id": "hub",
       "kind": "router",
       "label": "DC hub",
       "x": 6,
       "y": 1.5
      },
      {
       "id": "leaf",
       "kind": "l3switch",
       "label": "DC leaf",
       "x": 6,
       "y": 3,
       "sub": "BGP EVPN fabric"
      },
      {
       "id": "cc",
       "kind": "server",
       "label": "Call control",
       "x": 6,
       "y": 4.5
      },
      {
       "id": "mon",
       "kind": "monitor",
       "label": "Probes",
       "x": 3.5,
       "y": 4.5,
       "sub": "jitter, telemetry"
      }
     ],
     "links": [
      {
       "a": "ph",
       "b": "ap",
       "style": "wireless"
      },
      {
       "a": "ap",
       "b": "acc"
      },
      {
       "a": "acc",
       "b": "dist"
      },
      {
       "a": "dist",
       "b": "edge"
      },
      {
       "a": "edge",
       "b": "wan",
       "style": "tunnel"
      },
      {
       "a": "wan",
       "b": "hub",
       "style": "tunnel"
      },
      {
       "a": "hub",
       "b": "leaf"
      },
      {
       "a": "leaf",
       "b": "cc"
      },
      {
       "a": "mon",
       "b": "edge",
       "label": "probes",
       "style": "dashed"
      },
      {
       "a": "mon",
       "b": "hub",
       "style": "dashed"
      }
     ],
     "zones": [
      {
       "label": "Hospital branch",
       "x": 0,
       "y": 1.5,
       "w": 4,
       "h": 3.5,
       "tone": "accent"
      },
      {
       "label": "Data centre",
       "x": 5.5,
       "y": 1.5,
       "w": 1.5,
       "h": 3.5
      }
     ],
     "caption": "Wireless and NAC admit the handset, the switching and routing stages carry it resiliently in VRF CORP, the overlay picks a path that meets the VOICE SLA, and the EVPN fabric delivers it to call control. Probes prove the SLA every minute, and every setting on the path was deployed from Git through the pipeline."
    },
    {
     "type": "table",
     "head": [
      "Stage",
      "Key artefact",
      "Verified by"
     ],
     "rows": [
      [
       "Architect",
       "High-level and low-level design",
       "Design review and failure-mode analysis"
      ],
      [
       "Switch / IGP / BGP",
       "Protocol design and routing policy",
       "Lab tests and convergence measurements"
      ],
      [
       "Overlay",
       "VRF and route-target plan, tunnel and SD-WAN policy",
       "Intent tests and path-steering tests"
      ],
      [
       "Wireless",
       "WLAN design sheet and validation survey",
       "Survey report and roaming test walks"
      ],
      [
       "Assure",
       "Telemetry KPI sheet, NAC policy, hardening baseline",
       "Dashboards, audits and incident drills"
      ],
      [
       "Program",
       "Repository, pipeline and pre/post checks",
       "Pipeline runs and change failure rate"
      ]
     ],
     "title": "Artefacts that connect the stages"
    },
    {
     "type": "text",
     "text": "Your **capstone** asks you to take one realistic organisation through the whole Fabric. You will design a multi-site network with a campus, at least two branches, a data-centre fabric and enterprise wireless; segment it with VRFs; connect it with an overlay WAN; define how it is assured and protected; and automate at least one meaningful change end to end with tests and pre/post checks. The organisation can be real (anonymised) or realistic, such as a hospital group, a university, a ministry or a regional bank."
    },
    {
     "type": "steps",
     "title": "Capstone milestones",
     "items": [
      {
       "title": "Requirements and constraints",
       "text": "Users, sites, applications and their SLAs, security and compliance needs, budget and growth."
      },
      {
       "title": "Architecture",
       "text": "Topology, high availability, IGP and BGP design, with rationale."
      },
      {
       "title": "Overlay and segmentation",
       "text": "VRF and route-target plan, WAN overlay and SD-WAN policy, data-centre fabric."
      },
      {
       "title": "Wireless",
       "text": "WLAN design sheet for at least two contrasting areas, security and QoS."
      },
      {
       "title": "Assurance and protection",
       "text": "Telemetry KPI sheet, NAC rollout plan, CoPP and hardening baseline, troubleshooting runbook."
      },
      {
       "title": "Automation",
       "text": "A Git repository with intent data, templates, tests and a pipeline that deploys one change with pre/post checks."
      },
      {
       "title": "Defence",
       "text": "A short presentation of key decisions, trade-offs and risks."
      }
     ]
    },
    {
     "type": "template",
     "title": "Capstone design decision log",
     "purpose": "Record each significant decision with its alternatives and evidence, so reviewers can follow your reasoning across all eight stages.",
     "columns": [
      "Stage",
      "Decision",
      "Alternatives considered",
      "Why this choice",
      "Risk and mitigation",
      "How it is verified"
     ],
     "example": [
      [
       "Overlay",
       "SD-WAN with DIA for approved SaaS; tax systems pinned to MPLS",
       "Central breakout; full DIA",
       "Lower SaaS latency without exposing critical apps",
       "Inconsistent security at branches: cloud security service with one policy",
       "Path-steering tests and monthly SLA report"
      ],
      [
       "Program",
       "NETCONF confirmed commits from the pipeline",
       "Ansible CLI push; manual change",
       "Atomic per device with automatic rollback",
       "Pipeline outage: documented manual fallback",
       "Canary run with post-checks"
      ]
     ],
     "rows": 10
    },
    {
     "type": "checklist",
     "title": "Capstone readiness checklist",
     "items": [
      "Requirements include measurable SLAs for at least three applications.",
      "Every design choice is logged with alternatives and evidence.",
      "The VRF and route-target plan, WLAN design sheet and telemetry KPI sheet are complete.",
      "NAC and hardening plans include phased rollout and rollback.",
      "The repository contains intent data, templates, tests and a pipeline definition.",
      "One change has run through the pipeline with pre-checks, canary and post-checks.",
      "A troubleshooting runbook covers the three most likely failure scenarios.",
      "No secrets, real customer data or proprietary configurations are included."
     ]
    },
    {
     "type": "scenario",
     "title": "Where to start the capstone",
     "situation": "You have six weeks for the capstone. A colleague suggests starting by writing the automation pipeline because it is the most impressive part. What is the best starting point?",
     "options": [
      {
       "text": "Build the pipeline first and fit the design around whatever the pipeline is able to deploy.",
       "feedback": "This lets tooling drive the design and usually produces an incoherent network.",
       "best": false
      },
      {
       "text": "Spend the six weeks perfecting the wireless design, because it is the most visible part.",
       "feedback": "The capstone assesses the whole Fabric, not one stage.",
       "best": false
      },
      {
       "text": "Copy a published reference design, change the names, and focus the remaining time on automation.",
       "feedback": "Original reasoning and decisions are what the capstone assesses.",
       "best": false
      },
      {
       "text": "Start with requirements and architecture, then automate a change that the design actually needs.",
       "feedback": "Correct. Automation encodes intent; without a clear design there is nothing trustworthy to automate.",
       "best": true
      }
     ]
    },
    {
     "type": "reflection",
     "prompt": "Look back over all eight stages. Which stage is strongest in the network you work on today, which is weakest, and what single change would most improve the weakest one in the next three months?"
    },
    {
     "type": "terms",
     "items": [
      {
       "term": "The ZCNP Fabric",
       "def": "The eight-stage professional framework of this programme: Architect, Switch, IGP, BGP, Overlay, Wireless, Assure and Program."
      },
      {
       "term": "Design decision log",
       "def": "A record of significant design choices, the alternatives considered, the evidence and the verification method."
      }
     ]
    },
    {
     "type": "keypoints",
     "title": "Key takeaways",
     "items": [
      "Real traffic crosses every Fabric stage, so design decisions must be reviewed against all eight.",
      "Each stage leaves an artefact that the next can verify: designs, plans, sheets, tests and runbooks.",
      "Start the capstone from requirements and architecture, then automate a change the design really needs.",
      "Log every significant decision with its alternatives, evidence and verification."
     ]
    },
    {
     "type": "quiz",
     "items": [
      {
       "q": "A branch voice call depends on an SD-WAN SLA class. Which Fabric stage proves the SLA is being met?",
       "options": [
        "Architect, through the high-level design",
        "Assure, through probes and telemetry",
        "Switch, through spanning-tree protection",
        "Wireless, through the channel plan"
       ],
       "answer": 1,
       "explain": "Assurance measures service continuously; design stages set it up."
      },
      {
       "q": "Which artefact links the Overlay stage to automated testing in the Program stage?",
       "options": [
        "The radio channel plan for each floor of every building",
        "The syslog severity table on each device",
        "The VRF and route-target plan held as intent data",
        "The spanning-tree root bridge priorities"
       ],
       "answer": 2,
       "explain": "Intent tests in the pipeline enforce the VRF and RT plan."
      },
      {
       "q": "Why should the capstone automate a change that the design actually needs?",
       "options": [
        "Automated changes do not need to be tested in a lab beforehand",
        "Pipelines can only deploy changes that were chosen after the design was finished",
        "Reviewers only assess automation that changes wireless settings",
        "Automation should encode real intent, proving design and pipeline together"
       ],
       "answer": 3,
       "explain": "Automation without design intent demonstrates tooling, not engineering."
      },
      {
       "q": "What is the main purpose of a design decision log?",
       "options": [
        "To show the alternatives, evidence and checks behind each choice",
        "To list every command entered on every device in the network over time",
        "To replace the low-level design with a shorter document",
        "To record the names of engineers who approved changes"
       ],
       "answer": 0,
       "explain": "Reviewers need the reasoning, not only the result."
      },
      {
       "q": "In the voice-call walk-through, how did the SSID, VRF and SLA policy reach the network?",
       "options": [
        "By manual configuration during a weekend window",
        "From version control through the CI/CD pipeline",
        "By the wireless clients requesting them at join time",
        "By the RADIUS server writing device configuration"
       ],
       "answer": 1,
       "explain": "The Program stage makes every other stage's configuration repeatable and reviewable."
      }
     ]
    }
   ]
  }
 ]
});
TRACK.exam.push([
 {
  "module": "m5",
  "q": "A company adds an IOT VRF to its campus. Transit links between distribution and core use VRF-lite, and the IoT management platform sits in a shared-services VRF. IoT devices reach each other but not the platform. What should the engineer do FIRST?",
  "options": [
   "Give the IOT VRF the same route distinguisher as the shared-services VRF on every hop",
   "Move the IoT management platform into the global routing table so all VRFs can see it",
   "Leak the platform prefix into IOT and the IoT subnets back, via the policy point",
   "Replace VRF-lite with a single flat VLAN for IoT devices and the management platform"
  ],
  "answer": 2,
  "explain": "Inter-VRF reachability needs routes leaked in both directions at a controlled point. RDs never control import, the global table is not visible from a VRF, and flattening the network removes segmentation."
 },
 {
  "module": "m5",
  "q": "A GRE tunnel between HQ and a branch flaps roughly every minute. The logs show the tunnel being disabled because of recursive routing. The branch advertises its WAN subnet into OSPF over the tunnel. What is the most effective fix?",
  "options": [
   "Increase the OSPF cost on the tunnel so that the physical path is preferred",
   "Shorten the GRE keepalive timers so the tunnel recovers more quickly each time",
   "Change the tunnel mode to IP-in-IP",
   "Keep the WAN subnet out of the overlay IGP, or use a front-door VRF"
  ],
  "answer": 3,
  "explain": "The tunnel destination is being learned through the tunnel. Separating transport and overlay routing removes the loop; cost changes lose to longer prefixes, and timers or encapsulation changes do not address the cause."
 },
 {
  "module": "m5",
  "q": "An IKEv2 tunnel to a partner fails during IKE_SA_INIT with a 'no proposal chosen' notification. Authentication has not yet been attempted. What is the most likely cause?",
  "options": [
   "The pre-shared key configured on the partner's router does not match HQ's key",
   "The partner's routing table has no return route to the tunnel subnet",
   "The peers do not share a common encryption, PRF or Diffie-Hellman group",
   "The tunnel IP MTU is larger than the path MTU between the two peers"
  ],
  "answer": 2,
  "explain": "IKE_SA_INIT negotiates algorithms and DH. A PSK mismatch appears later in IKE_AUTH; routing and MTU problems appear after the SA is established."
 },
 {
  "module": "m5",
  "q": "On a route-based IPsec tunnel, `#pkts encaps` increases on HQ but `#pkts decaps` stays at zero, while the IKEv2 SA is established. What should be investigated next?",
  "options": [
   "The IKEv2 proposal and transform set configured on the HQ router",
   "The branch's return routing, NAT or filtering into its tunnel",
   "The certificate chain used by HQ to authenticate itself to the branch",
   "The GRE keepalive configuration on both of the tunnel interfaces"
  ],
  "answer": 1,
  "explain": "A working SA with traffic leaving but none returning points to the far side not sending protected traffic back. Crypto parameters are already agreed."
 },
 {
  "module": "m5",
  "q": "In a hub-and-spoke dynamic multipoint VPN, spoke-to-spoke traffic always passes through the hub even though direct tunnels are expected. Spokes are registered with the hub. Which configuration is most likely missing?",
  "options": [
   "NHRP redirect on the hub and NHRP shortcut on the spokes",
   "A route distinguisher on the hub's multipoint tunnel interface",
   "A separate point-to-point GRE tunnel between every pair of spokes",
   "IPsec NAT traversal on the hub's internet-facing interface"
  ],
  "answer": 0,
  "explain": "Redirect tells the spoke a better path exists; shortcut lets it resolve the peer and install the direct route. Static spoke-to-spoke tunnels defeat the purpose of the design."
 },
 {
  "module": "m5",
  "q": "A new VXLAN EVPN fabric passes all ping tests between servers, but database replication and backups between racks stall. Which check should come FIRST?",
  "options": [
   "The BGP EVPN route-target import configuration on every leaf switch",
   "A full-size do-not-fragment ping between VTEP loopbacks",
   "Spanning-tree root placement on the spines",
   "The anycast gateway MAC address configured on each leaf switch"
  ],
  "answer": 1,
  "explain": "Size-dependent failures point to MTU: VXLAN adds 50 bytes, so the underlay must carry more than the host MTU. Route-target problems break all traffic, not only large packets."
 },
 {
  "module": "m5",
  "q": "A leaf receives a Type 2 EVPN route for a remote server in VNI 20020 but does not install it, and the servers cannot communicate. What is the most likely cause?",
  "options": [
   "Its route targets do not match the local import policy for VNI 20020",
   "The underlay MTU on the spine links is set to 1,500 bytes",
   "The local leaf has no Type 5 route for the tenant VRF's subnet prefix in BGP",
   "The remote leaf is using a different UDP source port for VXLAN"
  ],
  "answer": 0,
  "explain": "Received but not installed means import policy rejected it, and RTs are that policy. MTU affects data, Type 5 carries prefixes, and source ports vary by design."
 },
 {
  "module": "m5",
  "q": "An SD-WAN branch has MPLS and broadband. Video calls to a cloud collaboration service hairpin through the data centre and perform poorly. Security policy requires all internet traffic to be inspected. What design best improves the experience?",
  "options": [
   "Send all internet traffic directly from the branch and remove inspection for speed",
   "Increase the MPLS bandwidth so the hairpinned video has more capacity available",
   "Local breakout for the approved service, with cloud or edge security inspection",
   "Move video traffic into the bulk SLA class so it uses the cheapest available path"
  ],
  "answer": 2,
  "explain": "Local breakout for trusted SaaS removes the hairpin, while consistent inspection meets the security requirement. More MPLS bandwidth does not remove the added latency."
 },
 {
  "module": "m6",
  "q": "A voice WLAN shows strong signal everywhere in a survey, but handset users report one-way audio near the edges of cells. AP transmit power is set to maximum. What is the most likely cause?",
  "options": [
   "DFS radar events moving the APs to new channels during every call",
   "802.11k neighbour reports listing too many candidate APs for the handsets",
   "WMM mapping voice into the video access category instead of voice",
   "Link asymmetry: handsets hear the APs, but the APs miss the handsets"
  ],
  "answer": 3,
  "explain": "High AP power with low client power creates links that work in one direction only. Matching power and fixing placement resolves it."
 },
 {
  "module": "m6",
  "q": "A university lecture hall needs Wi-Fi for 300 laptops and phones. The design team proposes 160 MHz channels on 5 GHz for maximum speed. What is the best recommendation?",
  "options": [
   "Use narrower channels for reuse, and wider ones only on 6 GHz",
   "Approve 160 MHz on 5 GHz because wider channels always increase total capacity",
   "Disable 5 GHz and serve all students on 2.4 GHz",
   "Use one high-power AP at the front of the hall to avoid co-channel interference"
  ],
  "answer": 0,
  "explain": "High density is limited by contention; more, narrower channels allow more APs to work in parallel. 6 GHz has room for wider channels."
 },
 {
  "module": "m6",
  "q": "Clinicians' voice badges pause for about half a second when roaming on an 802.1X SSID; the RADIUS server is in a remote data centre. Which change most directly reduces roam time?",
  "options": [
   "Increase the AP transmit power on every floor so that the badges roam less often",
   "Enable 802.11r Fast BSS Transition after testing the badges for compatibility",
   "Move the voice SSID to 2.4 GHz so the badges stay connected longer",
   "Disable protected management frames on the clinical voice SSID to speed up roams"
  ],
  "answer": 1,
  "explain": "FT removes the full EAP exchange with the remote RADIUS server from each roam. Power and band changes do not shorten the key exchange; disabling PMF weakens security."
 },
 {
  "module": "m6",
  "q": "A security audit finds that staff laptops connect to a look-alike SSID in the car park and submit credentials. The corporate SSID uses PEAP-MSCHAPv2. What is the most effective remediation?",
  "options": [
   "Hide the corporate SSID so that it is no longer broadcast in beacons",
   "Increase the minimum password length for every user account",
   "Reduce AP transmit power so the SSID does not reach the car park",
   "EAP-TLS with device certificates and enforced server validation"
  ],
  "answer": 3,
  "explain": "Certificate-based authentication with enforced server validation removes the credential-harvesting attack. Hidden SSIDs, password policy and power changes do not stop impersonation."
 },
 {
  "module": "m6",
  "q": "A new building will use 6 GHz radios. The team plans to reuse the existing WPA2-Enterprise SSID on all bands. What is the issue?",
  "options": [
   "6 GHz radios only support personal security with a shared passphrase",
   "WPA2-Enterprise requires 320 MHz channels when it is used on 6 GHz",
   "6 GHz requires WPA3 or OWE, so the SSID cannot use 6 GHz",
   "6 GHz radios cannot use RADIUS"
  ],
  "answer": 2,
  "explain": "6 GHz operation requires WPA3 or OWE with PMF; legacy WPA2 SSIDs cannot be broadcast there."
 },
 {
  "module": "m6",
  "q": "A voice SSID carries traffic marked DSCP EF from managed handsets, but calls degrade when the cell is busy with downloads. The AP maps all traffic to best effort. What should be configured?",
  "options": [
   "Map DSCP EF to user priority 1 so voice uses the background category",
   "Disable WMM so that all traffic shares a single fair queue on the AP",
   "Raise the AP transmit power",
   "Map DSCP EF to user priority 6, the AC_VO access category"
  ],
  "answer": 3,
  "explain": "WMM prioritisation requires voice to land in AC_VO; EF maps to UP 6 per RFC 8325 guidance."
 },
 {
  "module": "m6",
  "q": "A retailer wants to count visitors in each store using Wi-Fi analytics and compare footfall week by week. What limitation should be explained first?",
  "options": [
   "Randomised MACs make counts estimates; one phone may appear as several",
   "Wi-Fi analytics can only see devices that are associated to a guest SSID",
   "Location engines only work when the APs operate in the 2.4 GHz band",
   "Footfall cannot be measured with Wi-Fi without UWB tags on every visitor"
  ],
  "answer": 0,
  "explain": "Randomised MACs affect counting accuracy. Probe-based analytics can see unassociated devices, but identities are unstable, so treat counts as trends."
 },
 {
  "module": "m7",
  "q": "A NOC uses SNMPv2c with the community string 'public' across 800 devices. An audit requires authenticated and encrypted management traffic. What is the best approach?",
  "options": [
   "Change the community string to a long random value on every device",
   "Migrate to SNMPv3 authPriv users with read-only views and source ACLs",
   "Move SNMP polling to a dedicated VLAN and keep SNMPv2c unchanged",
   "Replace SNMP polling with debug-level syslog sent to the collector"
  ],
  "answer": 1,
  "explain": "Only SNMPv3 authPriv provides authentication and encryption. A new community string is still sent in clear text."
 },
 {
  "module": "m7",
  "q": "A WAN link is congested every morning. Interface graphs confirm high utilisation but not its cause. Which data source should the engineer use to identify the top conversations?",
  "options": [
   "SNMP interface counters polled at a much shorter interval during the busy period",
   "Syslog messages from the router during the busy period",
   "IPFIX flow records exported from the router for the busy period",
   "Control-plane policing counters on the WAN router"
  ],
  "answer": 2,
  "explain": "Flow records show who talked to whom and how much. Counters, syslog and CoPP statistics cannot attribute traffic to conversations."
 },
 {
  "module": "m7",
  "q": "Customers report one-minute outages on a ring several times a week. Five-minute SNMP polling shows nothing. What change gives the NOC visibility of these events?",
  "options": [
   "30-second SNMP polling everywhere",
   "A daily configuration backup compared with the previous day's backup",
   "On-change state telemetry plus 10–30 s counter sampling",
   "Debug logging enabled on all ring routers and sent to the collector"
  ],
  "answer": 2,
  "explain": "On-change subscriptions report state changes immediately and fine-grained sampling catches short events, without the load of aggressive polling."
 },
 {
  "module": "m7",
  "q": "A branch uses a tracked default route with an ICMP probe to the primary ISP and a floating static route to the backup ISP. During a primary ISP outage, the branch keeps flapping between the two ISPs. What is the most likely cause?",
  "options": [
   "The floating static route has a lower administrative distance than the tracked route",
   "The probe frequency is too low to detect the outage within a few seconds",
   "The probe uses ICMP instead of a UDP jitter operation with a responder",
   "The probe target is reachable via the backup path, so the probe recovers"
  ],
  "answer": 3,
  "explain": "Once the primary route is withdrawn, probes follow the backup default and succeed. Pin the probe target to the primary path with a host route."
 },
 {
  "module": "m7",
  "q": "After a routing-policy change, users at one branch cannot reach the data centre. A VRF-aware traceroute from the branch reaches the DC core and then times out. What is the next best step?",
  "options": [
   "Replace the branch router because the traceroute does not complete",
   "Check that the DC has a route back to the branch in that VRF",
   "Check the branch's Wi-Fi channel plan for co-channel interference",
   "Reboot the DC core to clear any stale routing state from memory"
  ],
  "answer": 1,
  "explain": "Forward traffic reaches the core, so the return path is the prime suspect. Following the path in both directions is faster and safer than reboots or replacements."
 },
 {
  "module": "m7",
  "q": "An organisation wants to enforce 802.1X on 4,000 access ports without disrupting users or printers. What is the best rollout approach?",
  "options": [
   "Monitor mode first, fix supplicant and MAB gaps, then low-impact and closed",
   "Enable closed mode on all ports in one weekend and fix failures as they are reported",
   "Use multi-host mode everywhere so one authenticated device opens each port",
   "Rely on MAB for all devices because it needs no supplicant configuration"
  ],
  "answer": 0,
  "explain": "A phased rollout reveals failures before enforcement. Multi-host and MAB-only designs give weak assurance, and a big-bang closed mode risks widespread outages."
 },
 {
  "module": "m7",
  "q": "Security asks how a camera authenticated by MAB should be treated compared with an EAP-TLS laptop. What is the best answer?",
  "options": [
   "As equal trust, since both methods are accepted by the same RADIUS server",
   "As higher trust, because cameras rarely move between switch ports",
   "As untrusted, so it must be placed on the guest SSID and VRF",
   "Lower trust: narrow policy plus profiling, since MACs can be spoofed"
  ],
  "answer": 3,
  "explain": "MAB proves only a MAC address. Profiling and least-privilege policy limit what a spoofed MAC could reach."
 },
 {
  "module": "m7",
  "q": "During a flood towards a core router's own addresses, OSPF and BGP sessions drop although links are not saturated. Which combination gives the best protection?",
  "options": [
   "An edge infrastructure ACL plus CoPP protecting routing protocols",
   "Longer OSPF and BGP hold timers to keep sessions up during floods",
   "A router with a faster CPU so it can process the flood traffic",
   "Blocking all ICMP on every interface of the core routers"
  ],
  "answer": 0,
  "explain": "The iACL stops most traffic to device addresses at the border and CoPP protects what reaches the CPU. Timers, hardware and blanket ICMP blocking do not address the cause."
 },
 {
  "module": "m8",
  "q": "A team must apply a multi-part BGP change to 60 routers so that each router gets all of it or none of it, with automatic rollback if access is lost. All routers support NETCONF with a candidate datastore. Which method fits best?",
  "options": [
   "A series of RESTCONF PATCH requests, one per configuration section",
   "NETCONF edit-config to candidate, validate, then a confirmed commit",
   "A gNMI Subscribe request in on-change mode for each BGP neighbour",
   "CLI commands sent over SSH and checked with regular expressions"
  ],
  "answer": 1,
  "explain": "Candidate plus confirmed commit gives an atomic change with automatic rollback. Separate PATCH calls commit individually; Subscribe is telemetry."
 },
 {
  "module": "m8",
  "q": "A RESTCONF GET for interface GigabitEthernet0/0/1 returns 404 although the interface exists. The URL ends in `interface=GigabitEthernet0/0/1`. What is the most likely issue?",
  "options": [
   "RESTCONF cannot read interfaces whose names contain digits",
   "The request used JSON instead of XML for the Accept header",
   "The slashes in the key value were not percent-encoded as %2F",
   "The interface must first be locked with a NETCONF lock operation"
  ],
  "answer": 2,
  "explain": "Reserved characters in list keys must be percent-encoded; otherwise the server interprets them as path separators."
 },
 {
  "module": "m8",
  "q": "A Python script adds an ACL entry to edge routers. Run twice, it created duplicates and broke the ACL. What is the best fix?",
  "options": [
   "Add a warning comment at the top of the script about running it twice",
   "Diff intended against current state and apply only the difference",
   "Schedule the script to run only during weekend maintenance windows",
   "Rewrite the script in another language with better error handling"
  ],
  "answer": 1,
  "explain": "Idempotency comes from comparing desired and actual state. Comments, timing and language choice do not fix the logic."
 },
 {
  "module": "m8",
  "q": "A pull request changes the GUEST VRF import list. Lint passes but an intent test that forbids GUEST importing CORP routes fails. The change is urgent. What should happen?",
  "options": [
   "Merge the change now and disable the failing test until next week's release",
   "Apply the change manually on the devices and skip the pipeline",
   "Delete the intent test because it is blocking an urgent change",
   "Keep the gate: investigate, then fix the data or formally change the rule"
  ],
  "answer": 3,
  "explain": "The test protects a security boundary. Bypassing or deleting it, or changing devices out of band, creates risk and drift."
 },
 {
  "module": "m8",
  "q": "A NetDevOps team wants to limit the impact of a bad change that passed all lab tests. Which pipeline practice helps most?",
  "options": [
   "Canary waves with automated post-checks and rollback",
   "A larger number of linting rules applied to the YAML files",
   "A faster template rendering stage in the build environment",
   "Two approvers on every merge request"
  ],
  "answer": 0,
  "explain": "Canary waves with post-checks catch production-only issues on a few devices and reverse them. More linting or approvers cannot detect runtime behaviour."
 },
 {
  "module": "m8",
  "q": "An operations team proposes that event-driven automation should immediately shut any access uplink that flaps more than five times. What is the best first implementation?",
  "options": [
   "Shut the uplink automatically from day one because uplinks are redundant",
   "Let an AI assistant decide whether to shut each uplink and apply it directly",
   "Collect diagnostics and open a ticket first; add shutdown later with safeguards",
   "Handle all flaps manually and avoid automation for interface events"
  ],
  "answer": 2,
  "explain": "Read-only automation adds value safely; any automatic change needs conditions such as a healthy redundant path and rate limits. Unreviewed AI actions bypass guardrails."
 },
 {
  "module": "m8",
  "q": "An engineer wants to paste full router configurations into an external AI tool to help troubleshoot. What guardrail applies first?",
  "options": [
   "Redact secrets and customer data, and use only approved tools",
   "Paste the configurations in smaller pieces to fit the input size",
   "Convert the configurations to JSON before pasting them into the tool",
   "Ask the tool to delete the configurations after it has answered"
  ],
  "answer": 0,
  "explain": "Configurations contain secrets and sensitive data. Redaction and approved, controlled tools come before any analysis."
 }
]);
