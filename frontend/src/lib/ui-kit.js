import { el } from './dom.js';

// подпружиниваем 80% повторяющихся мест
export const opt = (value, label) => { const o=document.createElement('option'); o.value=value; o.textContent=label; return o; };
export const select = (items, props={}) => { const s = el('select', props); items.forEach(([v,l])=>s.append(opt(v,l))); return s; };
export const row = (...children) => el('div', { class:'composer__row' }, ...children);
export const label = (forId, text) => el('label', { for: forId, textContent: text });
export const inputText = (id, ph, extra={}) => el('input', { id, type:'text', placeholder:ph, ...extra });
export const textArea  = (id, ph, extra={}) => { const t=document.createElement('textarea'); t.id=id; t.placeholder=ph; Object.assign(t,extra); return t; };
export const inputDate = (id, extra={}) => el('input', { id, type:'date', ...extra });