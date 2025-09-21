// Невидимые зоны автоскролла. Шлёт "dnd:auto-tick" на scrollContainer и на document.
export function enableAutoScrollZones(
  scrollContainer,
  { zoneHeight = 44, maxSpeed = 12, minSpeed = 3 } = {}
) {
  const topZone = document.createElement("div");
  const botZone = document.createElement("div");
  topZone.className = "scroll-zone scroll-zone--top";
  botZone.className = "scroll-zone scroll-zone--bottom";
  topZone.style.height = botZone.style.height = `${zoneHeight}px`;
  topZone.style.position = botZone.style.position = "sticky";
  topZone.style.top = "0";
  botZone.style.bottom = "0";
  topZone.style.pointerEvents = botZone.style.pointerEvents = "auto";

  scrollContainer.prepend(topZone);
  scrollContainer.append(botZone);

  let raf = null;
  let dir = 0; // -вверх, +вниз, 0 — стоп
  let active = false;
  let lastClientY = null;

  function step() {
    if (!dir) return;

    const maxUp = scrollContainer.scrollTop;
    const maxDown =
      scrollContainer.scrollHeight - scrollContainer.clientHeight - scrollContainer.scrollTop;

    const v = Math.max(minSpeed, Math.min(maxSpeed, Math.abs(dir)));
    if (dir < 0 && maxUp > 0) scrollContainer.scrollTop -= v;
    else if (dir > 0 && maxDown > 0) scrollContainer.scrollTop += v;
    else { stop(); return; }

    dispatchTick();
    raf = requestAnimationFrame(step);
  }

  function dispatchTick() {
    const ev = new CustomEvent("dnd:auto-tick", { detail: { lastClientY }, bubbles: false });
    scrollContainer.dispatchEvent(ev);   // локально на контейнер
    document.dispatchEvent(ev);          // дубль — глобально
  }

  function start(nextDir) {
    if (nextDir === 0) return stop();
    dir = nextDir;
    if (!raf) raf = requestAnimationFrame(step);
  }
  function stop() {
    dir = 0;
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  }

  function mapRange(v, inMin, inMax, outMin, outMax) {
    if (inMax === inMin) return outMin;
    const t = Math.min(1, Math.max(0, (v - inMin) / (inMax - inMin)));
    return outMin + (outMax - outMin) * t;
  }

  const onTopOver = (e) => {
    if (!active) return;
    e.preventDefault();
    lastClientY = e.clientY;
    const r = topZone.getBoundingClientRect();
    const speed = -mapRange(e.clientY, r.bottom, r.top, minSpeed, maxSpeed);
    start(speed);
    dispatchTick();
  };

  const onBotOver = (e) => {
    if (!active) return;
    e.preventDefault();
    lastClientY = e.clientY;
    const r = botZone.getBoundingClientRect();
    const speed = mapRange(e.clientY, r.top, r.bottom, minSpeed, maxSpeed);
    start(speed);
    dispatchTick();
  };

  const onDragEnter = () => { active = true; };
  const onDragLeave = () => { stop(); };
  const onAnyDrop = () => { stop(); active = false; lastClientY = null; };

  topZone.addEventListener("dragover", onTopOver);
  botZone.addEventListener("dragover", onBotOver);
  topZone.addEventListener("dragenter", onDragEnter);
  botZone.addEventListener("dragenter", onDragEnter);
  topZone.addEventListener("dragleave", onDragLeave);
  botZone.addEventListener("dragleave", onDragLeave);
  scrollContainer.addEventListener("drop", onAnyDrop);
  scrollContainer.addEventListener("dragend", onAnyDrop);

  return {
    cleanup() {
      stop();
      topZone.removeEventListener("dragover", onTopOver);
      botZone.removeEventListener("dragover", onBotOver);
      topZone.removeEventListener("dragenter", onDragEnter);
      botZone.removeEventListener("dragenter", onDragEnter);
      topZone.removeEventListener("dragleave", onDragLeave);
      botZone.removeEventListener("dragleave", onDragLeave);
      scrollContainer.removeEventListener("drop", onAnyDrop);
      scrollContainer.removeEventListener("dragend", onAnyDrop);
      topZone.remove();
      botZone.remove();
    },
  };
}