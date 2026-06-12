let pfOpen = false;

function pfToggle() {
  pfOpen = !pfOpen;
  const pfWin = document.getElementById('pf-window');
  if (pfWin) {
    pfWin.classList.toggle('open', pfOpen);
  }
  if (pfOpen && document.getElementById('pf-messages').children.length === 0) {
    pfAddMessage('bot', "Hi! I'm Cyllux AI. Need help with interior design, smart tech, or pricing? Ask away! ✨");
  }
}

function pfAddMessage(role, text) {
  const container = document.getElementById('pf-messages');
  if (!container) return;
  const div = document.createElement('div');
  div.className = `pf-bubble ${role}`;
  div.textContent = text;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

async function pfSend() {
  const input = document.getElementById('pf-input');
  const text = input?.value.trim();
  if (!text) return;
  if (input) input.value = '';
  
  pfAddMessage('user', text);
  
  // Simulated AI response
  setTimeout(() => {
    let reply = "We offer premium interior design packages and smart home solutions. Check our catalog for pricing or contact our team for custom quotes!";
    
    const lowerText = text.toLowerCase();
    if (lowerText.includes('price') || lowerText.includes('cost')) {
      reply = "Design packages start at ₦450k, smart mirrors ₦485k, lighting from ₦192k. For a precise quote, please contact our team!";
    } else if (lowerText.includes('design') || lowerText.includes('interior')) {
      reply = "Our interior design service transforms your space with bespoke furniture, lighting, and layout planning. Would you like to see our portfolio?";
    } else if (lowerText.includes('smart') || lowerText.includes('tech')) {
      reply = "We offer cutting-edge smart home devices: voice-controlled mirrors, ambient lighting systems, smart speakers, and more. Check our catalog!";
    }
    
    pfAddMessage('bot', reply);
  }, 600);
}

// Enter key support
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('pf-input');
  if (input) {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        pfSend();
      }
    });
  }
});