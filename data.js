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
  }
];

function formatNGN(n) { 
  return '₦' + n.toLocaleString('en-NG'); 
}