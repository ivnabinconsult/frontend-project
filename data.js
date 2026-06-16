// Product Database
const products = [
  { 
    id: 'smart-mirror', 
    name: 'Lux Smart Mirror M2', 
    cat: 'Smart Home', 
    catKey: 'tech', 
    price: 485000, 
    desc: 'Touch-enabled ambient mirror with voice assistant, integrated lighting, and smart home controls.', 
    imgs: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80'] 
  },
  { 
    id: 'design-package', 
    name: 'Signature Room Package', 
    cat: 'Interior Design', 
    catKey: 'interior', 
    price: 1200000, 
    desc: 'Complete room transformation service including furniture, decor, and layout planning.', 
    imgs: ['https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&q=80'] 
  },
  { 
    id: 'ambient-system', 
    name: 'Halo Ambient System', 
    cat: 'Lighting', 
    catKey: 'lighting', 
    price: 192000, 
    desc: 'Complete room ambient lighting ecosystem with 16M colors and smart scheduling.', 
    imgs: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80'] 
  },
  { 
    id: 'smart-speaker', 
    name: 'Arc Sound Column', 
    cat: 'Smart Home', 
    catKey: 'tech', 
    price: 98000, 
    desc: 'Architectural speaker column with 360° spatial audio and voice assistant integration.', 
    imgs: ['https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=600&q=80'] 
  },

  // ── Furniture & Doors ──────────────────────────
  { 
    id: 'sectional-black-sofa', 
    name: 'Monolith Black Sectional', 
    cat: 'Furniture & Doors', 
    catKey: 'furniture', 
    price: 980000, 
    desc: 'L-shaped modular sectional sofa in deep black upholstery with a matching storage ottoman.', 
    imgs: ['images/black_door.jpg'] 
  },
  { 
    id: 'crimson-sofa', 
    name: 'Ember Crimson Sofa', 
    cat: 'Furniture & Doors', 
    catKey: 'furniture', 
    price: 620000, 
    desc: 'Compact two-seater sofa upholstered in rich crimson fabric with clean architectural lines.', 
    imgs: ['images/brown_couch.jpg'] 
  },
  { 
    id: 'wood-coffee-table', 
    name: 'Axis Round Coffee Table', 
    cat: 'Furniture & Doors', 
    catKey: 'furniture', 
    price: 145000, 
    desc: 'Round white-top coffee table with a solid wood X-base, ideal for minimalist living rooms.', 
    imgs: ['images/round-wood-coffee-table.jpg'] 
  },
  { 
    id: 'glass-panel-front-door', 
    name: 'Meridian Glass-Panel Door', 
    cat: 'Furniture & Doors', 
    catKey: 'furniture', 
    price: 540000, 
    desc: 'Modern front entry door with frosted glass panel inserts and matching sidelights for natural light.', 
    imgs: ['images/modern-glass-panel-door.jpg'] 
  },
  { 
    id: 'bronze-fluted-door', 
    name: 'Solace Bronze Fluted Door', 
    cat: 'Furniture & Doors', 
    catKey: 'furniture', 
    price: 610000, 
    desc: 'Espresso-finish entry door with fluted detailing, brass hardware, and a slim sidelight panel.', 
    imgs: ['images/storm-grey-pvc-door.jpg'] 
  },
  { 
    id: 'classic-black-door', 
    name: 'Onyx Classic Panel Door', 
    cat: 'Furniture & Doors', 
    catKey: 'furniture', 
    price: 285000, 
    desc: 'Timeless matte black interior door with raised panel molding and brushed nickel handle.', 
    imgs: ['images/classic-black-panel-door.jpg'] 
  },
  { 
    id: 'modular-black-kitchen', 
    name: 'Nocturne Modular Kitchen Suite', 
    cat: 'Furniture & Doors', 
    catKey: 'furniture', 
    price: 2450000, 
    desc: 'Full studio kitchen system in matte black and warm oak, with integrated cabinetry and worktop.', 
    imgs: ['images/black-modular-kitchen.jpg'] 
  },

  // ── Smart Home / Tech ──────────────────────────
  { 
    id: 'retro-fridge', 
    name: 'Heritage Retro Fridge', 
    cat: 'Smart Home', 
    catKey: 'tech', 
    price: 720000, 
    desc: 'Double-door refrigerator with a statement stainless retro finish and digital temperature display.', 
    imgs: ['images/retro-fridge-silver.jpg'] 
  },
  { 
    id: 'smart-tv-43', 
    name: 'Vista 43" Smart TV', 
    cat: 'Smart Home', 
    catKey: 'tech', 
    price: 265000, 
    desc: '43-inch Smart TV with HDR10, Dolby Audio, and built-in streaming apps for a complete home cinema feel.', 
    imgs: ['images/smart-tv-43-roku.jpg'] 
  },
  { 
    id: 'tv-feature-console', 
    name: 'Crimson Glow TV Console', 
    cat: 'Smart Home', 
    catKey: 'tech', 
    price: 410000, 
    desc: 'Floating media console with integrated red ambient lighting, soundbar shelf, and tempered glass top.', 
    imgs: ['images/red-led-tv-console.jpg'] 
  },

  // ── Lighting ────────────────────────────────────
  { 
    id: 'led-strip-rgb', 
    name: 'Spectrum RGB LED Strip', 
    cat: 'Lighting', 
    catKey: 'lighting', 
    price: 28500, 
    desc: '5050 RGB USB LED strip with flexible mounting and app-controlled color changing modes.', 
    imgs: ['images/led-strip-rgb.jpg'] 
  },
  { 
    id: 'corner-floor-lamp-rainbow', 
    name: 'Prism Corner Floor Lamp', 
    cat: 'Lighting', 
    catKey: 'lighting', 
    price: 86000, 
    desc: 'Minimalist tripod corner lamp casting a full-spectrum RGB wash across walls and ceiling.', 
    imgs: ['images/rainbow-corner-floor-lamp.jpg'] 
  },
  { 
    id: 'corner-lamp-vertical', 
    name: 'Aurora Vertical Corner Lamp', 
    cat: 'Lighting', 
    catKey: 'lighting', 
    price: 92000, 
    desc: 'Slim vertical LED corner lamp with smooth color gradients, perfect for accenting living spaces.', 
    imgs: ['images/rgb-corner-lamp-couch.jpg'] 
  },
  { 
    id: 'ambient-table-lamps', 
    name: 'Halo Ambient Table Lamps (Pair)', 
    cat: 'Lighting', 
    catKey: 'lighting', 
    price: 54000, 
    desc: 'Set of two globe-shaped warm ambient lamps designed to flank a TV console or sideboard.', 
    imgs: ['images/sunset-ambient-tv-lamps.jpg'] 
  },

  // ── Interior Design ─────────────────────────────
  { 
    id: 'neutral-living-room-package', 
    name: 'Serene Neutral Room Package', 
    cat: 'Interior Design', 
    catKey: 'interior', 
    price: 1450000, 
    desc: 'Full living room styling package featuring warm wood accents, layered textiles, and curated decor.', 
    imgs: ['images/neutral-wood-living-room.jpg'] 
  },
  { 
    id: 'tv-feature-wall-package', 
    name: 'Frame Feature Wall Package', 
    cat: 'Interior Design', 
    catKey: 'interior', 
    price: 980000, 
    desc: 'Custom TV feature wall design and installation with ambient lighting and built-in media shelving.', 
    imgs: ['images/tv-feature-wall.jpg'] 
  }
];

function formatNGN(n) { 
  return '₦' + n.toLocaleString('en-NG'); 
}